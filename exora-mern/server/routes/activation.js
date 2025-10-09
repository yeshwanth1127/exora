// server/routes/activation.js
const express = require('express');
const axios = require('axios');
const qs = require('qs');
const credentialMap = require('../services/credentialMap');
const UserWorkflowInstance = require('../models/UserWorkflowInstance');
const OAuthTokens = require('../models/OAuthTokens');

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
router.post('/workflow-required-creds', async (req, res) => {
  try {
    const { workflowId } = req.body;
    if (!workflowId) {
      return res.status(400).json({ success: false, message: 'workflowId required' });
    }

    console.log(`Fetching required credentials for workflow ${workflowId}`);

    // Fetch workflow from n8n
    const wfResp = await n8nAxios.get(`/workflows/${workflowId}`);
    const workflow = wfResp.data;
    
    // Extract unique credential types from all nodes
    const credSet = new Set();
    (workflow.nodes || []).forEach(node => {
      if (node.credentials) {
        Object.keys(node.credentials).forEach(k => credSet.add(k));
      }
    });

    const credentialTypes = [...credSet];

    // Compute union of scopes for OAuth credential types
    const scopeSet = new Set();
    const oauthCredTypes = [];
    const manualCredTypes = [];
    
    credentialTypes.forEach(ct => {
      const scopes = credentialMap[ct];
      if (scopes && Array.isArray(scopes) && scopes.length > 0) {
        scopes.forEach(s => scopeSet.add(s));
        oauthCredTypes.push(ct);
      } else {
        manualCredTypes.push(ct);
      }
    });

    console.log(`Found ${credentialTypes.length} credential types:`, credentialTypes);
    console.log(`OAuth types: ${oauthCredTypes.length}, Manual types: ${manualCredTypes.length}`);

    res.json({
      success: true,
      credentialTypes,
      oauthCredentialTypes: oauthCredTypes,
      manualCredentialTypes: manualCredTypes,
      scopes: [...scopeSet]
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

// route: begin activation / get OAuth URL
router.post('/activate-workflow', async (req, res) => {
  try {
    const { userId, workflowId } = req.body;
    
    if (!userId || !workflowId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId and workflowId required' 
      });
    }

    console.log(`Initiating activation for user ${userId}, workflow ${workflowId}`);

    // Get workflow and required scopes
    const wfResp = await n8nAxios.get(`/workflows/${workflowId}`);
    const workflow = wfResp.data;
    
    const credSet = new Set();
    (workflow.nodes || []).forEach(node => {
      if (node.credentials) {
        Object.keys(node.credentials).forEach(k => credSet.add(k));
      }
    });
    const credentialTypes = [...credSet];

    // Build union of scopes for those credential types using credentialMap
    const scopeSet = new Set();
    const oauthCredTypes = [];
    
    credentialTypes.forEach(ct => {
      const scopes = credentialMap[ct];
      if (scopes && Array.isArray(scopes)) {
        scopes.forEach(s => scopeSet.add(s));
        oauthCredTypes.push(ct);
      }
    });

    // If no OAuth credential types found, respond that no OAuth required
    if (scopeSet.size === 0) {
      console.log('No OAuth credentials required for this workflow');
      return res.json({ 
        success: true, 
        authorizationUrl: null, 
        message: 'No OAuth credentials required for this workflow', 
        credentialTypes 
      });
    }

    const scopes = [...scopeSet];
    const state = JSON.stringify({ userId, workflowId, credentialTypes: oauthCredTypes });

    const authorizationUrl = buildGoogleAuthUrl({
      clientId: process.env.GOOGLE_CLIENT_ID,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
      scopes,
      state
    });

    console.log(`Generated OAuth URL for user ${userId}`);
    console.log(`Required scopes: ${scopes.join(', ')}`);
    console.log(`OAuth credential types: ${oauthCredTypes.join(', ')}`);

    res.json({ 
      success: true, 
      authorizationUrl, 
      message: 'Redirect user to Google OAuth consent', 
      credentialTypes: oauthCredTypes 
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
router.get('/oauth2/callback', async (req, res) => {
  console.log('\n========== OAuth2 Callback Received ==========');
  
  try {
    const { code, state, error } = req.query;
    
    // Handle OAuth errors (user denied consent, etc.)
    if (error) {
      console.error('OAuth error from Google:', error);
      const redirectUrl = `${process.env.FRONTEND_URL}/dashboard?error=oauth_denied&details=${encodeURIComponent(error)}`;
      return res.redirect(302, redirectUrl);
    }
    
    if (!code || !state) {
      console.error('Missing code or state parameter');
      const redirectUrl = `${process.env.FRONTEND_URL}/dashboard?error=missing_params`;
      return res.redirect(302, redirectUrl);
    }

    // Parse state
    let parsed;
    try {
      parsed = JSON.parse(state);
    } catch (parseErr) {
      console.error('Failed to parse state:', parseErr);
      const redirectUrl = `${process.env.FRONTEND_URL}/dashboard?error=invalid_state`;
      return res.redirect(302, redirectUrl);
    }
    
    const { userId, workflowId, credentialTypes } = parsed;
    
    if (!userId || !workflowId) {
      console.error('Missing userId or workflowId in state');
      const redirectUrl = `${process.env.FRONTEND_URL}/dashboard?error=invalid_state_data`;
      return res.redirect(302, redirectUrl);
    }

    console.log(`Processing activation for user ${userId}, workflow ${workflowId}`);
    console.log(`Credential types to create: ${(credentialTypes || []).join(', ')}`);

    // Step 1: Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(code);

    if (!tokens || !tokens.access_token) {
      console.error('No access token returned from Google', tokens);
      const redirectUrl = `${process.env.FRONTEND_URL}/dashboard?error=token_exchange_failed`;
      return res.redirect(302, redirectUrl);
    }

    // Step 2: Get template workflow from n8n
    console.log('\nStep 2: Fetching template workflow from n8n...');
    const wfResp = await n8nAxios.get(`/workflows/${workflowId}`);
    const templateWorkflow = wfResp.data;
    console.log(`✓ Fetched template workflow: ${templateWorkflow.name}`);

    // Step 3: Create credentials in n8n for each required credentialType
    console.log('\nStep 3: Creating credentials in n8n...');
    const credMap = {}; // credType => createdCredentialId
    const userLabel = `user-${userId}`;
    const createdCredentialIds = [];
    
    for (const ct of credentialTypes || []) {
      try {
        const displayName = `${userLabel}-${ct}-${Date.now()}`;
        const result = await createN8nCredential(ct, tokens, displayName);
        
        if (result && result.createdId) {
          credMap[ct] = result.createdId;
          createdCredentialIds.push(result.createdId);
        } else {
          console.warn(`Credential creation for ${ct} returned unexpected response`, result);
        }
      } catch (err) {
        console.error(`Error creating credential ${ct}:`, err.response?.data || err.message);
        // Continue: we may still create the workflow if some credentials succeed
      }
    }

    console.log(`✓ Created ${Object.keys(credMap).length} credentials in n8n`);

    // Step 4: Inject credentials into a clone of the workflow
    console.log('\nStep 4: Cloning workflow and injecting credentials...');
    const newWorkflowPayload = injectCredentialsIntoWorkflow(templateWorkflow, credMap, userLabel);

    // Step 5: Create cloned workflow in n8n
    console.log('\nStep 5: Creating cloned workflow in n8n...');
    const createWfResp = await n8nAxios.post('/workflows', newWorkflowPayload);
    const createdWf = createWfResp.data;
    const clonedWorkflowId = createdWf?.id || 
                             createdWf?.data?.id || 
                             createdWf?.workflow?.id;

    if (!clonedWorkflowId) {
      console.error('Failed to create cloned workflow. Response:', createWfResp.data);
      const redirectUrl = `${process.env.FRONTEND_URL}/dashboard?error=workflow_creation_failed`;
      return res.redirect(302, redirectUrl);
    }

    console.log(`✓ Created cloned workflow with ID: ${clonedWorkflowId}`);

    // Step 6: Activate the cloned workflow
    console.log('\nStep 6: Activating cloned workflow...');
    
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

    // Step 7: Persist OAuth tokens in database
    console.log('\nStep 7: Persisting OAuth tokens in database...');
    await OAuthTokens.upsert({
      userId: userId,
      workflowId: clonedWorkflowId,
      provider: 'google',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      token_type: tokens.token_type || 'Bearer',
      scope: tokens.scope
    });
    console.log('✓ OAuth tokens stored');

    // Step 8: Persist workflow mapping in database
    console.log('\nStep 8: Persisting workflow mapping in database...');
    await UserWorkflowInstance.upsert({
      userId: userId,
      sourceWorkflowId: workflowId,  // ✅ Use correct field name (maps to source_workflow_id)
      instanceWorkflowId: clonedWorkflowId,  // ✅ Use correct field name
      activated_at: new Date(),
      services_used: Object.keys(credMap),
      credential_id: createdCredentialIds.join(','),
      n8n_credential_ids: credMap // Store the full mapping
    });
    console.log('✓ Workflow mapping stored');

    console.log('\n========== Activation Complete ==========');
    console.log('Summary:');
    console.log(`  User: ${userId}`);
    console.log(`  Template Workflow: ${workflowId}`);
    console.log(`  Cloned Workflow: ${clonedWorkflowId}`);
    console.log(`  Credentials Created: ${Object.keys(credMap).length}`);
    console.log(`  Credential Map:`, credMap);
    console.log('===========================================\n');

    // Step 9: Redirect back to frontend with success
    const redirectUrl = `${process.env.FRONTEND_URL}/dashboard?workflowActivated=true&clonedWorkflowId=${clonedWorkflowId}&workflowName=${encodeURIComponent(templateWorkflow.name)}`;
    return res.redirect(302, redirectUrl);
    
  } catch (err) {
    console.error('\n========== Activation Failed ==========');
    console.error('Error:', err.response?.data || err.message);
    console.error('Stack:', err.stack);
    console.error('=======================================\n');
    
    const errorMsg = encodeURIComponent(err.message || 'activation_failed');
    const redirectUrl = `${process.env.FRONTEND_URL}/dashboard?error=activation_failed&details=${errorMsg}`;
    return res.redirect(302, redirectUrl);
  }
});

module.exports = router;
