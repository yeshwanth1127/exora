// server/services/ProviderOrchestrator.js

const { deriveScopesForNode, detectNodeService, isGoogleNode } = require('./googleScopeDetector');
const { getCredentialKeyForNodeType } = require('./nodeToCredentialKey');
const credentialMap = require('./credentialMap'); // Legacy fallback

/**
 * Comprehensive provider and scope detection for workflows.
 * Handles nodes with and without credential placeholders.
 * Returns structured provider requirements for multi-step activation.
 */
class ProviderOrchestrator {
  
  /**
   * Detect all providers and their scope requirements from a workflow
   * @param {object} workflow - Full workflow object with nodes
   * @returns {Array} - Array of provider requirement objects
   */
  static detectAllProvidersAndScopes(workflow) {
    const providerMap = new Map(); // credentialType -> provider info
    const nodes = workflow?.nodes || [];

    nodes.forEach(node => {
      // Strategy 1: Node has credentials defined (existing template approach)
      if (node.credentials && Object.keys(node.credentials).length > 0) {
        Object.keys(node.credentials).forEach(credType => {
          if (!providerMap.has(credType)) {
            providerMap.set(credType, {
              credentialType: credType,
              provider: this._getProviderFromCredType(credType),
              type: this._getCredentialAuthType(credType),
              scopes: new Set(),
              nodes: []
            });
          }
          
          const providerInfo = providerMap.get(credType);
          providerInfo.nodes.push(node.name || node.type);
        });
      }
      
      // Strategy 2: Node is a Google node but has no credentials defined
      // We'll auto-detect and suggest credential
      else if (isGoogleNode(node.type)) {
        const suggestedCredType = getCredentialKeyForNodeType(node.type);
        
        if (suggestedCredType && !providerMap.has(suggestedCredType)) {
          providerMap.set(suggestedCredType, {
            credentialType: suggestedCredType,
            provider: 'google',
            type: 'oauth2',
            scopes: new Set(),
            nodes: [],
            autoDetected: true // Flag that this wasn't in template
          });
        }
        
        if (suggestedCredType) {
          const providerInfo = providerMap.get(suggestedCredType);
          providerInfo.nodes.push(node.name || node.type);
        }
      }
      
      // Strategy 3: Derive scopes from node operations (registry-based)
      if (isGoogleNode(node.type)) {
        const scopes = deriveScopesForNode(node);
        const service = detectNodeService(node);
        
        if (scopes.length > 0) {
          // Find or create appropriate Google credential entry
          const credType = this._findOrCreateGoogleCredentialEntry(
            providerMap, 
            node.type, 
            service
          );
          
          if (credType) {
            const providerInfo = providerMap.get(credType);
            scopes.forEach(scope => providerInfo.scopes.add(scope));
          }
        }
      }
    });

    // Convert Map to Array and normalize scopes to arrays
    const providers = Array.from(providerMap.values()).map(info => ({
      credentialType: info.credentialType,
      provider: info.provider,
      type: info.type,
      scopes: Array.from(info.scopes),
      nodes: info.nodes,
      autoDetected: info.autoDetected || false,
      required: true // All detected providers are required by default
    }));

    return providers;
  }

  /**
   * Find or create a Google credential entry in the provider map
   * @private
   */
  static _findOrCreateGoogleCredentialEntry(providerMap, nodeType, service) {
    // First check if we already have a Google credential in the map
    for (const [credType, info] of providerMap.entries()) {
      if (info.provider === 'google') {
        return credType;
      }
    }
    
    // If not, create a new entry using node type mapping
    const credType = getCredentialKeyForNodeType(nodeType) || 'googleOAuth2Api';
    
    if (!providerMap.has(credType)) {
      providerMap.set(credType, {
        credentialType: credType,
        provider: 'google',
        type: 'oauth2',
        scopes: new Set(),
        nodes: [],
        autoDetected: true
      });
    }
    
    return credType;
  }

  /**
   * Determine provider name from credential type
   * @private
   */
  static _getProviderFromCredType(credType) {
    const lower = credType.toLowerCase();
    
    if (lower.includes('google') || lower.includes('gmail')) return 'google';
    if (lower.includes('hubspot')) return 'hubspot';
    if (lower.includes('salesforce')) return 'salesforce';
    if (lower.includes('slack')) return 'slack';
    if (lower.includes('microsoft') || lower.includes('outlook')) return 'microsoft';
    if (lower.includes('notion')) return 'notion';
    if (lower.includes('airtable')) return 'airtable';
    
    // Check legacy credentialMap for OAuth detection
    if (credentialMap[credType] && Array.isArray(credentialMap[credType])) {
      return 'google'; // Most of credentialMap is Google
    }
    
    return 'unknown';
  }

  /**
   * Determine if credential type uses OAuth2 or manual entry
   * @private
   */
  static _getCredentialAuthType(credType) {
    const lower = credType.toLowerCase();
    
    // OAuth2 patterns
    if (lower.includes('oauth') || lower.includes('oauth2')) {
      return 'oauth2';
    }
    
    // Check legacy credentialMap - if it has scopes, it's OAuth
    if (credentialMap[credType] && Array.isArray(credentialMap[credType]) && credentialMap[credType].length > 0) {
      return 'oauth2';
    }
    
    // API key patterns
    if (lower.includes('api') && !lower.includes('oauth')) {
      return 'apikey';
    }
    
    // Default to manual for unknown
    return 'manual';
  }

  /**
   * Group providers by authentication type
   * @param {Array} providers - Array of provider objects
   * @returns {object} - Grouped by { oauth2: [], apikey: [], manual: [] }
   */
  static groupProvidersByType(providers) {
    return {
      oauth2: providers.filter(p => p.type === 'oauth2'),
      apikey: providers.filter(p => p.type === 'apikey'),
      manual: providers.filter(p => p.type === 'manual')
    };
  }

  /**
   * Validate that all required providers are present in completed list
   * @param {Array} requiredProviders - Providers needed
   * @param {Array} completedProviders - Providers already connected
   * @returns {object} - { allComplete: boolean, remaining: [] }
   */
  static validateProviderCompletion(requiredProviders, completedProviders) {
    const completedSet = new Set(
      completedProviders.map(p => p.credentialType || p)
    );
    
    const remaining = requiredProviders.filter(
      p => !completedSet.has(p.credentialType)
    );
    
    return {
      allComplete: remaining.length === 0,
      remaining: remaining,
      completed: completedProviders.length,
      total: requiredProviders.length
    };
  }
}

module.exports = ProviderOrchestrator;

