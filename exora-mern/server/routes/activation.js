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

  const scope = Array.isArray(scopes) && scopes.length
    ? scopes.join(' ')
    : 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';

  const state = JSON.stringify({ userId, workflowId });
  const url = OAuthService.buildAuthUrl({ clientId: GOOGLE_CLIENT_ID, redirectUri: GOOGLE_REDIRECT_URI, scopes: scope, state });
  return res.status(200).json({ success: true, authorizationUrl: url });
});

// After /oauth/callback completes successfully, we will:
//  - upsert tokens
//  - clone workflow
//  - create/update credential
//  - attach credential
//  - activate

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

    // Provision workflow in n8n
    const activation = new ActivationService();
    // Reuse existing instance if present; else clone
    const UserWorkflowInstance = require('../models/UserWorkflowInstance');
    const existing = await UserWorkflowInstance.findByUserSource({ userId: Number(userId), sourceWorkflowId: String(workflowId) });
    const workflow = existing
      ? (await activation.n8n.getWorkflow(existing.instanceWorkflowId)).workflow
      : await activation.cloneWorkflowForUser(workflowId, userId);
    const cred = await activation.createOrUpdateGoogleCredentialForUser({ userId, workflowId: workflow.id, tokens });
    const updated = activation.attachCredentialToGoogleNodes(workflow, cred.id || cred.data?.id || cred._id || cred.uid);
    await activation.n8n.updateWorkflow(workflow.id, updated);
    await activation.activateWorkflow(workflow.id);
    await UserWorkflowInstance.upsert({ userId: Number(userId), sourceWorkflowId: String(workflowId), instanceWorkflowId: String(workflow.id), status: 'active' });

    // Redirect back with success
    const params = new URLSearchParams({
      success: 'true',
      userId: String(userId),
      workflowId: String(workflow.id),
    }).toString();
    return res.redirect(`${redirectBase}/workflow-activation?${params}`);
  } catch (err) {
    return res.redirect(`${redirectBase}/workflow-activation?error=${encodeURIComponent(err.message || 'oauth_activation_failed')}`);
  }
});

module.exports = router;


