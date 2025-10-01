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
      // EXCLUDED read-only fields: id, active, tags, createdAt, updatedAt, versionId
    };
    
    const created = await this.n8n.createWorkflow(payload);
    if (!created.success) throw new Error(created.error || 'Failed to create workflow clone');
    return created.workflow;
  }

  async createOrUpdateGoogleCredentialForUser({ userId, workflowId, tokens }) {
    try {
      const uniqueSuffix = Date.now();
      const credentialName = `google-oauth-user-${userId}-${workflowId}-${uniqueSuffix}`;

      // Build payload per n8n REST API examples for googleOAuth2Api
      const scopeString = tokens?.scope || [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'openid',
        'email',
        'profile',
      ].join(' ');

      const body = {
        name: credentialName,
        type: 'googleOAuth2Api',
        nodesAccess: [
          { nodeType: 'n8n-nodes-base.gmail', nodeTypeVersion: 2 },
          { nodeType: 'n8n-nodes-base.gmailTrigger', nodeTypeVersion: 1 },
        ],
        data: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          scope: scopeString,
          oauthTokenData: {
            access_token: tokens?.access_token,
            refresh_token: tokens?.refresh_token,
            scope: scopeString,
            token_type: tokens?.token_type || 'Bearer',
            expires_in: tokens?.expires_in || 3600,
            expiry_date: tokens?.expires_in ? Date.now() + tokens.expires_in * 1000 : undefined,
          },
        },
      };

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





