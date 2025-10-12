// server/routes/activation.js
const express = require('express');
const axios = require('axios');
const qs = require('qs');
const credentialMap = require('../services/credentialMap'); // Legacy fallback
const ProviderOrchestrator = require('../services/ProviderOrchestrator');
const ActivationSession = require('../models/ActivationSession');
const UserWorkflowInstance = require('../models/UserWorkflowInstance');
const OAuthTokens = require('../models/OAuthTokens');
const DashboardData = require('../models/DashboardData');

const router = express.Router();

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
    
    // Generate OAuth URLs for OAuth2 providers
    const oauthProviders = grouped.oauth2.map(provider => {
      // For now, only Google OAuth is supported
      if (provider.provider === 'google') {
        const state = JSON.stringify({
          sessionId: session.id,
          userId,
          workflowId,
          credentialType: provider.credentialType,
          provider: provider.provider
        });

        const authUrl = buildGoogleAuthUrl({
          clientId: process.env.GOOGLE_CLIENT_ID,
          redirectUri: process.env.GOOGLE_REDIRECT_URI,
          scopes: provider.scopes,
          state
        });

        return {
          ...provider,
          authorizationUrl: authUrl
        };
      }
      
      return {
        ...provider,
        authorizationUrl: null,
        error: 'Provider not yet supported'
      };
    });

    res.json({ 
      success: true,
      requiresActivation: true,
      sessionId: session.id,
      providers: providers,
      providersByType: {
        oauth2: oauthProviders,
        apikey: grouped.apikey,
        manual: grouped.manual
      },
      totalProviders: providers.length,
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

// callback route - receives code & state; creates credentials, clones & activates workflow
// NEW: Multi-provider session-based callback handler
router.get('/oauth2/callback', async (req, res) => {
  console.log('\n========== [NEW] OAuth2 Callback Received ==========');
  
  try {
    const { code, state, error } = req.query;
    
    // Handle OAuth errors (user denied consent, etc.)
    if (error) {
      console.error('OAuth error from Google:', error);
      const redirectUrl = `${process.env.FRONTEND_URL}/oauth/callback?error=oauth_denied&details=${encodeURIComponent(error)}`;
      return res.redirect(302, redirectUrl);
    }
    
    if (!code || !state) {
      console.error('Missing code or state parameter');
      const redirectUrl = `${process.env.FRONTEND_URL}/oauth/callback?error=missing_params`;
      return res.redirect(302, redirectUrl);
    }

    // Parse state (now includes sessionId)
    let parsed;
    try {
      parsed = JSON.parse(state);
    } catch (parseErr) {
      console.error('Failed to parse state:', parseErr);
      const redirectUrl = `${process.env.FRONTEND_URL}/oauth/callback?error=invalid_state`;
      return res.redirect(302, redirectUrl);
    }
    
    const { sessionId, userId, workflowId, credentialType, provider } = parsed;
    
    if (!sessionId || !userId || !workflowId) {
      console.error('Missing sessionId, userId or workflowId in state');
      const redirectUrl = `${process.env.FRONTEND_URL}/oauth/callback?error=invalid_state_data`;
      return res.redirect(302, redirectUrl);
    }

    console.log(`[NEW] Processing OAuth callback for session ${sessionId}`);
    console.log(`Provider: ${provider}, Credential Type: ${credentialType}`);

    // Load activation session
    const session = await ActivationSession.findById(sessionId);
    if (!session) {
      console.error(`Session ${sessionId} not found or expired`);
      const redirectUrl = `${process.env.FRONTEND_URL}/oauth/callback?error=session_expired`;
      return res.redirect(302, redirectUrl);
    }

    // Step 1: Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(code);

    if (!tokens || !tokens.access_token) {
      console.error('No access token returned from Google', tokens);
      const redirectUrl = `${process.env.FRONTEND_URL}/oauth/callback?error=token_exchange_failed&sessionId=${sessionId}`;
      return res.redirect(302, redirectUrl);
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

    // Step 3: Create credential in n8n for this provider
    console.log(`\n[NEW] Step 3: Creating n8n credential for ${credentialType}...`);
    const userLabel = `user-${userId}`;
    const displayName = `${userLabel}-${credentialType}-${Date.now()}`;
    
    let credentialId = null;
    try {
      const result = await createN8nCredential(credentialType, tokens, displayName);
      credentialId = result?.createdId;
      console.log(`✓ Created credential ${displayName} with ID: ${credentialId}`);
    } catch (err) {
      console.error(`Error creating credential ${credentialType}:`, err.response?.data || err.message);
      const redirectUrl = `${process.env.FRONTEND_URL}/oauth/callback?error=credential_creation_failed&sessionId=${sessionId}`;
      return res.redirect(302, redirectUrl);
    }

    // Step 4: Mark this provider as completed in session
    console.log(`\n[NEW] Step 4: Marking provider ${credentialType} as completed...`);
    const updatedSession = await ActivationSession.markProviderCompleted(sessionId, credentialType, {
      credentialId,
      provider
    });
    
    // Store credential mapping in session data
    const sessionData = updatedSession.sessionData || {};
    const credMap = sessionData.credentialMap || {};
    credMap[credentialType] = credentialId;
    await ActivationSession.updateSessionData(sessionId, { credentialMap: credMap });

    // Step 5: Check if all providers are completed
    const remaining = await ActivationSession.getRemainingProviders(sessionId);
    
    if (remaining.length > 0) {
      console.log(`\n[NEW] Remaining providers: ${remaining.map(p => p.credentialType).join(', ')}`);
      console.log(`Redirecting to frontend for next provider...`);
      const redirectUrl = `${process.env.FRONTEND_URL}/oauth/callback?success=partial&sessionId=${sessionId}&remaining=${remaining.length}`;
      return res.redirect(302, redirectUrl);
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
      const redirectUrl = `${process.env.FRONTEND_URL}/oauth/callback?error=workflow_creation_failed&sessionId=${sessionId}`;
      return res.redirect(302, redirectUrl);
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

    // Step 14: Redirect back to frontend with success
    const redirectUrl = `${process.env.FRONTEND_URL}/oauth/callback?success=complete&sessionId=${sessionId}&workflowId=${clonedWorkflowId}&workflowName=${encodeURIComponent(templateWorkflow.name)}`;
    return res.redirect(302, redirectUrl);
    
  } catch (err) {
    console.error('\n========== [NEW] Activation Failed ==========');
    console.error('Error:', err.response?.data || err.message);
    console.error('Stack:', err.stack);
    console.error('=======================================\n');
    
    const errorMsg = encodeURIComponent(err.message || 'activation_failed');
    const sessionParam = parsed?.sessionId ? `&sessionId=${parsed.sessionId}` : '';
    const redirectUrl = `${process.env.FRONTEND_URL}/oauth/callback?error=activation_failed&details=${errorMsg}${sessionParam}`;
    return res.redirect(302, redirectUrl);
  }
});

module.exports = router;
