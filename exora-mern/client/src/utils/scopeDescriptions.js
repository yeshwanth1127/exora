// client/src/utils/scopeDescriptions.js

/**
 * Human-readable descriptions for OAuth scopes
 * Used to explain to users what permissions they're granting
 */

const scopeDescriptions = {
  // Gmail scopes
  'https://www.googleapis.com/auth/gmail.send': {
    title: 'Send emails',
    description: 'Send emails on your behalf',
    icon: '📤'
  },
  'https://www.googleapis.com/auth/gmail.readonly': {
    title: 'Read emails',
    description: 'Read your email messages and settings',
    icon: '📧'
  },
  'https://www.googleapis.com/auth/gmail.modify': {
    title: 'Manage emails',
    description: 'Read, send, delete, and manage your email',
    icon: '✉️'
  },

  // Google Drive scopes
  'https://www.googleapis.com/auth/drive.file': {
    title: 'Access Drive files',
    description: 'Access files created or opened by this app',
    icon: '📁'
  },
  'https://www.googleapis.com/auth/drive': {
    title: 'Full Drive access',
    description: 'See, edit, create, and delete all of your Google Drive files',
    icon: '💾'
  },
  'https://www.googleapis.com/auth/drive.readonly': {
    title: 'View Drive files',
    description: 'View your Google Drive files',
    icon: '👁️'
  },
  'https://www.googleapis.com/auth/drive.metadata.readonly': {
    title: 'View Drive metadata',
    description: 'View metadata for files in your Google Drive',
    icon: '📋'
  },

  // Google Sheets scopes
  'https://www.googleapis.com/auth/spreadsheets': {
    title: 'Manage Sheets',
    description: 'View and manage your Google Sheets',
    icon: '📊'
  },
  'https://www.googleapis.com/auth/spreadsheets.readonly': {
    title: 'View Sheets',
    description: 'View your Google Sheets',
    icon: '📈'
  },

  // Google Calendar scopes
  'https://www.googleapis.com/auth/calendar': {
    title: 'Manage Calendar',
    description: 'View and edit events on all your calendars',
    icon: '📅'
  },
  'https://www.googleapis.com/auth/calendar.readonly': {
    title: 'View Calendar',
    description: 'View events on all your calendars',
    icon: '📆'
  },
  'https://www.googleapis.com/auth/calendar.events': {
    title: 'Manage Calendar events',
    description: 'View and edit calendar events',
    icon: '🗓️'
  },

  // Google Docs scopes
  'https://www.googleapis.com/auth/documents': {
    title: 'Manage Docs',
    description: 'View and manage your Google Docs',
    icon: '📝'
  },
  'https://www.googleapis.com/auth/documents.readonly': {
    title: 'View Docs',
    description: 'View your Google Docs',
    icon: '📄'
  },

  // Google Contacts scopes
  'https://www.googleapis.com/auth/contacts': {
    title: 'Manage Contacts',
    description: 'View and manage your contacts',
    icon: '👥'
  },
  'https://www.googleapis.com/auth/contacts.readonly': {
    title: 'View Contacts',
    description: 'View your contacts',
    icon: '👤'
  },

  // Google Slides scopes
  'https://www.googleapis.com/auth/presentations': {
    title: 'Manage Slides',
    description: 'View and manage your Google Slides presentations',
    icon: '🖼️'
  },
  'https://www.googleapis.com/auth/presentations.readonly': {
    title: 'View Slides',
    description: 'View your Google Slides presentations',
    icon: '🎞️'
  },

  // User info scopes
  'https://www.googleapis.com/auth/userinfo.email': {
    title: 'Email address',
    description: 'View your email address',
    icon: '📬'
  },
  'https://www.googleapis.com/auth/userinfo.profile': {
    title: 'Basic profile',
    description: 'View your basic profile info',
    icon: '👤'
  },
  'openid': {
    title: 'Identity',
    description: 'Authenticate your identity',
    icon: '🔐'
  },
  'email': {
    title: 'Email',
    description: 'View your email address',
    icon: '📧'
  },
  'profile': {
    title: 'Profile',
    description: 'View your basic profile information',
    icon: '👤'
  }
};

/**
 * Get human-readable description for a scope URL
 * @param {string} scopeUrl - Full scope URL
 * @returns {object} - Description object with title, description, icon
 */
export function getScopeDescription(scopeUrl) {
  if (scopeDescriptions[scopeUrl]) {
    return scopeDescriptions[scopeUrl];
  }

  // Fallback for unknown scopes
  return {
    title: scopeUrl.split('/').pop() || 'Unknown',
    description: scopeUrl,
    icon: '🔑'
  };
}

/**
 * Group scopes by service
 * @param {string[]} scopes - Array of scope URLs
 * @returns {object} - Grouped scopes { gmail: [], drive: [], etc }
 */
export function groupScopesByService(scopes) {
  const grouped = {
    gmail: [],
    drive: [],
    sheets: [],
    calendar: [],
    docs: [],
    contacts: [],
    slides: [],
    userinfo: [],
    other: []
  };

  scopes.forEach(scope => {
    const lower = scope.toLowerCase();
    if (lower.includes('gmail')) {
      grouped.gmail.push(scope);
    } else if (lower.includes('drive')) {
      grouped.drive.push(scope);
    } else if (lower.includes('spreadsheets') || lower.includes('sheets')) {
      grouped.sheets.push(scope);
    } else if (lower.includes('calendar')) {
      grouped.calendar.push(scope);
    } else if (lower.includes('documents') || lower.includes('docs')) {
      grouped.docs.push(scope);
    } else if (lower.includes('contacts')) {
      grouped.contacts.push(scope);
    } else if (lower.includes('presentations') || lower.includes('slides')) {
      grouped.slides.push(scope);
    } else if (lower.includes('userinfo') || lower.includes('openid') || scope === 'email' || scope === 'profile') {
      grouped.userinfo.push(scope);
    } else {
      grouped.other.push(scope);
    }
  });

  // Remove empty groups
  Object.keys(grouped).forEach(key => {
    if (grouped[key].length === 0) {
      delete grouped[key];
    }
  });

  return grouped;
}

/**
 * Get provider icon
 * @param {string} provider - Provider name (google, microsoft, etc.)
 * @returns {string} - Icon emoji or URL
 */
export function getProviderIcon(provider) {
  const icons = {
    google: '🔵',
    microsoft: '🔷',
    hubspot: '🧡',
    salesforce: '⚡',
    slack: '💬',
    notion: '📓',
    airtable: '🎨'
  };

  return icons[provider?.toLowerCase()] || '🔌';
}

/**
 * Get provider display name
 * @param {string} provider - Provider name
 * @returns {string} - Display name
 */
export function getProviderDisplayName(provider) {
  const names = {
    google: 'Google',
    microsoft: 'Microsoft',
    hubspot: 'HubSpot',
    salesforce: 'Salesforce',
    slack: 'Slack',
    notion: 'Notion',
    airtable: 'Airtable'
  };

  return names[provider?.toLowerCase()] || provider;
}

export default scopeDescriptions;

