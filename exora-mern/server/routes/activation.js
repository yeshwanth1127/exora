const express = require('express');
const ActivationService = require('../services/ActivationService');
const { OAuthService } = require('../services/OAuthService');
const OAuthTokens = require('../models/OAuthTokens');

const router = express.Router();

// POST /activate-workflow
router.post('/activate-workflow', async (req, res) => {
  const { userId, workflowId, scopes } = req.body || {};
  if (!userId || !workflowId) {
    return res.status(400).json({ success: false, error: 'userId and workflowId required' });
  }

  const { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
    return res.status(500).json({ success: false, error: 'Missing Google OAuth env' });
  }

  // Comprehensive default scopes covering Gmail, Sheets, Calendar, Drive, Docs + identity
  const defaultScopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/documents',
    'openid', 'email', 'profile'
  ];

  const scope = Array.isArray(scopes) && scopes.length
    ? scopes.join(' ')
    : defaultScopes.join(' ');

  const state = JSON.stringify({ userId, workflowId });
  const url = OAuthService.buildAuthUrl({ clientId: GOOGLE_CLIENT_ID, redirectUri: GOOGLE_REDIRECT_URI, scopes: scope, state });
  return res.status(200).json({ success: true, authorizationUrl: url });
});

// GET /oauth/callback - per-user clone, credential, attach, activate, track
router.get('/oauth/callback', async (req, res) => {
  const { code, state } = req.query || {};
  const redirectBase = process.env.FRONTEND_URL || 'https://exora.solutions';
  if (!code || !state) {
    return res.redirect(`${redirectBase}/workflow-activation?error=missing_params`);
  }
  try {
    const session = await OAuthService.handleOAuthCallback('google', code, state);
    const { userId, workflowId, tokens } = session;
    if (!userId || !workflowId) {
      return res.redirect(`${redirectBase}/workflow-activation?error=invalid_state`);
    }

    // Store tokens
    await OAuthTokens.upsert({
      userId: Number(userId),
      workflowId: String(workflowId),
      provider: 'google',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
      scope: tokens.scope,
    });

    // Provision per-user workflow instance
    const activation = new ActivationService();
    const { workflow: cloned, requiredServices } = await activation.cloneWorkflowForUser(workflowId, userId);

    // Create comprehensive credential for this user+workflow
    const credential = await activation.createUserSpecificGoogleCredential({
      userId,
      workflowId: cloned.id,
      tokens,
      detectedServices: requiredServices
    });

    // Fetch the full workflow from n8n to ensure we have all metadata
    const fullWorkflow = await activation.n8n.getWorkflow(cloned.id);
    if (!fullWorkflow.success) {
      throw new Error(`Failed to fetch workflow: ${fullWorkflow.error}`);
    }

    // Attach credential to all Google nodes
    const updated = activation.attachCredentialToGoogleNodes(fullWorkflow.workflow, credential);
    
    // Validate that all Google nodes have credentials
    activation.validateGoogleCredentials(updated);
    
    // Update the workflow with the clean object
    const updateResult = await activation.n8n.updateWorkflow(cloned.id, updated);
    if (!updateResult.success) {
      throw new Error(`Failed to update workflow: ${updateResult.error}`);
    }

    // Activate user's cloned workflow
    await activation.activateWorkflow(cloned.id);

    // Track mapping in DB
    const UserWorkflowInstance = require('../models/UserWorkflowInstance');
    await UserWorkflowInstance.upsert({
      userId: Number(userId),
      sourceWorkflowId: String(workflowId),
      instanceWorkflowId: String(cloned.id),
      status: 'active'
    });

    const params = new URLSearchParams({
      success: 'true',
      userId: String(userId),
      workflowId: String(cloned.id),
      services: (requiredServices || []).join(',')
    }).toString();
    return res.redirect(`${redirectBase}/workflow-activation?${params}`);
  } catch (err) {
    return res.redirect(`${redirectBase}/workflow-activation?error=${encodeURIComponent(err.message || 'oauth_activation_failed')}`);
  }
});

module.exports = router;


