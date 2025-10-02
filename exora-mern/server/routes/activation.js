const express = require('express');
const router = express.Router();
const axios = require('axios');
const { OAuthService } = require('../services/OAuthService');
const OAuthTokens = require('../models/OAuthTokens');
const UserWorkflowInstance = require('../models/UserWorkflowInstance');

// POST /activate-workflow - Initiate OAuth flow for workflow activation
router.post('/activate-workflow', async (req, res) => {
  try {
    const { userId, workflowId, scopes } = req.body;

    if (!userId || !workflowId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId and workflowId are required' 
      });
    }

    // Default comprehensive Google scopes if not provided
    const defaultScopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const requestedScopes = scopes && scopes.length > 0 ? scopes : defaultScopes;

    // Generate OAuth authorization URL
    const authorizationUrl = OAuthService.buildAuthUrl({
      clientId: process.env.GOOGLE_CLIENT_ID,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
      scopes: requestedScopes,
      state: JSON.stringify({ userId, workflowId })
    });

    console.log(`Generated OAuth URL for user ${userId}, workflow ${workflowId}`);
    console.log(`Scopes: ${requestedScopes.join(' ')}`);

    res.json({
      success: true,
      authorizationUrl,
      message: 'Redirect to authorization URL to complete activation'
    });

  } catch (error) {
    console.error('Activation initiation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to initiate workflow activation' 
    });
  }
});

// GET /oauth/callback - Handle Google OAuth callback and call n8n orchestrator
router.get('/oauth/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      console.error('OAuth error:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/workflow-activation?error=oauth_denied`);
    }

    if (!code || !state) {
      console.error('Missing code or state parameter');
      return res.redirect(`${process.env.FRONTEND_URL}/workflow-activation?error=invalid_request`);
    }

    let parsedState;
    try {
      parsedState = JSON.parse(state);
    } catch (parseError) {
      console.error('Invalid state parameter:', parseError);
      return res.redirect(`${process.env.FRONTEND_URL}/workflow-activation?error=invalid_state`);
    }

    const { userId, workflowId } = parsedState;

    if (!userId || !workflowId) {
      console.error('Missing userId or workflowId in state');
      return res.redirect(`${process.env.FRONTEND_URL}/workflow-activation?error=invalid_state`);
    }

    console.log(`Processing OAuth callback for user ${userId}, workflow ${workflowId}`);

    // Exchange code for tokens
    const tokens = await OAuthService.handleOAuthCallback('google', code, state);
    console.log('OAuth tokens obtained successfully');

    // Store tokens in database
    await OAuthTokens.upsert({
      userId,
      workflowId,
      provider: 'google',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      token_type: tokens.token_type || 'Bearer'
    });

    console.log('OAuth tokens stored in database');

    // Call n8n orchestrator webhook
    try {
      const base = process.env.N8N_WEBHOOK_BASE_URL || process.env.N8N_BASE || process.env.N8N_BASE_URL;
      const webhookBase = (base || '').replace(/\/$/, '');
      const orchestratorResponse = await axios.post(
        `${webhookBase}/webhook/activate-workflow`,
        {
          userId: userId,
          workflowId: workflowId,
          oauthToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresIn: tokens.expires_in,
          tokenType: tokens.token_type || 'Bearer'
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000 // 30 second timeout
        }
      );

      if (!orchestratorResponse.data.success) {
        throw new Error(`Orchestrator failed: ${orchestratorResponse.data.error || orchestratorResponse.data.message}`);
      }

      console.log('n8n orchestrator completed successfully:', orchestratorResponse.data);

      // Store the user-workflow mapping
      await UserWorkflowInstance.upsert({
        userId,
        templateWorkflowId: workflowId,
        clonedWorkflowId: orchestratorResponse.data.workflowId,
        activated_at: new Date(),
        services_used: [], // Will be populated by orchestrator if needed
        credential_id: orchestratorResponse.data.credentialId || null
      });

      console.log(`Workflow ${orchestratorResponse.data.workflowId} activated successfully for user ${userId}`);

      // Redirect to frontend with success
      res.redirect(`${process.env.FRONTEND_URL}/workflow-activation?success=true&userId=${userId}&workflowId=${orchestratorResponse.data.workflowId}`);

    } catch (orchestratorError) {
      console.error('n8n orchestrator error:', orchestratorError.message);
      console.error('Orchestrator response:', orchestratorError.response?.data);
      res.redirect(`${process.env.FRONTEND_URL}/workflow-activation?error=orchestrator_failed`);
    }

  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/workflow-activation?error=activation_failed`);
  }
});

module.exports = router;