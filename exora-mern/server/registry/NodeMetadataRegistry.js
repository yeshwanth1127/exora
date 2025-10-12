// server/registry/NodeMetadataRegistry.js

/**
 * Node Metadata Registry
 * Enhanced metadata for known n8n node types
 * Used to enrich auto-detected parameters with labels, hints, and validation rules
 * 
 * This registry is OPTIONAL - WorkflowAnalyzer works without it
 * but provides better UX when metadata is available
 */

module.exports = {
  // ==================== GOOGLE NODES ====================
  
  'n8n-nodes-base.googleDocs': {
    displayName: 'Google Docs',
    icon: '📄',
    operations: {
      create: {
        label: 'Create Document',
        parameters: [
          { 
            name: 'title', 
            label: 'Document Title', 
            type: 'string', 
            required: true,
            placeholder: 'My New Document',
            hint: 'The title of the document to create'
          },
          { 
            name: 'folderId', 
            label: 'Folder ID (Optional)', 
            type: 'string', 
            required: false,
            hint: 'Google Drive folder ID. Leave empty for root folder'
          },
          { 
            name: 'content', 
            label: 'Document Content', 
            type: 'text', 
            required: false,
            placeholder: 'Enter document content...'
          }
        ]
      },
      get: {
        label: 'Get Document',
        parameters: [
          { name: 'documentId', label: 'Document ID', type: 'string', required: true }
        ]
      },
      update: {
        label: 'Update Document',
        parameters: [
          { name: 'documentId', label: 'Document ID', type: 'string', required: true },
          { name: 'content', label: 'New Content', type: 'text', required: true }
        ]
      }
    }
  },

  'n8n-nodes-base.googleSheets': {
    displayName: 'Google Sheets',
    icon: '📊',
    operations: {
      append: {
        label: 'Append Rows',
        parameters: [
          { 
            name: 'spreadsheetId', 
            label: 'Spreadsheet ID', 
            type: 'string', 
            required: true,
            hint: 'Found in the spreadsheet URL'
          },
          { 
            name: 'range', 
            label: 'Range', 
            type: 'string', 
            required: true,
            default: 'Sheet1!A:Z',
            placeholder: 'Sheet1!A:Z'
          },
          { 
            name: 'values', 
            label: 'Values to Append', 
            type: 'json', 
            required: true,
            hint: 'Array of arrays. Example: [["A1", "B1"], ["A2", "B2"]]',
            default: [["Value 1", "Value 2"]]
          }
        ]
      },
      read: {
        label: 'Read Rows',
        parameters: [
          { name: 'spreadsheetId', label: 'Spreadsheet ID', type: 'string', required: true },
          { name: 'range', label: 'Range', type: 'string', required: true, default: 'Sheet1!A:Z' }
        ]
      },
      update: {
        label: 'Update Rows',
        parameters: [
          { name: 'spreadsheetId', label: 'Spreadsheet ID', type: 'string', required: true },
          { name: 'range', label: 'Range', type: 'string', required: true },
          { name: 'values', label: 'New Values', type: 'json', required: true }
        ]
      }
    }
  },

  'n8n-nodes-base.googleDrive': {
    displayName: 'Google Drive',
    icon: '📁',
    operations: {
      upload: {
        label: 'Upload File',
        parameters: [
          { name: 'name', label: 'File Name', type: 'string', required: true },
          { name: 'folderId', label: 'Folder ID', type: 'string', required: false },
          { name: 'file', label: 'File to Upload', type: 'file', required: true }
        ]
      },
      create: {
        label: 'Create Folder',
        parameters: [
          { name: 'name', label: 'Folder Name', type: 'string', required: true },
          { name: 'parentFolderId', label: 'Parent Folder ID', type: 'string', required: false }
        ]
      }
    }
  },

  'n8n-nodes-base.gmail': {
    displayName: 'Gmail',
    icon: '📧',
    operations: {
      send: {
        label: 'Send Email',
        parameters: [
          { 
            name: 'toEmail', 
            label: 'To', 
            type: 'email', 
            required: true,
            placeholder: 'recipient@example.com'
          },
          { 
            name: 'subject', 
            label: 'Subject', 
            type: 'string', 
            required: true,
            placeholder: 'Email subject'
          },
          { 
            name: 'body', 
            label: 'Email Body', 
            type: 'text', 
            required: true,
            placeholder: 'Email content...'
          },
          { 
            name: 'ccEmail', 
            label: 'CC', 
            type: 'email', 
            required: false 
          }
        ]
      }
    }
  },

  'n8n-nodes-base.googleCalendar': {
    displayName: 'Google Calendar',
    icon: '📅',
    operations: {
      create: {
        label: 'Create Event',
        parameters: [
          { name: 'summary', label: 'Event Title', type: 'string', required: true },
          { name: 'startDate', label: 'Start Date/Time', type: 'datetime', required: true },
          { name: 'endDate', label: 'End Date/Time', type: 'datetime', required: true },
          { name: 'description', label: 'Description', type: 'text', required: false },
          { name: 'location', label: 'Location', type: 'string', required: false }
        ]
      }
    }
  },

  // ==================== SLACK NODES ====================

  'n8n-nodes-base.slack': {
    displayName: 'Slack',
    icon: '💬',
    operations: {
      postMessage: {
        label: 'Post Message',
        parameters: [
          { 
            name: 'channel', 
            label: 'Channel', 
            type: 'string', 
            required: true,
            placeholder: '#general',
            hint: 'Channel name or ID'
          },
          { 
            name: 'text', 
            label: 'Message', 
            type: 'text', 
            required: true,
            placeholder: 'Your message here...'
          },
          { 
            name: 'username', 
            label: 'Bot Username', 
            type: 'string', 
            required: false 
          }
        ]
      }
    }
  },

  // ==================== HUBSPOT NODES ====================

  'n8n-nodes-base.hubspot': {
    displayName: 'HubSpot',
    icon: '🧡',
    operations: {
      createContact: {
        label: 'Create Contact',
        parameters: [
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'firstName', label: 'First Name', type: 'string', required: false },
          { name: 'lastName', label: 'Last Name', type: 'string', required: false },
          { name: 'company', label: 'Company', type: 'string', required: false }
        ]
      }
    }
  },

  // ==================== NOTION NODES ====================

  'n8n-nodes-base.notion': {
    displayName: 'Notion',
    icon: '📓',
    operations: {
      createPage: {
        label: 'Create Page',
        parameters: [
          { name: 'databaseId', label: 'Database ID', type: 'string', required: true },
          { name: 'title', label: 'Page Title', type: 'string', required: true },
          { name: 'properties', label: 'Properties', type: 'json', required: false }
        ]
      }
    }
  },

  // ==================== HTTP/WEBHOOK NODES ====================

  'n8n-nodes-base.webhook': {
    displayName: 'Webhook',
    icon: '🔗',
    operations: {
      default: {
        label: 'Webhook Trigger',
        parameters: [
          { 
            name: 'webhookPayload', 
            label: 'Request Payload', 
            type: 'json', 
            required: false,
            hint: 'Data to send in the webhook request body'
          }
        ]
      }
    }
  },

  'n8n-nodes-base.httpRequest': {
    displayName: 'HTTP Request',
    icon: '🌐',
    operations: {
      default: {
        label: 'HTTP Request',
        parameters: [
          { name: 'url', label: 'URL', type: 'url', required: true },
          { name: 'body', label: 'Request Body', type: 'json', required: false }
        ]
      }
    }
  },

  // ==================== AIRTABLE NODES ====================

  'n8n-nodes-base.airtable': {
    displayName: 'Airtable',
    icon: '🎨',
    operations: {
      create: {
        label: 'Create Record',
        parameters: [
          { name: 'baseId', label: 'Base ID', type: 'string', required: true },
          { name: 'table', label: 'Table Name', type: 'string', required: true },
          { name: 'fields', label: 'Fields', type: 'json', required: true }
        ]
      }
    }
  }
};

/**
 * Get metadata for a specific node type
 * @param {string} nodeType - The node type (e.g., 'n8n-nodes-base.googleDocs')
 * @param {string} operation - The operation (e.g., 'create')
 * @returns {object|null} - Metadata or null
 */
function getNodeMetadata(nodeType, operation = 'default') {
  const registry = module.exports[nodeType];
  if (!registry) return null;
  
  return {
    ...registry,
    operationMetadata: registry.operations?.[operation] || registry.operations?.default || null
  };
}

/**
 * Check if node type exists in registry
 * @param {string} nodeType
 * @returns {boolean}
 */
function hasMetadata(nodeType) {
  return !!module.exports[nodeType];
}

module.exports.getNodeMetadata = getNodeMetadata;
module.exports.hasMetadata = hasMetadata;

