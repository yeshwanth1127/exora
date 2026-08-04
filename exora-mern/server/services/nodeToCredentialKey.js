// server/services/nodeToCredentialKey.js

/**
 * Maps n8n node types to their expected credential key names.
 * Used when template workflows have nodes without credential placeholders defined.
 * This allows us to auto-detect which credential type should be created.
 */

module.exports = {
  // Gmail nodes
  'n8n-nodes-base.gmail': 'gmailOAuth2',
  'n8n-nodes-base.gmailtrigger': 'gmailOAuth2',
  
  // Google Sheets
  'n8n-nodes-base.googlesheets': 'googleSheetsOAuth2Api',
  
  // Google Drive
  'n8n-nodes-base.googledrive': 'googleDriveOAuth2Api',
  'n8n-nodes-base.googledrivetrigger': 'googleDriveOAuth2Api',
  
  // Google Calendar
  'n8n-nodes-base.googlecalendar': 'googleCalendarOAuth2Api',
  'n8n-nodes-base.googlecalendartrigger': 'googleCalendarOAuth2Api',
  
  // Google Docs
  'n8n-nodes-base.googledocs': 'googleDocsOAuth2Api',
  
  // Google Contacts
  'n8n-nodes-base.googlecontacts': 'googleContactsOAuth2Api',
  
  // Google Slides
  'n8n-nodes-base.googleslides': 'googleSlidesOAuth2Api',
  
  // Generic fallback for any other Google node
  // This is used as last resort if specific mapping doesn't exist
  '_google_fallback': 'googleOAuth2Api'
};

/**
 * Get credential key for a given node type
 * @param {string} nodeType - The node.type from n8n
 * @returns {string|null} - Credential key or null if not a Google node
 */
function getCredentialKeyForNodeType(nodeType) {
  if (!nodeType) return null;
  
  const normalized = nodeType.toLowerCase();
  
  // Direct lookup
  if (module.exports[normalized]) {
    return module.exports[normalized];
  }
  
  // Check original case
  if (module.exports[nodeType]) {
    return module.exports[nodeType];
  }
  
  // Fallback for any node containing 'google'
  if (normalized.includes('google')) {
    return module.exports._google_fallback;
  }
  
  return null;
}

module.exports.getCredentialKeyForNodeType = getCredentialKeyForNodeType;

