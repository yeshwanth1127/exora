// server/services/credentialMap.js
// LEGACY: Used as fallback when googleScopeRegistry.js doesn't match
// New flows use googleScopeRegistry.js for dynamic scope detection
// 
// Map n8n credential type keys (as found in workflow.nodes[].credentials keys)
// to the Google OAuth scopes required by that credential.
// Extend this map as you add more node credential types.

module.exports = {
  // keys here should match the credential keys found in your workflow JSON
  // e.g., node.credentials might contain "gmailOAuth2"
  
  // Gmail OAuth2 (without "Api" suffix)
  gmailOAuth2: [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ],
  
  // Gmail OAuth2 (with "Api" suffix - for backwards compatibility)
  gmailOAuth2Api: [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ],
  
  // Generic Google OAuth2 (fallback for multiple services)
  googleOAuth2Api: [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid',
    'email',
    'profile'
  ],
  
  // Google Drive
  googleDriveOAuth2Api: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
  ],
  
  // Google Sheets
  googleSheetsOAuth2Api: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file'
  ],
  
  // Google Calendar
  googleCalendarOAuth2Api: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ],
  
  // Add more mappings here (key => array of scopes)
  // Example for future additions:
  // googleContactsOAuth2Api: ['https://www.googleapis.com/auth/contacts'],
  // youtubeOAuth2Api: ['https://www.googleapis.com/auth/youtube'],
};

