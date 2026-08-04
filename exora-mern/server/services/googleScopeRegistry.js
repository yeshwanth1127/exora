// server/services/googleScopeRegistry.js

/**
 * Registry for Google-based n8n node types → minimal OAuth scopes needed.
 *
 * Each entry:
 *   - pattern: matches node.type (lowercased). Use exact match first, then substring fallback.
 *   - service: identifier name (gmail, drive, sheets, etc.)
 *   - operations: mapping from operation key (lowercased) → array of required scopes.
 *     If a node's operation isn't listed, default fallback scopes are in `operations.default`.
 */

module.exports = [
  {
    pattern: 'n8n-nodes-base.gmail',
    service: 'gmail',
    operations: {
      getall: [
        'https://www.googleapis.com/auth/gmail.readonly'
      ],
      send: [
        'https://www.googleapis.com/auth/gmail.send'
      ],
      sendandsee: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly'
      ],
      addlabels: [
        'https://www.googleapis.com/auth/gmail.modify'
      ],
      delete: [
        'https://www.googleapis.com/auth/gmail.modify'
      ],
      markasspam: [
        'https://www.googleapis.com/auth/gmail.modify'
      ],
      default: [
        // read + send + modify combined (comprehensive default)
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.modify'
      ]
    }
  },
  {
    pattern: 'n8n-nodes-base.gmailtrigger',
    service: 'gmail',
    operations: {
      default: [
        'https://www.googleapis.com/auth/gmail.readonly'
      ]
    }
  },
  {
    pattern: 'n8n-nodes-base.googlesheets',
    service: 'sheets',
    operations: {
      read: [
        'https://www.googleapis.com/auth/spreadsheets.readonly'
      ],
      readrow: [
        'https://www.googleapis.com/auth/spreadsheets.readonly'
      ],
      append: [
        'https://www.googleapis.com/auth/spreadsheets'
      ],
      update: [
        'https://www.googleapis.com/auth/spreadsheets'
      ],
      delete: [
        'https://www.googleapis.com/auth/spreadsheets'
      ],
      create: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file'
      ],
      default: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file'
      ]
    }
  },
  {
    pattern: 'n8n-nodes-base.googledrive',
    service: 'drive',
    operations: {
      list: [
        'https://www.googleapis.com/auth/drive.readonly'
      ],
      get: [
        'https://www.googleapis.com/auth/drive.readonly'
      ],
      download: [
        'https://www.googleapis.com/auth/drive.readonly'
      ],
      upload: [
        'https://www.googleapis.com/auth/drive.file'
      ],
      create: [
        'https://www.googleapis.com/auth/drive.file'
      ],
      update: [
        'https://www.googleapis.com/auth/drive.file'
      ],
      delete: [
        'https://www.googleapis.com/auth/drive.file'
      ],
      share: [
        'https://www.googleapis.com/auth/drive.file'
      ],
      default: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.metadata.readonly'
      ]
    }
  },
  {
    pattern: 'n8n-nodes-base.googledrivetrigger',
    service: 'drive',
    operations: {
      default: [
        'https://www.googleapis.com/auth/drive.readonly'
      ]
    }
  },
  {
    pattern: 'n8n-nodes-base.googlecalendar',
    service: 'calendar',
    operations: {
      get: [
        'https://www.googleapis.com/auth/calendar.readonly'
      ],
      getall: [
        'https://www.googleapis.com/auth/calendar.readonly'
      ],
      create: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ],
      update: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ],
      delete: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ],
      default: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ]
    }
  },
  {
    pattern: 'n8n-nodes-base.googlecalendartrigger',
    service: 'calendar',
    operations: {
      default: [
        'https://www.googleapis.com/auth/calendar.readonly'
      ]
    }
  },
  {
    pattern: 'n8n-nodes-base.googledocs',
    service: 'docs',
    operations: {
      get: [
        'https://www.googleapis.com/auth/documents.readonly'
      ],
      create: [
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/drive.file'
      ],
      update: [
        'https://www.googleapis.com/auth/documents'
      ],
      default: [
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/drive.file'
      ]
    }
  },
  {
    pattern: 'n8n-nodes-base.googlecontacts',
    service: 'contacts',
    operations: {
      get: [
        'https://www.googleapis.com/auth/contacts.readonly'
      ],
      getall: [
        'https://www.googleapis.com/auth/contacts.readonly'
      ],
      create: [
        'https://www.googleapis.com/auth/contacts'
      ],
      update: [
        'https://www.googleapis.com/auth/contacts'
      ],
      delete: [
        'https://www.googleapis.com/auth/contacts'
      ],
      default: [
        'https://www.googleapis.com/auth/contacts'
      ]
    }
  },
  {
    pattern: 'n8n-nodes-base.googleslides',
    service: 'slides',
    operations: {
      get: [
        'https://www.googleapis.com/auth/presentations.readonly'
      ],
      create: [
        'https://www.googleapis.com/auth/presentations',
        'https://www.googleapis.com/auth/drive.file'
      ],
      update: [
        'https://www.googleapis.com/auth/presentations'
      ],
      default: [
        'https://www.googleapis.com/auth/presentations',
        'https://www.googleapis.com/auth/drive.file'
      ]
    }
  },
  // Fallback / generic Google node match — pattern is substring "google"
  {
    pattern: 'google',
    service: 'google',
    operations: {
      default: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'openid'
      ]
    }
  }
];

