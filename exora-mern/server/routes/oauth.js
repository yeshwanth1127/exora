const express = require('express');
const { OAuthService } = require('../services/OAuthService');

const router = express.Router();

// User-facing OAuth callback for Google
router.get('/oauth/callback', async (req, res) => {
  const { code, state, error } = req.query || {};

  // If user denies or provider returns error
  if (error) {
    const redirectBase = process.env.FRONTEND_URL || 'https://exora.solutions';
    return res.redirect(`${redirectBase}/workflow-activation?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    const redirectBase = process.env.FRONTEND_URL || 'https://exora.solutions';
    return res.redirect(`${redirectBase}/workflow-activation?error=missing_code`);
  }

  try {
    const session = await OAuthService.handleOAuthCallback('google', code, state);
    const redirectBase = process.env.FRONTEND_URL || 'https://exora.solutions';
    const params = new URLSearchParams({
      success: 'true',
      userId: session.userId ? String(session.userId) : '',
      workflowId: session.workflowId ? String(session.workflowId) : '',
    }).toString();
    return res.redirect(`${redirectBase}/workflow-activation?${params}`);
  } catch (err) {
    const redirectBase = process.env.FRONTEND_URL || 'https://exora.solutions';
    return res.redirect(`${redirectBase}/workflow-activation?error=oauth_failed`);
  }
});

module.exports = router;


