const axios = require('axios');
const N8NIntegration = require('./N8NIntegration');

class ActivationService {
  constructor() {
    this.n8n = new N8NIntegration();
    this.n8nApiUrl = process.env.N8N_BASE_URL || 'https://n8n.exora.solutions';
    this.n8nApiKey = process.env.N8N_API_KEY;
    this.headers = { 'X-N8N-API-KEY': this.n8nApiKey, 'Content-Type': 'application/json' };
  }

  async cloneWorkflowForUser(originalWorkflowId, userId) {
    const source = await this.n8n.getWorkflow(originalWorkflowId);
    if (!source.success) throw new Error(source.error || 'Failed to get source workflow');
    const src = source.workflow;
    const payload = {
      name: `${src.name} — User ${userId}`,
      nodes: src.nodes,
      connections: src.connections,
      settings: src.settings || {},
      staticData: src.staticData || {},
      tags: src.tags || [],
      active: false,
    };
    const created = await this.n8n.createWorkflow(payload);
    if (!created.success) throw new Error(created.error || 'Failed to create workflow clone');
    return created.workflow;
  }

  async createOrUpdateGoogleCredentialForUser({ userId, workflowId, tokens }) {
    // Create n8n credential of type 'googleOAuth2Api'
    const credentialName = `google-oauth-user-${userId}-${workflowId}`;
    const body = {
      name: credentialName,
      type: 'googleOAuth2Api',
      data: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        scope: tokens.scope,
        tokenType: tokens.token_type || 'Bearer',
        expiresAt: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : undefined,
      },
    };

    // Try upsert via search by name
    const existing = await axios.get(`${this.n8nApiUrl}/api/v1/credentials`, { headers: this.headers });
    const found = (existing.data.data || existing.data).find((c) => c.name === credentialName);
    if (found) {
      const updated = await axios.patch(`${this.n8nApiUrl}/api/v1/credentials/${found.id}`, body, { headers: this.headers });
      return updated.data;
    }
    const created = await axios.post(`${this.n8nApiUrl}/api/v1/credentials`, body, { headers: this.headers });
    return created.data;
  }

  attachCredentialToGoogleNodes(workflow, credentialId) {
    const updated = { ...workflow, nodes: workflow.nodes.map((node) => {
      const isGoogleNode = typeof node.type === 'string' && node.type.toLowerCase().includes('google');
      if (!isGoogleNode) return node;
      const newNode = { ...node };
      newNode.credentials = newNode.credentials || {};
      // n8n uses credential type keys, for Google nodes typically 'googleOAuth2Api'
      newNode.credentials.googleOAuth2Api = { id: credentialId, name: 'Google OAuth2 API' };
      return newNode;
    }) };
    return updated;
  }

  async activateWorkflow(workflowId) {
    const res = await axios.post(
      `${this.n8nApiUrl}/api/v1/workflows/${workflowId}/activate`,
      {},
      { headers: this.headers }
    );
    return res.data;
  }
}

module.exports = ActivationService;





