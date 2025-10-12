// server/services/WorkflowAnalyzer.js

const NodeMetadataRegistry = require('../registry/NodeMetadataRegistry');

/**
 * Universal Workflow Intelligence Engine
 * Analyzes any n8n workflow to detect inputs, triggers, and metadata
 * Works provider-agnostically (Google, Slack, HubSpot, custom nodes)
 */
class WorkflowAnalyzer {
  
  /**
   * Main analysis method - analyzes entire workflow
   * @param {object} workflowJson - Full n8n workflow JSON
   * @returns {object} - Analysis result with inputs, triggers, outputs, metadata
   */
  static analyzeWorkflow(workflowJson) {
    const nodes = workflowJson?.nodes || [];
    
    return {
      inputs: this.detectInputFields(workflowJson),
      triggers: this.detectTriggers(workflowJson),
      outputs: this.predictOutputStructure(workflowJson),
      metadata: this.extractMetadata(workflowJson),
      executionStrategy: this.determineExecutionStrategy(workflowJson)
    };
  }

  /**
   * Detect all input fields required by the workflow
   * Uses multi-strategy detection: expressions + registry + webhooks
   */
  static detectInputFields(workflowJson) {
    const fields = new Map();
    const nodes = workflowJson?.nodes || [];
    
    // Strategy 1: Scan for expressions in all nodes
    nodes.forEach(node => {
      this._scanForExpressions(node, fields);
    });
    
    // Strategy 2: Check for webhook body expectations
    nodes.forEach(node => {
      if (this._isWebhookNode(node)) {
        this._detectWebhookInputs(node, fields);
      }
    });
    
    // Strategy 3: Enrich with registry metadata
    this._enrichWithRegistry(fields, nodes);
    
    // Convert to array and sort by priority
    const inputs = Array.from(fields.values());
    return this._prioritizeInputs(inputs);
  }

  /**
   * Scan node parameters for expression patterns
   * @private
   */
  static _scanForExpressions(node, fields) {
    const jsonStr = JSON.stringify(node.parameters || {});
    
    // Match {{ $json.fieldName }} patterns
    const jsonMatches = jsonStr.matchAll(/\{\{[^}]*\$json\.([a-zA-Z0-9_]+)[^}]*\}\}/g);
    for (const match of jsonMatches) {
      const fieldName = match[1];
      if (!fields.has(fieldName)) {
        fields.set(fieldName, {
          field: fieldName,
          source: 'expression',
          nodeContext: node.name || node.type,
          nodeType: node.type,
          type: this._inferTypeFromName(fieldName),
          label: this._generateLabel(fieldName),
          required: true // Assume required if referenced
        });
      }
    }
    
    // Match {{ $parameter.fieldName }} patterns
    const paramMatches = jsonStr.matchAll(/\{\{[^}]*\$parameter\.([a-zA-Z0-9_]+)[^}]*\}\}/g);
    for (const match of paramMatches) {
      const fieldName = match[1];
      if (!fields.has(fieldName)) {
        fields.set(fieldName, {
          field: fieldName,
          source: 'parameter',
          nodeContext: node.name || node.type,
          nodeType: node.type,
          type: this._inferTypeFromName(fieldName),
          label: this._generateLabel(fieldName),
          required: true
        });
      }
    }
  }

  /**
   * Infer data type from field name using heuristics
   * @private
   */
  static _inferTypeFromName(fieldName) {
    const lower = fieldName.toLowerCase();
    
    // Email detection
    if (lower.includes('email') || lower.includes('recipient')) return 'email';
    
    // URL detection
    if (lower.includes('url') || lower.includes('link') || lower.includes('href')) return 'url';
    
    // Date/time detection
    if (lower.includes('date') || lower.includes('time') || lower.includes('when')) return 'date';
    
    // Number detection
    if (lower.includes('count') || lower.includes('number') || lower.includes('amount') || 
        lower.includes('quantity') || lower.includes('id') && lower.includes('numeric')) return 'number';
    
    // Array detection (spreadsheet rows, lists, items)
    if (lower.includes('values') || lower.includes('rows') || lower.includes('items') || 
        lower.includes('data') && (lower.includes('row') || lower.includes('list'))) return 'array';
    
    // Object/Complex data detection
    if (lower.includes('payload') || lower.includes('properties') || lower.includes('fields')) return 'object';
    
    // Text/Long content detection
    if (lower.includes('message') || lower.includes('content') || lower.includes('body') ||
        lower.includes('description') || lower.includes('text')) return 'text';
    
    // File detection
    if (lower.includes('file') || lower.includes('attachment') || lower.includes('upload')) return 'file';
    
    // Boolean detection
    if (lower.includes('is') || lower.includes('has') || lower.includes('enabled')) return 'boolean';
    
    // Default to string
    return 'string';
  }

  /**
   * Generate human-readable label from camelCase field name
   * @private
   */
  static _generateLabel(fieldName) {
    // Convert camelCase to Title Case
    const withSpaces = fieldName.replace(/([A-Z])/g, ' $1');
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
  }

  /**
   * Check if node is a webhook node
   * @private
   */
  static _isWebhookNode(node) {
    return node.type?.toLowerCase().includes('webhook');
  }

  /**
   * Detect webhook input expectations
   * @private
   */
  static _detectWebhookInputs(node, fields) {
    // DON'T add generic webhookPayload field
    // Webhook inputs will be inferred from downstream nodes
    // This prevents confusing "webhook request body" fields
    // The actual webhook will receive whatever the downstream nodes need
  }

  /**
   * Enrich detected fields with registry metadata
   * ALSO adds fields from registry if node has operation but no expressions (empty params)
   * @private
   */
  static _enrichWithRegistry(fields, nodes) {
    nodes.forEach(node => {
      const registry = NodeMetadataRegistry[node.type];
      if (!registry) return;
      
      // Get operation from parameters OR infer from node name
      let operation = node.parameters?.operation || 
                     node.parameters?.resource;
      
      // If no operation found, try to infer from node name
      if (!operation) {
        operation = this._inferOperationFromNodeName(node.name, node.type);
      }
      
      // Fall back to default
      if (!operation) {
        operation = 'default';
      }
      
      const opMetadata = registry.operations?.[operation];
      if (!opMetadata?.parameters) return;
      
      // Check if this node has NO expressions (empty/hardcoded parameters)
      const hasExpressions = this._nodeHasExpressions(node);
      
      // Merge registry metadata with detected fields
      opMetadata.parameters.forEach(registryParam => {
        const existing = fields.get(registryParam.name);
        
        if (existing) {
          // Enrich existing field with registry data
          Object.assign(existing, {
            label: registryParam.label || existing.label,
            type: registryParam.type || existing.type,
            required: registryParam.required !== undefined ? registryParam.required : existing.required,
            placeholder: registryParam.placeholder,
            hint: registryParam.hint,
            default: registryParam.default
          });
        } else if (!hasExpressions && this._shouldAddRegistryField(node, registryParam)) {
          // Node has operation but no expressions - add registry fields as suggestions
          // This handles workflows where nodes have empty parameters
          fields.set(registryParam.name, {
            field: registryParam.name,
            source: 'registry-default',
            nodeContext: node.name || node.type,
            nodeType: node.type,
            operation: operation,
            ...registryParam,
            // Mark as suggested since it wasn't explicitly in the workflow
            suggested: true
          });
        }
      });
    });
  }

  /**
   * Infer operation from node name when not in parameters
   * @private
   */
  static _inferOperationFromNodeName(nodeName, nodeType) {
    if (!nodeName) return null;
    
    const lower = nodeName.toLowerCase();
    
    // Common operation keywords
    if (lower.includes('create')) return 'create';
    if (lower.includes('send')) return 'send';
    if (lower.includes('get') || lower.includes('fetch') || lower.includes('read')) return 'get';
    if (lower.includes('update') || lower.includes('edit') || lower.includes('modify')) return 'update';
    if (lower.includes('delete') || lower.includes('remove')) return 'delete';
    if (lower.includes('append') || lower.includes('add')) return 'append';
    if (lower.includes('upload')) return 'upload';
    if (lower.includes('download')) return 'download';
    
    return null;
  }

  /**
   * Check if node has any {{ }} expressions in parameters
   * @private
   */
  static _nodeHasExpressions(node) {
    const jsonStr = JSON.stringify(node.parameters || {});
    return jsonStr.includes('$json.') || jsonStr.includes('$parameter.');
  }

  /**
   * Determine if we should add a registry field for a node with empty params
   * @private
   */
  static _shouldAddRegistryField(node, registryParam) {
    // DO NOT add registry fields automatically
    // Only add fields that are EXPLICITLY referenced in workflow via expressions
    // 
    // Why: Nodes often get data from previous nodes in the workflow chain
    // We shouldn't ask users for data that comes from automation itself
    //
    // If workflow creator wants user input, they must add {{ $json.xxx }} expressions
    return false;
  }

  /**
   * Prioritize inputs for better UX (required first, then by type)
   * @private
   */
  static _prioritizeInputs(inputs) {
    return inputs.sort((a, b) => {
      // Required fields first
      if (a.required && !b.required) return -1;
      if (!a.required && b.required) return 1;
      
      // Then by type priority (string > number > text > json > file)
      const typePriority = { string: 1, email: 1, number: 2, text: 3, json: 4, file: 5 };
      return (typePriority[a.type] || 10) - (typePriority[b.type] || 10);
    });
  }

  /**
   * Detect workflow triggers (webhook, schedule, manual)
   * @param {object} workflowJson - Workflow JSON
   * @param {string} workflowId - The actual workflow ID in n8n (cloned instance)
   */
  static detectTriggers(workflowJson, workflowId = null) {
    const triggers = [];
    const nodes = workflowJson?.nodes || [];
    
    nodes.forEach(node => {
      // Webhook triggers
      if (node.type?.toLowerCase().includes('webhook')) {
        const path = node.parameters?.path || node.id;
        const webhookMode = node.parameters?.webhookId ? 'production' : 'test';
        
        // Construct webhook URL based on mode and workflow
        // Production webhooks use the path directly
        // Test webhooks include workflow ID
        let webhookUrl;
        if (webhookMode === 'production' || workflowJson.active) {
          webhookUrl = `${process.env.N8N_BASE_URL}/webhook/${path}`;
        } else {
          webhookUrl = `${process.env.N8N_BASE_URL}/webhook-test/${path}`;
        }
        
        triggers.push({
          type: 'webhook',
          method: node.parameters?.httpMethod || 'POST',
          path: path,
          url: webhookUrl,
          webhookMode: webhookMode,
          node: node.name || 'Webhook',
          nodeId: node.id
        });
      }
      
      // Schedule triggers
      if (node.type?.toLowerCase().includes('schedule') || node.type?.toLowerCase().includes('cron')) {
        triggers.push({
          type: 'schedule',
          schedule: node.parameters?.rule || node.parameters?.cronExpression || 'custom',
          node: node.name || 'Schedule'
        });
      }
      
      // Other trigger types
      if (node.type?.toLowerCase().includes('trigger') && !node.type?.toLowerCase().includes('webhook')) {
        triggers.push({
          type: 'automated',
          triggerType: node.type,
          node: node.name || node.type
        });
      }
    });
    
    // If no triggers found, workflow can be manually executed
    if (triggers.length === 0) {
      triggers.push({
        type: 'manual',
        node: 'Manual Execution'
      });
    }
    
    return triggers;
  }

  /**
   * Predict output structure from workflow nodes
   */
  static predictOutputStructure(workflowJson) {
    const nodes = workflowJson?.nodes || [];
    const outputs = [];
    
    // Look for terminal nodes (nodes with no outgoing connections)
    const connections = workflowJson?.connections || {};
    
    nodes.forEach(node => {
      const hasOutgoing = connections[node.name]?.main?.[0]?.length > 0;
      
      if (!hasOutgoing) {
        // This is likely an output node
        outputs.push({
          node: node.name,
          nodeType: node.type,
          expectedOutput: this._predictNodeOutput(node)
        });
      }
    });
    
    return outputs;
  }

  /**
   * Predict what a node outputs based on its type
   * @private
   */
  static _predictNodeOutput(node) {
    const type = node.type?.toLowerCase() || '';
    
    if (type.includes('googledocs')) return { type: 'document', fields: ['documentId', 'url'] };
    if (type.includes('googlesheets')) return { type: 'spreadsheet', fields: ['spreadsheetId', 'updatedRows'] };
    if (type.includes('gmail')) return { type: 'email', fields: ['messageId', 'threadId'] };
    if (type.includes('slack')) return { type: 'message', fields: ['messageId', 'channel'] };
    if (type.includes('webhook')) return { type: 'http', fields: ['status', 'data'] };
    
    return { type: 'generic', fields: [] };
  }

  /**
   * Extract workflow metadata
   */
  static extractMetadata(workflowJson) {
    return {
      name: workflowJson.name,
      nodeCount: workflowJson.nodes?.length || 0,
      complexity: this._calculateComplexity(workflowJson),
      providers: this._detectProviders(workflowJson),
      tags: workflowJson.tags || []
    };
  }

  /**
   * Calculate workflow complexity score
   * @private
   */
  static _calculateComplexity(workflowJson) {
    const nodeCount = workflowJson.nodes?.length || 0;
    const connectionCount = Object.keys(workflowJson.connections || {}).length;
    
    if (nodeCount <= 3 && connectionCount <= 2) return 'simple';
    if (nodeCount <= 6 && connectionCount <= 5) return 'moderate';
    return 'complex';
  }

  /**
   * Detect which providers/services are used
   * @private
   */
  static _detectProviders(workflowJson) {
    const providers = new Set();
    const nodes = workflowJson?.nodes || [];
    
    nodes.forEach(node => {
      const type = node.type?.toLowerCase() || '';
      if (type.includes('google')) providers.add('google');
      if (type.includes('slack')) providers.add('slack');
      if (type.includes('hubspot')) providers.add('hubspot');
      if (type.includes('salesforce')) providers.add('salesforce');
      if (type.includes('notion')) providers.add('notion');
      if (type.includes('airtable')) providers.add('airtable');
    });
    
    return Array.from(providers);
  }

  /**
   * Determine best execution strategy for workflow
   */
  static determineExecutionStrategy(workflowJson) {
    const triggers = this.detectTriggers(workflowJson);
    
    // Prefer webhook if available
    const webhook = triggers.find(t => t.type === 'webhook');
    if (webhook) {
      return { method: 'webhook', trigger: webhook };
    }
    
    // Fall back to direct API execution
    return { method: 'api', trigger: triggers[0] };
  }

  /**
   * Analyze a single node for execution context
   */
  static analyzeNode(node) {
    const registry = NodeMetadataRegistry[node.type];
    const operation = node.parameters?.operation || 'default';
    
    return {
      nodeType: node.type,
      nodeName: node.name,
      operation: operation,
      registryMetadata: registry?.operations?.[operation] || null,
      detectedInputs: this._extractNodeInputs(node)
    };
  }

  /**
   * Extract inputs referenced by a specific node
   * @private
   */
  static _extractNodeInputs(node) {
    const inputs = [];
    const jsonStr = JSON.stringify(node.parameters || {});
    
    const matches = jsonStr.matchAll(/\$json\.([a-zA-Z0-9_]+)/g);
    for (const match of matches) {
      inputs.push(match[1]);
    }
    
    return inputs;
  }

  /**
   * Validate user inputs against detected parameters
   */
  static validateInputs(detectedParameters, userInputs) {
    const errors = [];
    
    detectedParameters.forEach(param => {
      const value = userInputs[param.field];
      
      // Check required fields
      if (param.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field: param.field,
          message: `${param.label} is required`
        });
        return;
      }
      
      // Type validation
      if (value !== undefined && value !== null && value !== '') {
        switch(param.type) {
          case 'email':
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              errors.push({ field: param.field, message: 'Invalid email format' });
            }
            break;
          case 'url':
            if (!/^https?:\/\/.+/.test(value)) {
              errors.push({ field: param.field, message: 'Invalid URL format' });
            }
            break;
          case 'number':
            if (isNaN(value)) {
              errors.push({ field: param.field, message: 'Must be a number' });
            }
            break;
          case 'json':
            try {
              if (typeof value === 'string') {
                JSON.parse(value);
              }
            } catch (e) {
              errors.push({ field: param.field, message: 'Invalid JSON format' });
            }
            break;
        }
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = WorkflowAnalyzer;

