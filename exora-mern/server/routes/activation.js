// server/routes/activation.js
const express = require('express');
const axios = require('axios');
const qs = require('qs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { getCRMPool } = require('../config/crmDb');
const credentialMap = require('../services/credentialMap'); // Legacy fallback
const ProviderOrchestrator = require('../services/ProviderOrchestrator');
const ActivationSession = require('../models/ActivationSession');
const UserWorkflowInstance = require('../models/UserWorkflowInstance');
const OAuthTokens = require('../models/OAuthTokens');
const DashboardData = require('../models/DashboardData');

const router = express.Router();

// Get CRM database connection
const crmPool = getCRMPool();

// Debug: Log environment variables when this file loads
console.log('🔧 [activation.js] Loading with environment:');
console.log('   N8N_BASE_URL:', process.env.N8N_BASE_URL);
console.log('   N8N_API_KEY:', process.env.N8N_API_KEY ? process.env.N8N_API_KEY.substring(0, 20) + '...' : 'MISSING');

// helper: axios instance for n8n
const n8nBaseUrl = process.env.N8N_BASE_URL || 'MISSING_N8N_BASE_URL';
const n8nAxios = axios.create({
  baseURL: `${n8nBaseUrl}/api/v1`,
  headers: {
    'X-N8N-API-KEY': process.env.N8N_API_KEY,
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

console.log('🔧 [activation.js] n8n axios created with baseURL:', n8nAxios.defaults.baseURL);

// helper: build google auth url
function buildGoogleAuthUrl({ clientId, redirectUri, scopes, state }) {
  const scopeString = Array.isArray(scopes) ? scopes.join(' ') : String(scopes || '');
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    access_type: 'offline',
    include_granted_scopes: 'true',
    prompt: 'consent',
    scope: scopeString,
    state: state
  }).toString();

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

// route: compute required credential types and union scopes for a workflow
// NEW: Uses ProviderOrchestrator for dynamic detection with registry-based scope detection
router.post('/workflow-required-creds', async (req, res) => {
  try {
    const { workflowId } = req.body;
    if (!workflowId) {
      return res.status(400).json({ success: false, message: 'workflowId required' });
    }

    console.log(`[NEW] Fetching required credentials for workflow ${workflowId}`);

    // Fetch workflow from n8n
    const wfResp = await n8nAxios.get(`/workflows/${workflowId}`);
    const workflow = wfResp.data;
    
    // Use new ProviderOrchestrator for comprehensive detection
    const providers = ProviderOrchestrator.detectAllProvidersAndScopes(workflow);
    
    // Group by type for frontend
    const grouped = ProviderOrchestrator.groupProvidersByType(providers);
    
    console.log(`[NEW] Detected ${providers.length} providers:`, 
      providers.map(p => `${p.credentialType} (${p.type}${p.autoDetected ? ', auto' : ''})`));
    
    // Extract all scopes for backward compatibility
    const allScopes = [...new Set(
      providers.flatMap(p => p.scopes || [])
    )];

    res.json({
      success: true,
      // New structured response
      providers: providers,
      providersByType: grouped,
      // Backward compatible fields
      credentialTypes: providers.map(p => p.credentialType),
      oauthCredentialTypes: grouped.oauth2.map(p => p.credentialType),
      manualCredentialTypes: [...grouped.apikey, ...grouped.manual].map(p => p.credentialType),
      scopes: allScopes,
      // Metadata
      detectionMethod: 'registry',
      totalProviders: providers.length,
      autoDetectedCount: providers.filter(p => p.autoDetected).length
    });
  } catch (err) {
    console.error('workflow-required-creds error:', err.response?.data || err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch workflow or compute credentials',
      error: err.message
    });
  }
});

// route: begin activation / create session and return provider requirements
// NEW: Creates activation session for multi-provider flow
router.post('/activate-workflow', async (req, res) => {
  try {
    const { userId, workflowId } = req.body;
    
    if (!userId || !workflowId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId and workflowId required' 
      });
    }

    console.log(`[NEW] Initiating activation for user ${userId}, workflow ${workflowId}`);

    // Get workflow from n8n
    const wfResp = await n8nAxios.get(`/workflows/${workflowId}`);
    const workflow = wfResp.data;
    
    // Use new ProviderOrchestrator for comprehensive detection
    const providers = ProviderOrchestrator.detectAllProvidersAndScopes(workflow);
    
    if (providers.length === 0) {
      console.log('[NEW] No providers required for this workflow');
      return res.json({ 
        success: true, 
        requiresActivation: false,
        message: 'No OAuth or API credentials required for this workflow',
        providers: []
      });
    }

    // Create activation session in database
    const session = await ActivationSession.create({
      userId,
      workflowId,
      providersRequired: providers,
      sessionData: {
        workflowName: workflow.name,
        initiatedAt: new Date().toISOString()
      }
    });

    console.log(`[NEW] Created activation session ${session.id} with ${providers.length} providers`);

    // Group providers by type
    const grouped = ProviderOrchestrator.groupProvidersByType(providers);
    
    // NEW: Combine ALL Google OAuth providers into ONE unified OAuth flow
    const googleProviders = grouped.oauth2.filter(p => p.provider === 'google');
    
    if (googleProviders.length > 0) {
      // Combine all scopes from all Google providers
      const allScopes = new Set();
      const allCredentialTypes = [];
      
      googleProviders.forEach(provider => {
        allCredentialTypes.push(provider.credentialType);
        provider.scopes.forEach(scope => allScopes.add(scope));
      });

      // Create ONE OAuth URL with ALL combined scopes
      const state = JSON.stringify({
        sessionId: session.id,
        userId,
        workflowId,
        credentialTypes: allCredentialTypes, // Array of all credential types
        provider: 'google'
      });

      const unifiedAuthUrl = buildGoogleAuthUrl({
      clientId: process.env.GOOGLE_CLIENT_ID,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
        scopes: Array.from(allScopes), // All scopes combined
      state
    });

      console.log(`[NEW] Created unified OAuth URL for ${allCredentialTypes.length} Google providers`);
      console.log(`[NEW] Combined scopes: ${Array.from(allScopes).join(', ')}`);

      // Attach the SAME authorizationUrl to ALL Google providers
      grouped.oauth2 = grouped.oauth2.map(provider => {
        if (provider.provider === 'google') {
          return {
            ...provider,
            authorizationUrl: unifiedAuthUrl
          };
        }
        return {
          ...provider,
          authorizationUrl: null,
          error: 'Provider not yet supported'
        };
      });
    }

    res.json({ 
      success: true, 
      requiresActivation: true,
      sessionId: session.id,
      providers: providers,
      providersByType: {
        oauth2: grouped.oauth2,
        apikey: grouped.apikey,
        manual: grouped.manual
      },
      totalProviders: providers.length,
      unifiedOAuth: googleProviders.length > 0, // Flag indicating unified OAuth
      message: 'Multi-provider activation session created'
    });
  } catch (err) {
    console.error('activate-workflow error:', err.response?.data || err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to initiate activation',
      error: err.message
    });
  }
});

// helper: exchange code for tokens
async function exchangeCodeForTokens(code) {
  console.log('Exchanging authorization code for tokens...');
  
  const body = qs.stringify({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code'
  });
  
  const r = await axios.post('https://oauth2.googleapis.com/token', body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 15000
  });
  
  console.log('Successfully obtained tokens from Google');
  return r.data;
}

// helper: create n8n credential for a credType using tokens
async function createN8nCredential(credType, tokens, displayName) {
  console.log(`Creating n8n credential: ${displayName} (type: ${credType})`);
  
  // Build scopes from credentialMap
  const scopes = credentialMap[credType] || [];
  const scopeString = scopes.join(' ');
  
  const body = {
    name: displayName,
    type: credType,
    data: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      sendAdditionalBodyProperties: false,
      additionalBodyProperties: "",
      oauthTokenData: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        scope: tokens.scope || scopeString,  // ✅ scope only here, not at top level
        token_type: tokens.token_type || 'Bearer',
        expires_in: tokens.expires_in || 3600,
        expiry_date: tokens.expires_in 
          ? Date.now() + (tokens.expires_in * 1000) 
          : Date.now() + (3600 * 1000)
      }
    }
  };

  console.log(`Credential body for ${credType}:`, JSON.stringify(body, null, 2));

  const resp = await n8nAxios.post('/credentials', body);
  
  // Extract id flexibly (n8n response varies by version)
  const created = resp.data;
  const createdId = created?.id || 
                    created?.data?.id || 
                    created?.credential?.id || 
                    (Array.isArray(created) && created[0]?.id);
  
  if (!createdId) {
    console.error('Failed to extract credential ID from n8n response:', created);
    throw new Error(`Could not extract credential ID for ${credType}`);
  }
  
  console.log(`✓ Created credential ${displayName} with ID: ${createdId}`);
  return { createdId, raw: created };
}

// helper: inject credentials map into workflow JSON and return new workflow object
function injectCredentialsIntoWorkflow(templateWorkflow, credMap, userLabel) {
  console.log(`Injecting credentials into workflow for ${userLabel}`);
  
  const wf = JSON.parse(JSON.stringify(templateWorkflow)); // deep copy
  
  // Inject credentials into nodes and sanitize
  let injectCount = 0;
  const allowedNodeKeys = [
    'id', 'name', 'type', 'typeVersion', 'position', 'parameters', 'credentials'
  ];

  const cleanedNodes = (wf.nodes || []).map((node) => {
    const cleanNode = {};

    // Keep only allowed properties
    for (const key of allowedNodeKeys) {
      if (node[key] !== undefined) {
        cleanNode[key] = node[key];
      }
    }

    // Ensure credentials object exists
    if (!cleanNode.credentials) cleanNode.credentials = {};

    // Inject credential references where applicable
    if (node.credentials) {
      Object.keys(node.credentials).forEach(credType => {
        if (credMap[credType]) {
          cleanNode.credentials[credType] = {
            id: credMap[credType],
            name: `${userLabel}-${credType}`
          };
          injectCount++;
          console.log(`  Injected ${credType} credential into node ${node.name || node.type}`);
        }
      });
    }

    return cleanNode;
  });

  console.log(`✓ Injected ${injectCount} credential references`);
  
  // Sanitize read-only fields (future-proof for n8n API changes)
  delete wf.id;
  delete wf.versionId;
  delete wf.meta;
  delete wf.active;
  delete wf.tags;
  
  // Return ONLY the fields n8n accepts for workflow creation
  // See: https://docs.n8n.io/api/v1/#tag/Workflow/operation/createWorkflow
  // Note: In n8n 1.60+, 'active' and 'tags' are read-only
  return {
    name: `${userLabel} — ${wf.name || 'Cloned Workflow'}`,
    nodes: cleanedNodes,
    connections: wf.connections || {},
    settings: wf.settings || {},
    staticData: wf.staticData || null
  };
}

// In-memory cache to track processed callbacks and prevent duplicates
const processedCallbacks = new Map();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  for (const [key, timestamp] of processedCallbacks.entries()) {
    if (timestamp < fiveMinutesAgo) {
      processedCallbacks.delete(key);
    }
  }
}, 5 * 60 * 1000);

// callback route - receives code & state; creates credentials, clones & activates workflow
// NEW: Multi-provider session-based callback handler
router.get('/oauth2/callback', async (req, res) => {
  const callbackId = `${req.query.code || 'error'}-${req.query.state || 'nostate'}`;
  
  // Check if we've already processed this exact callback recently (within 30 seconds)
  if (processedCallbacks.has(callbackId)) {
    const timeSinceProcessed = Date.now() - processedCallbacks.get(callbackId);
    if (timeSinceProcessed < 30000) {
      console.log(`⚠️ Duplicate callback detected (${timeSinceProcessed}ms ago), ignoring...`);
      return res.send('<html><body><h2>Callback already processed. You can close this window.</h2></body></html>');
    }
  }
  
  // Mark this callback as processed
  processedCallbacks.set(callbackId, Date.now());
  
  console.log('\n========== [NEW] OAuth2 Callback Received ==========');
  
  try {
    const { code, state, error } = req.query;
    
    // Handle OAuth errors (user denied consent, etc.)
    if (error) {
      console.error('OAuth error from Google:', error);
      // STOP the redirect loop - just show an error page
      return res.send(`
        <html>
          <head><title>Authorization Cancelled</title></head>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h2>❌ Authorization Cancelled</h2>
            <p>You cancelled the Google OAuth authorization.</p>
            <p><a href="${process.env.FRONTEND_URL}/dashboard" style="color: #667eea; text-decoration: none; font-weight: bold;">← Return to Dashboard</a></p>
            <script>
              // Auto-redirect after 3 seconds
              setTimeout(() => {
                window.location.href = '${process.env.FRONTEND_URL}/dashboard';
              }, 3000);
            </script>
          </body>
        </html>
      `);
    }
    
    if (!code || !state) {
      console.error('Missing code or state parameter');
      return res.send(`
        <html>
          <head><title>Invalid Callback</title></head>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h2>❌ Invalid OAuth Callback</h2>
            <p>Missing required parameters.</p>
            <p><a href="${process.env.FRONTEND_URL}/dashboard" style="color: #667eea; text-decoration: none; font-weight: bold;">← Return to Dashboard</a></p>
            <script>
              setTimeout(() => {
                window.location.href = '${process.env.FRONTEND_URL}/dashboard';
              }, 3000);
            </script>
          </body>
        </html>
      `);
    }

    // Parse state (now includes sessionId)
    let parsed;
    try {
      parsed = JSON.parse(state);
    } catch (parseErr) {
      console.error('Failed to parse state:', parseErr);
      return res.send(`
        <html>
          <head><title>Invalid State</title></head>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <div style="max-width: 500px; margin: 0 auto;">
              <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
              <h2>Invalid OAuth State</h2>
              <p>The OAuth state parameter could not be parsed.</p>
              <p><a href="${process.env.FRONTEND_URL}/dashboard" style="color: #667eea; text-decoration: none; font-weight: bold;">← Return to Dashboard</a></p>
              <script>
                setTimeout(() => {
                  window.location.href = '${process.env.FRONTEND_URL}/dashboard';
                }, 3000);
              </script>
            </body>
          </html>
        </html>
      `);
    }
    
    const { sessionId, userId, workflowId, credentialType, credentialTypes, provider, isCRM } = parsed;
    
    // ====================================================================================
    // CRM SPECIAL FLOW: Skip credential collection, just clone and redirect
    // ====================================================================================
    if (isCRM) {
      console.log('\n========== [CRM] SIMPLIFIED ACTIVATION FLOW ==========');
      console.log('[CRM] Skipping credential collection - user will configure manually later');
      
      try {
        // Load activation session
        const session = await ActivationSession.findById(sessionId);
        if (!session) {
          return res.send(`
            <html>
              <head><title>Session Expired</title></head>
              <body style="font-family: Arial; text-align: center; padding: 50px;">
                <div style="max-width: 500px; margin: 0 auto;">
                  <div style="font-size: 64px; margin-bottom: 20px;">⏰</div>
                  <h2>Session Expired</h2>
                  <p>Please try activating CRM again from dashboard.</p>
                  <p><a href="${process.env.FRONTEND_URL}/dashboard" style="color: #667eea; text-decoration: none; font-weight: bold;">← Return to Dashboard</a></p>
                </div>
              </body>
            </html>
          `);
        }

        // Fetch template workflow from n8n
        console.log('[CRM] Fetching template workflow from n8n...');
        const templateResp = await n8nAxios.get(`/workflows/${workflowId}`);
        const templateWorkflow = templateResp.data?.data || templateResp.data;

        // Clone workflow WITHOUT credentials (user will add them manually later)
        console.log('[CRM] Cloning workflow WITHOUT credentials...');
        const userLabel = req.user?.email?.split('@')[0] || `user${userId}`;
        const newWorkflowPayload = {
          ...templateWorkflow,
          name: `${templateWorkflow.name} - ${userLabel}`,
          active: false,  // Keep inactive until user configures credentials
          id: undefined
        };

        const createWfResp = await n8nAxios.post('/workflows', newWorkflowPayload);
        const createdWf = createWfResp.data;
        const clonedWorkflowId = createdWf?.id || createdWf?.data?.id || createdWf?.workflow?.id;

        if (!clonedWorkflowId) {
          console.error('[CRM] Failed to create cloned workflow');
          return res.send(`
            <html>
              <head><title>CRM Setup Failed</title></head>
              <body style="font-family: Arial; text-align: center; padding: 50px;">
                <div style="max-width: 500px; margin: 0 auto;">
                  <div style="font-size: 64px; margin-bottom: 20px;">❌</div>
                  <h2>CRM Setup Failed</h2>
                  <p>Could not clone workflow. Please try again.</p>
                  <p><a href="${process.env.FRONTEND_URL}/dashboard" style="color: #667eea; text-decoration: none; font-weight: bold;">← Return to Dashboard</a></p>
                </div>
              </body>
            </html>
          `);
        }

        console.log(`[CRM] ✓ Cloned workflow ID: ${clonedWorkflowId}`);

        // Save to database
        console.log('[CRM] Saving workflow mapping...');
        await UserWorkflowInstance.upsert({
          userId: userId,
          sourceWorkflowId: workflowId,
          instanceWorkflowId: clonedWorkflowId,
          activated_at: new Date(),
          services_used: [],  // Will be filled when user configures
          credential_id: '',
          n8n_credential_ids: {}
        });

        // Create CRM user record
        console.log('[CRM] Creating CRM user record...');
        await crmPool.query(
          `INSERT INTO crm_users (exora_user_id, n8n_workflow_id, status)
           VALUES ($1, $2, 'pending_setup')
           ON CONFLICT (exora_user_id) DO UPDATE SET n8n_workflow_id = $2, status = 'pending_setup'`,
          [userId, clonedWorkflowId]
        );

        // Update dashboard status
        await DashboardData.updateWorkflowStatus(userId, workflowId, 'active');

        // Generate JWT for CRM
        const crmToken = jwt.sign(
          { id: userId, email: req.user?.email || 'user@example.com' },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );

        const CRM_FRONTEND_URL = process.env.CRM_FRONTEND_URL || 'http://localhost:3001';

        console.log('[CRM] ✅ CRM activation complete! Redirecting to CRM...');
        console.log('====================================================\n');

        // Redirect to CRM - user will configure credentials there
        return res.send(`
          <html>
            <head><title>CRM Activated</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
              <div style="max-width: 500px; margin: 0 auto;">
                <div style="font-size: 64px; margin-bottom: 20px;">✅</div>
                <h2>CRM Activated Successfully!</h2>
                <p>Your workflow has been cloned.</p>
                <p style="color: #6c757d;">You can configure credentials in the CRM settings later.</p>
                <p style="color: #6c757d;">Redirecting to CRM...</p>
              </div>
              <script>
                setTimeout(() => {
                  window.location.href = '${CRM_FRONTEND_URL}?token=${crmToken}&setup=true';
                }, 2000);
              </script>
            </body>
          </html>
        `);

      } catch (crmErr) {
        console.error('[CRM] Activation error:', crmErr);
        return res.send(`
          <html>
            <head><title>CRM Setup Failed</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
              <div style="max-width: 500px; margin: 0 auto;">
                <div style="font-size: 64px; margin-bottom: 20px;">❌</div>
                <h2>CRM Setup Failed</h2>
                <p>${crmErr.message}</p>
                <p><a href="${process.env.FRONTEND_URL}/dashboard" style="color: #667eea; text-decoration: none; font-weight: bold;">← Return to Dashboard</a></p>
              </div>
            </body>
          </html>
        `);
      }
    }
    // ====================================================================================
    // END CRM SPECIAL FLOW
    // ====================================================================================
    
    // Support both single credentialType (legacy) and credentialTypes array (new unified flow)
    const typesToCreate = credentialTypes || (credentialType ? [credentialType] : []);
    
    if (!sessionId || !userId || !workflowId) {
      console.error('Missing sessionId, userId or workflowId in state');
      return res.send(`
        <html>
          <head><title>Invalid Callback Data</title></head>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <div style="max-width: 500px; margin: 0 auto;">
              <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
              <h2>Invalid Callback Data</h2>
              <p>Required session information is missing.</p>
              <p><a href="${process.env.FRONTEND_URL}/dashboard" style="color: #667eea; text-decoration: none; font-weight: bold;">← Return to Dashboard</a></p>
              <script>
                setTimeout(() => {
                  window.location.href = '${process.env.FRONTEND_URL}/dashboard';
                }, 3000);
              </script>
            </body>
          </html>
        `);
    }

    console.log(`[NEW] Processing OAuth callback for session ${sessionId}`);
    console.log(`Provider: ${provider}`);
    console.log(`Credential Types to create: ${typesToCreate.join(', ')}`);

    // Load activation session
    const session = await ActivationSession.findById(sessionId);
    if (!session) {
      console.error(`Session ${sessionId} not found or expired`);
      return res.send(`
        <html>
          <head><title>Session Expired</title></head>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <div style="max-width: 500px; margin: 0 auto;">
              <div style="font-size: 64px; margin-bottom: 20px;">⏰</div>
              <h2>Session Expired</h2>
              <p>Your activation session has expired. Please start the activation process again.</p>
              <p><a href="${process.env.FRONTEND_URL}/dashboard" style="color: #667eea; text-decoration: none; font-weight: bold;">← Return to Dashboard</a></p>
              <script>
                setTimeout(() => {
                  window.location.href = '${process.env.FRONTEND_URL}/dashboard';
                }, 3000);
              </script>
            </body>
          </html>
        `);
    }

    // Step 1: Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(code);

    if (!tokens || !tokens.access_token) {
      console.error('No access token returned from Google', tokens);
      return res.send(`
        <html>
          <head><title>Token Exchange Failed</title></head>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <div style="max-width: 500px; margin: 0 auto;">
              <div style="font-size: 64px; margin-bottom: 20px;">🔒</div>
              <h2>Token Exchange Failed</h2>
              <p>Failed to obtain access token from Google. Please try again.</p>
              <p><a href="${process.env.FRONTEND_URL}/dashboard" style="color: #667eea; text-decoration: none; font-weight: bold;">← Return to Dashboard</a></p>
              <script>
                setTimeout(() => {
                  window.location.href = '${process.env.FRONTEND_URL}/dashboard';
                }, 3000);
              </script>
            </body>
          </html>
        `);
    }

    // Step 2: Store OAuth tokens in database
    console.log('\n[NEW] Step 2: Storing OAuth tokens...');
    await OAuthTokens.upsert({
      userId: userId,
      workflowId: workflowId,
      provider: provider || 'google',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
      scope: tokens.scope
    });
    console.log('✓ OAuth tokens stored');

    // Step 3: Create ALL n8n credentials from the SAME OAuth tokens
    console.log(`\n[NEW] Step 3: Creating ${typesToCreate.length} n8n credentials from unified OAuth...`);
    const userLabel = `user-${userId}`;
    const credMap = {};
    
    for (const credType of typesToCreate) {
      try {
        const displayName = `${userLabel}-${credType}-${Date.now()}`;
        const result = await createN8nCredential(credType, tokens, displayName);
        const credentialId = result?.createdId;
        
        if (credentialId) {
          credMap[credType] = credentialId;
          console.log(`✓ Created credential ${displayName} with ID: ${credentialId}`);
          
          // Mark this provider as completed in session
          await ActivationSession.markProviderCompleted(sessionId, credType, {
            credentialId,
            provider: provider || 'google'
          });
        }
      } catch (err) {
        console.error(`Error creating credential ${credType}:`, err.response?.data || err.message);
        // Continue with other credentials even if one fails
      }
    }

    if (Object.keys(credMap).length === 0) {
      console.error('Failed to create any credentials');
      return res.send(`
        <html>
          <head><title>Credential Creation Failed</title></head>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <div style="max-width: 500px; margin: 0 auto;">
              <div style="font-size: 64px; margin-bottom: 20px;">🔑</div>
              <h2>Credential Creation Failed</h2>
              <p>Failed to create credentials in n8n. Please check your n8n API configuration.</p>
              <p><a href="${process.env.FRONTEND_URL}/dashboard" style="color: #667eea; text-decoration: none; font-weight: bold;">← Return to Dashboard</a></p>
              <script>
                setTimeout(() => {
                  window.location.href = '${process.env.FRONTEND_URL}/dashboard';
                }, 4000);
              </script>
            </body>
          </html>
        `);
    }

    console.log(`\n[NEW] ✓ Created ${Object.keys(credMap).length} credentials successfully`);
    
    // Store credential mapping in session data
    await ActivationSession.updateSessionData(sessionId, { credentialMap: credMap });

    // Step 4: Check if all providers are completed
    const remaining = await ActivationSession.getRemainingProviders(sessionId);
    
    if (remaining.length > 0) {
      console.log(`\n[NEW] Remaining providers: ${remaining.map(p => p.credentialType).join(', ')}`);
      console.log(`Redirecting to frontend for next provider...`);
      return res.send(`
        <html>
          <head><title>Provider Connected</title></head>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <div style="max-width: 500px; margin: 0 auto;">
              <div style="font-size: 64px; margin-bottom: 20px;">⚡</div>
              <h2>Provider Connected!</h2>
              <p>${remaining.length} more provider${remaining.length !== 1 ? 's' : ''} to connect...</p>
              <p style="color: #6c757d;">Returning to activation wizard...</p>
            </div>
            <script>
              setTimeout(() => {
                window.location.href = '${process.env.FRONTEND_URL}/dashboard?resumeActivation=true';
              }, 1500);
            </script>
          </body>
        </html>
      `);
    }

    console.log(`\n[NEW] ✓ All providers completed! Proceeding with workflow activation...`);

    // Step 6: Get template workflow from n8n
    console.log('\n[NEW] Step 6: Fetching template workflow from n8n...');
    const wfResp = await n8nAxios.get(`/workflows/${workflowId}`);
    const templateWorkflow = wfResp.data;
    console.log(`✓ Fetched template workflow: ${templateWorkflow.name}`);

    // Step 7: Get credential mapping from session
    const finalSession = await ActivationSession.findById(sessionId);
    const finalCredMap = finalSession.sessionData?.credentialMap || {};
    console.log('Credential map:', finalCredMap);

    // Step 8: Inject credentials into a clone of the workflow
    console.log('\n[NEW] Step 8: Cloning workflow and injecting credentials...');
    const newWorkflowPayload = injectCredentialsIntoWorkflow(templateWorkflow, finalCredMap, userLabel);

    // Step 9: Create cloned workflow in n8n
    console.log('\n[NEW] Step 9: Creating cloned workflow in n8n...');
    const createWfResp = await n8nAxios.post('/workflows', newWorkflowPayload);
    const createdWf = createWfResp.data;
    const clonedWorkflowId = createdWf?.id || 
                             createdWf?.data?.id || 
                             createdWf?.workflow?.id;

    if (!clonedWorkflowId) {
      console.error('Failed to create cloned workflow. Response:', createWfResp.data);
      return res.send(`
        <html>
          <head><title>Workflow Creation Failed</title></head>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <div style="max-width: 500px; margin: 0 auto;">
              <div style="font-size: 64px; margin-bottom: 20px;">⚙️</div>
              <h2>Workflow Creation Failed</h2>
              <p>Failed to clone the workflow in n8n. Please check n8n API logs.</p>
              <p><a href="${process.env.FRONTEND_URL}/dashboard" style="color: #667eea; text-decoration: none; font-weight: bold;">← Return to Dashboard</a></p>
              <script>
                setTimeout(() => {
                  window.location.href = '${process.env.FRONTEND_URL}/dashboard';
                }, 4000);
              </script>
            </body>
          </html>
        `);
    }

    console.log(`✓ Created cloned workflow with ID: ${clonedWorkflowId}`);

    // Step 10: Activate the cloned workflow
    console.log('\n[NEW] Step 10: Activating cloned workflow...');
    
    // Use dedicated activation endpoint (POST /workflows/:id/activate)
    // Note: 'active' is read-only in PUT, must use activation endpoint
    try {
      await n8nAxios.post(`/workflows/${clonedWorkflowId}/activate`);
      console.log(`✓ Activated workflow ${clonedWorkflowId}`);
    } catch (activationErr) {
      // Fallback: try PATCH if POST activate doesn't exist
      console.log('POST activate failed, trying PATCH...');
      await n8nAxios.patch(`/workflows/${clonedWorkflowId}/activate`);
      console.log(`✓ Activated workflow ${clonedWorkflowId}`);
    }

    // Step 11: Persist workflow mapping in database
    console.log('\n[NEW] Step 11: Persisting workflow mapping in database...');
    const credentialIds = Object.values(finalCredMap).filter(Boolean);
    await UserWorkflowInstance.upsert({
      userId: userId,
      sourceWorkflowId: workflowId,  // Template workflow ID
      instanceWorkflowId: clonedWorkflowId,  // User's cloned instance
      activated_at: new Date(),
      services_used: Object.keys(finalCredMap),
      credential_id: credentialIds.join(','),
      n8n_credential_ids: finalCredMap // Store the full mapping
    });
    console.log('✓ Workflow mapping stored');

    // Step 12: Update workflow status in dashboard
    console.log('\n[NEW] Step 12: Updating workflow status in dashboard...');
    try {
      const statusUpdated = await DashboardData.updateWorkflowStatus(userId, workflowId, 'active');
      if (statusUpdated) {
        console.log('✓ Dashboard workflow status updated to active');
      } else {
        console.warn('⚠️ Warning: Workflow not found in dashboard. User may need to refresh or re-add workflow to dashboard.');
      }
    } catch (statusErr) {
      console.error('⚠️ Warning: Failed to update dashboard status:', statusErr.message);
      // Don't fail the whole activation if status update fails
    }

    // Step 13: Cleanup activation session
    console.log('\n[NEW] Step 13: Cleaning up activation session...');
    await ActivationSession.updateStatus(sessionId, 'completed');
    // Session will be auto-deleted by cleanup job after 1 hour
    console.log('✓ Session marked as completed');

    console.log('\n========== [NEW] Activation Complete ==========');
    console.log('Summary:');
    console.log(`  User: ${userId}`);
    console.log(`  Session: ${sessionId}`);
    console.log(`  Template Workflow: ${workflowId}`);
    console.log(`  Cloned Workflow: ${clonedWorkflowId}`);
    console.log(`  Credentials Created: ${Object.keys(finalCredMap).length}`);
    console.log(`  Credential Map:`, finalCredMap);
    console.log('===========================================\n');

    // Step 14: CRM handling is done earlier in the flow (see line ~469)
    // This section is now only for regular workflows

    // Step 14 (for regular workflows): Show success page and redirect (prevent loop)
    return res.send(`
      <html>
        <head><title>Activation Complete</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <div style="max-width: 500px; margin: 0 auto;">
            <div style="font-size: 64px; margin-bottom: 20px;">✅</div>
            <h2>Workflow Activated!</h2>
            <p><strong>${templateWorkflow.name}</strong> is now active and running.</p>
            <p style="color: #6c757d;">Redirecting to dashboard...</p>
          </div>
          <script>
            setTimeout(() => {
              window.location.href = '${process.env.FRONTEND_URL}/dashboard?workflowActivated=true&workflowId=${clonedWorkflowId}&workflowName=${encodeURIComponent(templateWorkflow.name)}';
            }, 2000);
          </script>
        </body>
      </html>
    `);
    
  } catch (err) {
    console.error('\n========== [NEW] Activation Failed ==========');
    console.error('Error:', err.response?.data || err.message);
    console.error('Stack:', err.stack);
    console.error('=======================================\n');
    
    const errorMsg = err.message || 'activation_failed';
    return res.send(`
      <html>
        <head><title>Activation Failed</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <div style="max-width: 500px; margin: 0 auto;">
            <div style="font-size: 64px; margin-bottom: 20px;">❌</div>
            <h2>Activation Failed</h2>
            <p style="color: #dc3545; font-weight: 600;">${errorMsg}</p>
            <p style="color: #6c757d;">Please try again or contact support if the issue persists.</p>
            <p><a href="${process.env.FRONTEND_URL}/dashboard" style="color: #667eea; text-decoration: none; font-weight: bold;">← Return to Dashboard</a></p>
            <script>
              setTimeout(() => {
                window.location.href = '${process.env.FRONTEND_URL}/dashboard';
              }, 5000);
            </script>
          </body>
        </html>
      `);
  }
});

module.exports = router;
