const axios = require('axios');
const N8NIntegration = require('./N8NIntegration');

class ActivationService {
  constructor() {
    this.n8n = new N8NIntegration();
    this.n8nApiUrl = process.env.N8N_BASE_URL || 'https://n8n.exora.solutions';
    this.n8nApiKey = process.env.N8N_API_KEY;
    this.headers = { 'X-N8N-API-KEY': this.n8nApiKey, 'Content-Type': 'application/json' };
  }

  // Detect which Google services are required based on nodes
  detectRequiredGoogleServices(workflow) {
    const services = new Set();
    const nodes = workflow?.nodes || [];
    nodes.forEach((node) => {
      const type = String(node.type || '').toLowerCase();
      if (type.includes('gmail')) services.add('gmail');
      if (type.includes('googlesheets') || type.includes('sheets')) services.add('sheets');
      if (type.includes('calendar')) services.add('calendar');
      if (type.includes('googledrive') || type.includes('drive')) services.add('drive');
      if (type.includes('googledocs') || type.includes('docs')) services.add('docs');
    });
    return Array.from(services);
  }

  // Build comprehensive scopes string for detected services
  getComprehensiveGoogleScopes(services) {
    const scopeSets = [];
    const s = new Set(services || []);
    if (s.has('gmail')) {
      scopeSets.push('https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify');
    }
    if (s.has('sheets')) {
      scopeSets.push('https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file');
    }
    if (s.has('calendar')) {
      scopeSets.push('https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events');
    }
    if (s.has('drive')) {
      scopeSets.push('https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file');
    }
    if (s.has('docs')) {
      scopeSets.push('https://www.googleapis.com/auth/documents');
    }
    // Always include base identity scopes
    scopeSets.push('openid email profile');
    return scopeSets.join(' ');
  }

  // Map services to nodesAccess entries
  getNodesAccessForServices(services) {
    const access = [];
    const add = (nodeType, nodeTypeVersion) => access.push({ nodeType, nodeTypeVersion });
    const s = new Set(services || []);
    if (s.has('gmail')) {
      add('n8n-nodes-base.gmail', 2);
      add('n8n-nodes-base.gmailTrigger', 1);
    }
    if (s.has('sheets')) {
      add('n8n-nodes-base.googleSheets', 2);
    }
    if (s.has('calendar')) {
      add('n8n-nodes-base.googleCalendar', 1);
      add('n8n-nodes-base.googleCalendarTrigger', 1);
    }
    if (s.has('drive')) {
      add('n8n-nodes-base.googleDrive', 2);
    }
    if (s.has('docs')) {
      add('n8n-nodes-base.googleDocs', 1);
    }
    return access;
  }

  async cloneWorkflowForUser(originalWorkflowId, userId) {
    const source = await this.n8n.getWorkflow(originalWorkflowId);
    if (!source.success) throw new Error(source.error || 'Failed to get source workflow');
    const src = source.workflow;

    // Clean nodes - remove read-only fields and runtime data
    const cleanNodes = src.nodes.map(node => {
      const cleanNode = {
        parameters: node.parameters || {},
        name: node.name,
        type: node.type,
        typeVersion: node.typeVersion,
        position: node.position,
      };
      if (node.credentials) cleanNode.credentials = node.credentials;
      if (node.disabled !== undefined) cleanNode.disabled = node.disabled;
      if (node.notes) cleanNode.notes = node.notes;
      if (node.notesInFlow !== undefined) cleanNode.notesInFlow = node.notesInFlow;
      if (node.continueOnFail !== undefined) cleanNode.continueOnFail = node.continueOnFail;
      if (node.retryOnFail !== undefined) cleanNode.retryOnFail = node.retryOnFail;
      if (node.waitBetweenTries) cleanNode.waitBetweenTries = node.waitBetweenTries;
      if (node.alwaysOutputData !== undefined) cleanNode.alwaysOutputData = node.alwaysOutputData;
      if (node.executeOnce !== undefined) cleanNode.executeOnce = node.executeOnce;
      return cleanNode;
    });

    const payload = {
      name: `${src.name} — User ${userId}`,
      nodes: cleanNodes,
      connections: src.connections,
      settings: src.settings || {},
      staticData: src.staticData || {},
    };

    const created = await this.n8n.createWorkflow(payload);
    if (!created.success) throw new Error(created.error || 'Failed to create workflow clone');

    const clonedWorkflow = created.workflow;
    const requiredServices = this.detectRequiredGoogleServices(clonedWorkflow);
    return { workflow: clonedWorkflow, requiredServices };
  }

  // Create a single comprehensive Google credential per user per workflow
  async createUserSpecificGoogleCredential({ userId, workflowId, tokens, detectedServices }) {
    try {
      const uniqueSuffix = Date.now();
      const credentialName = `google-oauth-user-${userId}-workflow-${workflowId}-${uniqueSuffix}`;
      const scopeString = this.getComprehensiveGoogleScopes(detectedServices);
      const nodesAccess = this.getNodesAccessForServices(detectedServices);

      const body = {
        name: credentialName,
        type: 'googleOAuth2Api',
        nodesAccess,
        data: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          scope: scopeString,
          sendAdditionalBodyProperties: false,
          additionalBodyProperties: "",
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
      console.error('Failed to create comprehensive credential:', error.message);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  // Map node.type to the exact credential key expected by n8n
  mapNodeTypeToCredentialKey(nodeType) {
    const t = String(nodeType || '').toLowerCase();
    if (t === 'n8n-nodes-base.gmail' || t === 'n8n-nodes-base.gmailtrigger') return 'gmailOAuth2Api';
    if (t === 'n8n-nodes-base.googlesheets') return 'googleSheetsOAuth2Api';
    if (t === 'n8n-nodes-base.googlecalendar' || t === 'n8n-nodes-base.googlecalendartrigger') return 'googleCalendarOAuth2Api';
    if (t === 'n8n-nodes-base.googledrive') return 'googleDriveOAuth2Api';
    if (t === 'n8n-nodes-base.googledocs') return 'googleDocsOAuth2Api';
    // Fallback: generic google nodes sometimes accept googleOAuth2Api
    if (t.includes('google')) return 'googleOAuth2Api';
    return null;
  }

  attachCredentialToGoogleNodes(workflow, credentialId) {
    // Clean the workflow to only include fields allowed by n8n PUT API
    const cleanWorkflow = {
      id: workflow.id,
      name: workflow.name,
      active: workflow.active,
      nodes: (workflow.nodes || []).map((node) => {
        const key = this.mapNodeTypeToCredentialKey(node.type);
        const cleanNode = {
          id: node.id,
          name: node.name,
          type: node.type,
          typeVersion: node.typeVersion,
          position: node.position,
          parameters: node.parameters || {},
        };
        
        // Add credentials if this is a Google node
        if (key) {
          cleanNode.credentials = { [key]: { id: credentialId } };
          console.log(`Attached credential ${credentialId} with key '${key}' to node: ${node.name} (${node.type})`);
        } else if (node.credentials) {
          // Preserve existing credentials for non-Google nodes
          cleanNode.credentials = node.credentials;
        }
        
        return cleanNode;
      }),
      connections: workflow.connections || {},
      settings: workflow.settings || {},
      tags: workflow.tags || [],
      staticData: workflow.staticData || {}
    };
    
    return cleanWorkflow;
  }

  // Validate that all nodes needing Google creds have them set
  validateGoogleCredentials(workflow) {
    const missing = [];
    (workflow.nodes || []).forEach((node) => {
      const key = this.mapNodeTypeToCredentialKey(node.type);
      if (!key) return;
      const hasCred = node.credentials && node.credentials[key] && node.credentials[key].id;
      if (!hasCred) {
        missing.push({ name: node.name, type: node.type, expectedKey: key });
      }
    });
    if (missing.length) {
      const details = missing.map(m => `${m.name} [${m.type}] -> ${m.expectedKey}`).join('; ');
      throw new Error(`Missing credentials on nodes: ${details}`);
    }
  }

  async activateWorkflow(workflowId) {
    try {
      console.log(`Activating workflow: ${workflowId}`);
      const res = await axios.post(
        `${this.n8nApiUrl}/api/v1/workflows/${workflowId}/activate`,
        {},
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





