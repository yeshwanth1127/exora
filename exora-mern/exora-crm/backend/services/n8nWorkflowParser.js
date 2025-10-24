/**
 * n8n Workflow Parser
 * Extracts automation module metadata from n8n workflow nodes
 * 
 * This service analyzes workflow handler nodes to discover:
 * - Available automation modules
 * - Required configuration fields
 * - Field types and validation
 * - Required credentials
 */

const HANDLER_NODE_SUFFIX = ' Handler';

/**
 * Parse workflow to extract automation modules
 * @param {Object} workflowJson - Full n8n workflow object from API
 * @returns {Array} Array of module metadata objects
 */
function parseWorkflowModules(workflowJson) {
  const modules = [];
  const nodes = workflowJson.nodes || [];
  
  console.log(`[Parser] Analyzing workflow: ${workflowJson.name || workflowJson.id}`);
  console.log(`[Parser] Total nodes: ${nodes.length}`);
  
  // Find all Handler nodes (they define automation modules)
  const handlerNodes = nodes.filter(node => 
    node.name && 
    node.name.endsWith(HANDLER_NODE_SUFFIX) && 
    node.type === 'n8n-nodes-base.code'
  );
  
  console.log(`[Parser] Found ${handlerNodes.length} handler nodes`);
  
  handlerNodes.forEach(node => {
    try {
      const jsCode = node.parameters?.jsCode || '';
      const module = extractModuleMetadata(node, jsCode, workflowJson);
      
      if (module) {
        modules.push(module);
        console.log(`  ✅ Extracted: ${module.name} (${module.module_key})`);
      }
    } catch (error) {
      console.error(`  ❌ Failed to parse handler ${node.name}:`, error.message);
    }
  });
  
  return modules;
}

/**
 * Extract module metadata from a handler node
 */
function extractModuleMetadata(node, jsCode, workflowJson) {
  // Extract module key from handler check
  // Pattern: const xxxConfig = data.enabled_modules?.xxx;
  const moduleKeyMatch = jsCode.match(/data\.enabled_modules\?\.(\w+)/);
  if (!moduleKeyMatch) {
    console.warn(`  ⚠️  Could not extract module_key from ${node.name}`);
    return null;
  }
  
  const moduleKey = moduleKeyMatch[1];
  
  // Extract module name from node name
  // "WhatsApp Handler" -> "WhatsApp"
  const moduleName = node.name.replace(HANDLER_NODE_SUFFIX, '').trim();
  
  // Extract config fields from the code
  const configFields = extractConfigFields(jsCode, moduleKey);
  
  // Determine category based on module type
  const category = determineCategory(moduleKey);
  
  // Get icon based on module key
  const icon = getModuleIcon(moduleKey);
  
  // Generate description
  const description = generateDescription(moduleKey, moduleName, jsCode);
  
  // Generate config schema
  const configSchema = generateConfigSchema(configFields, jsCode);
  
  // Extract required credentials (basic version)
  const requiredCredentials = extractRequiredCredentials(moduleKey);
  
  return {
    module_key: moduleKey,
    name: `${moduleName} Integration`,
    description,
    icon,
    category,
    config_schema: configSchema,
    required_credentials: requiredCredentials,
    node_id: node.id,
    node_name: node.name
  };
}

/**
 * Extract configuration field names from handler code
 */
function extractConfigFields(jsCode, moduleKey) {
  const fields = [];
  
  // Look for config field extractions
  // Patterns:
  // 1. field_name: xxxConfig.field_name || 'default'
  // 2. field_name: config.field_name || 'default'
  const patterns = [
    new RegExp(`(\\w+):\\s*\\w*[Cc]onfig\\.(\\w+)`, 'g'),
    new RegExp(`const\\s+(\\w+)\\s*=\\s*\\w*[Cc]onfig\\.(\\w+)`, 'g')
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(jsCode)) !== null) {
      const fieldName = match[2];
      if (fieldName && !fields.includes(fieldName) && fieldName !== 'length') {
        fields.push(fieldName);
      }
    }
  });
  
  return fields;
}

/**
 * Generate JSON Schema for configuration fields
 */
function generateConfigSchema(fields, jsCode) {
  if (fields.length === 0) {
    return { properties: {} };
  }
  
  const properties = {};
  const required = [];
  
  fields.forEach(field => {
    const fieldDef = inferFieldDefinition(field, jsCode);
    properties[field] = fieldDef;
    
    // Mark as required if no default value in code
    if (!hasDefaultValue(field, jsCode)) {
      required.push(field);
    }
  });
  
  const schema = { properties };
  if (required.length > 0) {
    schema.required = required;
  }
  
  return schema;
}

/**
 * Infer field type and constraints from field name and code usage
 */
function inferFieldDefinition(field, jsCode) {
  const fieldDef = {
    title: formatFieldName(field),
    type: 'string'
  };
  
  // Boolean fields
  if (field.includes('enabled') || field.includes('auto_') || field.match(/^is_|^has_/)) {
    fieldDef.type = 'boolean';
    fieldDef.default = inferBooleanDefault(field, jsCode);
  }
  // Number fields
  else if (field === 'temperature') {
    fieldDef.type = 'number';
    fieldDef.minimum = 0;
    fieldDef.maximum = 1;
    fieldDef.default = 0.7;
    fieldDef.description = 'Controls randomness in AI responses (0 = focused, 1 = creative)';
  }
  else if (field === 'top_k') {
    fieldDef.type = 'integer';
    fieldDef.minimum = 1;
    fieldDef.maximum = 10;
    fieldDef.default = 3;
    fieldDef.description = 'Number of context documents to retrieve';
  }
  else if (field.includes('tokens') || field.includes('max_')) {
    fieldDef.type = 'integer';
    fieldDef.minimum = 1;
    fieldDef.default = field.includes('tokens') ? 500 : 100;
  }
  else if (field.includes('duration')) {
    fieldDef.type = 'integer';
    fieldDef.minimum = 5;
    fieldDef.default = 30;
    fieldDef.description = 'Duration in minutes';
  }
  // Enum fields (AI models, etc.)
  else if (field === 'ai_model' || field.includes('model')) {
    fieldDef.enum = ['gpt-4', 'gpt-3.5-turbo', 'llama3', 'mistral'];
    fieldDef.default = 'gpt-3.5-turbo';
    fieldDef.description = 'Select which AI model to use';
  }
  // Text area fields
  else if (field.includes('prompt') || field.includes('message') || field.includes('template')) {
    fieldDef.type = 'string';
    fieldDef.format = 'textarea';
    fieldDef.description = 'Enter text template or prompt';
  }
  // Email fields
  else if (field.includes('email')) {
    fieldDef.format = 'email';
    fieldDef.description = 'Enter a valid email address';
  }
  // URL fields
  else if (field.includes('url') || field.includes('webhook')) {
    fieldDef.format = 'uri';
    fieldDef.description = 'Enter a valid URL';
  }
  
  return fieldDef;
}

/**
 * Check if field has a default value in code
 */
function hasDefaultValue(field, jsCode) {
  // Look for: field_name: config.field_name || 'something'
  const defaultPattern = new RegExp(`${field}\\s*\\|\\|\\s*['"\`]`, 'i');
  return defaultPattern.test(jsCode);
}

/**
 * Infer boolean default from code
 */
function inferBooleanDefault(field, jsCode) {
  // Look for: !== false (default true)
  if (jsCode.includes(`${field} !== false`)) return true;
  // Look for: || true
  if (jsCode.includes(`${field} || true`)) return true;
  // Look for: || false
  if (jsCode.includes(`${field} || false`)) return false;
  // Default
  return false;
}

/**
 * Determine module category
 */
function determineCategory(moduleKey) {
  const categories = {
    whatsapp: 'messaging',
    email: 'messaging',
    sms: 'messaging',
    chatbot: 'messaging',
    ai_agent: 'ai',
    rag_agent: 'ai',
    calendar: 'productivity',
    invoice: 'productivity',
    payment: 'productivity',
    analytics: 'analytics'
  };
  
  return categories[moduleKey] || 'general';
}

/**
 * Get emoji icon for module
 */
function getModuleIcon(moduleKey) {
  const icons = {
    whatsapp: '💬',
    ai_agent: '🤖',
    rag_agent: '📚',
    email: '📧',
    sms: '📱',
    calendar: '📅',
    chatbot: '💭',
    invoice: '🧾',
    payment: '💳',
    analytics: '📊',
    voice: '📞',
    notification: '🔔'
  };
  
  return icons[moduleKey] || '🔧';
}

/**
 * Generate description for module
 */
function generateDescription(moduleKey, moduleName, jsCode) {
  // Try to extract from code comments
  const commentMatch = jsCode.match(/\/\/\s*(.+)/);
  if (commentMatch && commentMatch[1].length > 10 && commentMatch[1].length < 200) {
    return commentMatch[1].trim();
  }
  
  // Predefined descriptions
  const descriptions = {
    whatsapp: 'Send and receive WhatsApp messages with AI-powered auto-responses',
    ai_agent: 'Intelligent AI assistant for customer interactions and support',
    rag_agent: 'Context-aware AI responses using your knowledge base documents',
    email: 'Automated email campaigns, follow-ups, and notifications',
    sms: 'Send SMS text messages and notifications via Twilio',
    calendar: 'Google Calendar integration with automatic event creation and syncing',
    chatbot: 'Embeddable website chat widget with AI capabilities',
    invoice: 'Automated invoice generation and delivery',
    payment: 'Payment processing and transaction management',
    analytics: 'Track and analyze customer interactions and automation performance'
  };
  
  return descriptions[moduleKey] || `${moduleName} automation and integration`;
}

/**
 * Extract required credentials (basic mapping)
 */
function extractRequiredCredentials(moduleKey) {
  const credentialMap = {
    whatsapp: ['evolution_api'],
    ai_agent: ['openai'],
    rag_agent: ['openai', 'pinecone'],
    email: ['gmail'],
    sms: ['twilio'],
    calendar: ['google_calendar'],
    chatbot: [],
    invoice: [],
    payment: ['stripe']
  };
  
  return credentialMap[moduleKey] || [];
}

/**
 * Format field name for display
 */
function formatFieldName(fieldName) {
  return fieldName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

module.exports = {
  parseWorkflowModules,
  extractModuleMetadata
};



