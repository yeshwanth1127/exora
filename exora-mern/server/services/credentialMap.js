// server/services/credentialMap.js
// Map n8n credential type keys (as found in workflow.nodes[].credentials keys)
// to the Google OAuth scopes required by that credential.
// Extend this map as you add more node credential types.

module.exports = {
  // keys here should match the credential keys found in your workflow JSON
  // e.g., node.credentials might contain "gmailOAuth2"
  gmailOAuth2: [  // ✅ Changed to match your n8n credential type (no "Api" suffix)
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ],
  // Keep this for backwards compatibility or if you have workflows using the "Api" version
  gmailOAuth2Api: [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ],
  googleDriveOAuth2Api: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
  ],
  googleSheetsOAuth2Api: [
    'https://www.googleapis.com/auth/spreadsheets'
  ],
  googleCalendarOAuth2Api: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ],
  // Add more mappings here (key => array of scopes)
  // Example for future additions:
  // googleContactsOAuth2Api: ['https://www.googleapis.com/auth/contacts'],
  // youtubeOAuth2Api: ['https://www.googleapis.com/auth/youtube'],
};

