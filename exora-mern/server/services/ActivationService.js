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
    
    // Clean up tags - n8n API expects just tag names or IDs, not full objects
    let cleanTags = [];
    if (src.tags && Array.isArray(src.tags)) {
      cleanTags = src.tags.map(tag => {
        if (typeof tag === 'string') return tag;
        if (tag.name) return tag.name;
        if (tag.id) return tag.id;
        return null;
      }).filter(Boolean);
    }
    
    // Clean nodes - remove read-only fields and runtime data
    const cleanNodes = src.nodes.map(node => {
      const cleanNode = {
        parameters: node.parameters || {},
        name: node.name,
        type: node.type,
        typeVersion: node.typeVersion,
        position: node.position,
      };
      
      // Only include optional fields if they exist
      if (node.credentials) cleanNode.credentials = node.credentials;
      if (node.disabled !== undefined) cleanNode.disabled = node.disabled;
      if (node.notes) cleanNode.notes = node.notes;
      if (node.notesInFlow !== undefined) cleanNode.notesInFlow = node.notesInFlow;
      if (node.continueOnFail !== undefined) cleanNode.continueOnFail = node.continueOnFail;
      if (node.retryOnFail !== undefined) cleanNode.retryOnFail = node.retryOnFail;
      if (node.waitBetweenTries) cleanNode.waitBetweenTries = node.waitBetweenTries;
      if (node.alwaysOutputData !== undefined) cleanNode.alwaysOutputData = node.alwaysOutputData;
      if (node.executeOnce !== undefined) cleanNode.executeOnce = node.executeOnce;
      
      // EXCLUDE read-only/runtime fields: id, webhookId
      return cleanNode;
    });
    
    const payload = {
      name: `${src.name} — User ${userId}`,
      nodes: cleanNodes,
      connections: src.connections,
      settings: src.settings || {},
      staticData: src.staticData || {},
      tags: cleanTags,
      // EXCLUDED read-only fields: id, active, createdAt, updatedAt, versionId
    };
    
    const created = await this.n8n.createWorkflow(payload);
    if (!created.success) throw new Error(created.error || 'Failed to create workflow clone');
    return created.workflow;
  }

  async createOrUpdateGoogleCredentialForUser({ userId, workflowId, tokens }) {
    try {
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
        console.log(`Updating existing credential: ${found.id}`);
        const updated = await axios.patch(`${this.n8nApiUrl}/api/v1/credentials/${found.id}`, body, { headers: this.headers });
        return updated.data;
      }
      
      console.log(`Creating new credential: ${credentialName}`);
      const created = await axios.post(`${this.n8nApiUrl}/api/v1/credentials`, body, { headers: this.headers });
      return created.data;
    } catch (error) {
      console.error('Failed to create/update credential:', error.message);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  attachCredentialToGoogleNodes(workflow, credentialId, credentialName) {
    const updated = { 
      ...workflow, 
      nodes: workflow.nodes.map((node) => {
        const isGoogleNode = typeof node.type === 'string' && node.type.toLowerCase().includes('google');
        if (!isGoogleNode) return node;
        
        const newNode = { ...node };
        newNode.credentials = newNode.credentials || {};
        
        // n8n uses credential type keys, for Google nodes typically 'googleOAuth2Api'
        // Only include id, n8n will resolve the rest
        newNode.credentials.googleOAuth2Api = { 
          id: credentialId
        };
        
        console.log(`Attached credential ${credentialId} to node: ${node.name}`);
        return newNode;
      }) 
    };
    return updated;
  }

  async activateWorkflow(workflowId) {
    try {
      console.log(`Activating workflow: ${workflowId}`);
      const res = await axios.patch(
        `${this.n8nApiUrl}/api/v1/workflows/${workflowId}`,
        { active: true },
        { headers: this.headers }
      );
      console.log(`Workflow ${workflowId} activated successfully`);
      return res.data;
    } catch (error) {
      console.error(`Failed to activate workflow ${workflowId}:`, error.message);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || error.message);
    }
  }
}

module.exports = ActivationService;





