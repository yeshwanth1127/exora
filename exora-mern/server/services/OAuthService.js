const axios = require('axios');

/**
 * OAuthService handles provider-specific OAuth callbacks.
 * Currently supports Google. Expects `state` to optionally encode context like userId/workflowId.
 */
class OAuthService {
  static buildAuthUrl({ clientId, redirectUri, scopes, state }) {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      access_type: 'offline',
      include_granted_scopes: 'true',
      prompt: 'consent',
      scope: scopes,
      state,
    }).toString();
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }
  /**
   * Exchanges an authorization code for tokens and returns a session summary
   * including userId/workflowId parsed from state when present.
   *
   * @param {('google')} provider
   * @param {string} code
   * @param {string} state
   * @returns {Promise<{ userId?: string|number, workflowId?: string, tokens: any }>} session
   */
  static async handleOAuthCallback(provider, code, state) {
    if (provider !== 'google') {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    // Parse state; support JSON or simple querystring-like "key=value&..."
    let stateObj = {};
    if (state) {
      try {
        stateObj = JSON.parse(state);
      } catch (_) {
        stateObj = Object.fromEntries(new URLSearchParams(state));
      }
    }

    const {
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI,
    } = process.env;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
      throw new Error('Missing Google OAuth env: GOOGLE_CLIENT_ID/SECRET and GOOGLE_REDIRECT_URI');
    }

    // Exchange code for tokens
    let tokenRes;
    try {
      tokenRes = await axios.post('https://oauth2.googleapis.com/token', new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
      }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 15000,
      });
    } catch (err) {
      const msg = err.response?.data?.error_description || err.message;
      throw new Error(`Google token exchange failed: ${msg}`);
    }

    const tokens = tokenRes.data;

    // Optionally: fetch user info if needed
    // const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
    //   headers: { Authorization: `Bearer ${tokens.access_token}` },
    // });

    // TODO: persist credentials against the user in DB / credentials store
    // For now, return the session context for redirect composition
    return {
      userId: stateObj.userId,
      workflowId: stateObj.workflowId,
      tokens,
    };
  }

  static async refreshAccessToken(refreshToken) {
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      throw new Error('Missing Google OAuth env for refresh');
    }
    const res = await axios.post('https://oauth2.googleapis.com/token', new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 15000 });
    return res.data;
  }
}

module.exports = { OAuthService };


