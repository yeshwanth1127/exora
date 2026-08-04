// server/services/googleScopeDetector.js

const registry = require('./googleScopeRegistry');

function lower(s) { 
  return String(s || '').toLowerCase(); 
}

/**
 * Match node type against registry entries
 * @param {string} nodeType - The node.type from n8n workflow
 * @returns {object|null} - Matched registry entry or null
 */
function matchRegistry(nodeType) {
  const t = lower(nodeType);
  
  // First pass: exact match (preferred)
  for (const r of registry) {
    if (r.pattern === t) {
      return r;
    }
  }
  
  // Second pass: substring fallback (for generic patterns like 'google')
  for (const r of registry) {
    if (t.includes(r.pattern)) {
      return r;
    }
  }
  
  return null;
}

/**
 * Derive minimal OAuth scopes required for a single node
 * @param {object} node - Single node object from workflow JSON
 * @returns {string[]} - Array of required scope URLs
 */
function deriveScopesForNode(node) {
  if (!node || !node.type) {
    return [];
  }

  const reg = matchRegistry(node.type);
  if (!reg) {
    return [];
  }

  // Determine operation name from node parameters
  // n8n nodes typically store operation in parameters.operation or parameters.resource
  const params = node.parameters || {};
  const op = params.operation || 
             params.operationType || 
             params.resource || 
             params.action ||
             null;

  // Normalize operation to lowercase string
  const opKey = op ? lower(String(op)) : 'default';

  // Get operation-specific scopes or fall back to default
  const ops = reg.operations || {};
  
  if (ops[opKey]) {
    return Array.from(new Set(ops[opKey]));
  }
  
  if (ops.default) {
    return Array.from(new Set(ops.default));
  }

  return [];
}

/**
 * Compute union of all Google scopes required by a workflow
 * @param {object} workflow - Full workflow object with nodes array
 * @returns {string[]} - Array of unique scope URLs
 */
function computeGoogleScopesFromWorkflow(workflow) {
  const scopeSet = new Set();
  
  const nodes = workflow?.nodes || [];
  nodes.forEach(node => {
    const scopes = deriveScopesForNode(node);
    scopes.forEach(s => scopeSet.add(s));
  });
  
  return Array.from(scopeSet);
}

/**
 * Detect which Google service a node belongs to
 * @param {object} node - Node object
 * @returns {string|null} - Service name (gmail, drive, sheets, etc.) or null
 */
function detectNodeService(node) {
  if (!node || !node.type) {
    return null;
  }
  
  const reg = matchRegistry(node.type);
  return reg ? reg.service : null;
}

/**
 * Check if a node type is a Google node
 * @param {string} nodeType - The node.type string
 * @returns {boolean} - True if it's a Google node
 */
function isGoogleNode(nodeType) {
  return matchRegistry(nodeType) !== null;
}

module.exports = { 
  deriveScopesForNode, 
  matchRegistry, 
  computeGoogleScopesFromWorkflow,
  detectNodeService,
  isGoogleNode
};

