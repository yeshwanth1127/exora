# 🚀 Automated n8n Per-Node Credential Creation + Workflow Cloning

## Overview

This system enables **one-click workflow activation** for users by:
1. ✅ Computing required credential types from template workflows
2. ✅ Generating a single Google OAuth consent screen with union of all required scopes
3. ✅ Creating individual n8n credentials for each node type (reusing the same OAuth tokens)
4. ✅ Cloning the template workflow and injecting created credential IDs
5. ✅ Activating the cloned workflow
6. ✅ Persisting the mapping: `user <-> clonedWorkflow <-> n8nCredentialIds`

---

## 📋 Prerequisites

- Self-hosted n8n instance with API enabled
- Google Cloud Project with OAuth 2.0 credentials configured
- PostgreSQL database
- Node.js & npm installed

---

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install qs
```

**Note:** `axios` is already installed. Only `qs` needs to be added.

---

### 2. Configure Environment Variables

Add these to your `server/.env` file:

```bash
# ============================================
# Google OAuth Configuration
# ============================================
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://your-backend.example.com/api/activation/oauth2/callback

# ============================================
# n8n API Configuration
# ============================================
N8N_BASE_URL=https://n8n.example.com
N8N_API_KEY=your-n8n-api-key

# ============================================
# Frontend Configuration
# ============================================
FRONTEND_URL=https://app.example.com
```

#### Google OAuth Setup Steps:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable APIs: Gmail, Google Drive, Google Calendar, Google Sheets
4. Navigate to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application Type: **Web application**
6. Authorized redirect URIs: Add your `GOOGLE_REDIRECT_URI` (e.g., `https://your-backend.example.com/api/activation/oauth2/callback`)
7. Copy `Client ID` and `Client Secret`

#### n8n API Key Setup:

1. Log into your n8n instance as admin
2. Navigate to **Settings** → **API**
3. Enable API access
4. Generate or copy your API key
5. Set as `N8N_API_KEY`

**⚠️ IMPORTANT:** The `GOOGLE_REDIRECT_URI` must match exactly what's registered in Google Cloud Console!

---

### 3. Database Migration

Run the migration to add the `n8n_credential_ids` column:

```bash
cd server
psql -U your_db_user -d your_database -f migrations/add_n8n_credential_ids.sql
```

Or connect to your database and run:

```sql
ALTER TABLE user_workflow_instances 
ADD COLUMN IF NOT EXISTS n8n_credential_ids JSONB;

COMMENT ON COLUMN user_workflow_instances.n8n_credential_ids IS 
'JSON mapping of credential type (e.g., gmailOAuth2Api) to n8n credential ID';
```

---

### 4. Update Credential Map

Edit `server/services/credentialMap.js` to match your n8n credential types.

**How to find credential types in your workflow:**

1. Open your template workflow in n8n
2. Export it (Workflow → Download)
3. Search for `"credentials"` in the JSON
4. Look for keys like `"gmailOAuth2Api"`, `"googleDriveOAuth2Api"`, etc.

Example workflow node structure:
```json
{
  "name": "Gmail",
  "type": "n8n-nodes-base.gmail",
  "credentials": {
    "gmailOAuth2Api": {
      "id": "1",
      "name": "Gmail account"
    }
  }
}
```

Add these credential type keys to `credentialMap.js`:

```javascript
module.exports = {
  gmailOAuth2Api: [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ],
  // Add more credential types as needed
};
```

---

### 5. Server Route Registration

Ensure your server is mounting the activation routes. In `server/server.js` or your main app file:

```javascript
const activationRoutes = require('./routes/activation');

// Mount activation routes (adjust path as needed)
app.use('/api/activation', activationRoutes);
// OR if already mounted at root:
app.use('/', activationRoutes);
```

**Verify your route paths match:**
- POST `/workflow-required-creds` → Check credential requirements
- POST `/activate-workflow` → Initiate OAuth flow
- GET `/oauth2/callback` → Handle OAuth callback

---

## 🔄 How It Works

### User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User clicks "Activate" on workflow card                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Frontend: POST /workflow-required-creds                      │
│    → Backend fetches workflow from n8n                          │
│    → Analyzes nodes for credential types                        │
│    → Returns list of OAuth & manual credential types            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Frontend: Shows confirmation dialog                          │
│    "This automation needs:                                      │
│     • gmailOAuth2Api                                            │
│     • googleDriveOAuth2Api                                      │
│     • googleCalendarOAuth2Api"                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼ (User clicks OK)
┌─────────────────────────────────────────────────────────────────┐
│ 4. Frontend: POST /activate-workflow                            │
│    → Backend builds OAuth URL with union of scopes              │
│    → Returns authorizationUrl                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Browser redirects to Google OAuth consent screen             │
│    User grants permissions                                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. Google redirects back to: GET /oauth2/callback?code=xxx      │
│    Backend receives authorization code                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. Backend: Exchange code for tokens                            │
│    → POST https://oauth2.googleapis.com/token                   │
│    → Receives access_token, refresh_token, etc.                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. Backend: Create credentials in n8n (one per type)            │
│    → POST /api/v1/credentials (gmailOAuth2Api)                  │
│    → POST /api/v1/credentials (googleDriveOAuth2Api)            │
│    → POST /api/v1/credentials (googleCalendarOAuth2Api)         │
│    → Store credential IDs: {gmailOAuth2Api: "123", ...}         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9. Backend: Clone workflow & inject credential IDs              │
│    → Deep copy template workflow JSON                           │
│    → For each node with credentials:                            │
│      node.credentials[type] = {id: credId, name: "user-123"}    │
│    → POST /api/v1/workflows (create cloned workflow)            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 10. Backend: Activate cloned workflow                           │
│     → PATCH /api/v1/workflows/:id {active: true}                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 11. Backend: Persist mapping in database                        │
│     → Save to user_workflow_instances:                          │
│       userId, templateWorkflowId, clonedWorkflowId,             │
│       n8n_credential_ids: {gmailOAuth2Api: "123", ...}          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 12. Backend: Redirect user to frontend with success             │
│     → /dashboard?workflowActivated=true&clonedWorkflowId=456    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 13. Frontend: Show success message & refresh dashboard          │
│     ✅ "Workflow activated successfully!"                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing

### Manual Testing Steps

#### Step 1: Create Template Workflow in n8n

1. Log into your n8n instance
2. Create a new workflow with multiple Google nodes:
   - Gmail node (requires `gmailOAuth2Api`)
   - Google Drive node (requires `googleDriveOAuth2Api`)
   - Google Calendar node (requires `googleCalendarOAuth2Api`)
3. **Don't configure credentials yet** - leave them empty
4. Save the workflow
5. Note the workflow ID from the URL

#### Step 2: Start Your Backend Server

```bash
cd server
npm start
```

Verify:
- Server starts without errors
- Environment variables loaded
- Database connection successful

#### Step 3: Test from Dashboard

1. Navigate to your dashboard: `https://app.example.com/dashboard`
2. Ensure you have a workflow card with the template workflow ID
3. Click **"Activate"** button

**Expected behavior:**

✅ **Step A:** Confirmation dialog appears showing credential types:
```
This automation requires the following credentials:

📱 Google OAuth (Automatic):
  • gmailOAuth2Api
  • googleDriveOAuth2Api
  • googleCalendarOAuth2Api

Click OK to connect your Google account...
```

✅ **Step B:** After clicking OK, browser redirects to Google consent screen

✅ **Step C:** Google shows all requested permissions (Gmail, Drive, Calendar)

✅ **Step D:** After granting consent, redirect back to dashboard with success message:
```
✅ Success! Your Workflow has been activated and is now running for you.

Workflow ID: 456
```

✅ **Step E:** Check n8n UI:
- New credentials created (3 total)
  - `user-123-gmailOAuth2Api-1234567890`
  - `user-123-googleDriveOAuth2Api-1234567891`
  - `user-123-googleCalendarOAuth2Api-1234567892`
- New workflow created with name: `user-123 — Your Workflow`
- Workflow is active (green toggle)
- All nodes reference correct credentials

#### Step 4: Verify Database

```sql
SELECT * FROM user_workflow_instances WHERE user_id = 123;
```

Expected result:
```
user_id | source_workflow_id | instance_workflow_id | n8n_credential_ids
--------|--------------------|--------------------- |--------------------
123     | template-id        | 456                  | {"gmailOAuth2Api": "123", ...}
```

#### Step 5: Test Workflow Execution

1. In n8n, open the cloned workflow
2. Click **"Execute Workflow"**
3. Verify nodes execute successfully using the user's Google account

---

### Debugging with CURL

#### Check Workflow Credentials

```bash
curl -X POST http://localhost:5000/api/activation/workflow-required-creds \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"workflowId": "template-workflow-id"}'
```

Expected response:
```json
{
  "success": true,
  "credentialTypes": ["gmailOAuth2Api", "googleDriveOAuth2Api"],
  "oauthCredentialTypes": ["gmailOAuth2Api", "googleDriveOAuth2Api"],
  "manualCredentialTypes": [],
  "scopes": [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/drive.file",
    ...
  ]
}
```

#### Get OAuth URL

```bash
curl -X POST http://localhost:5000/api/activation/activate-workflow \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": 123, "workflowId": "template-workflow-id"}'
```

Expected response:
```json
{
  "success": true,
  "authorizationUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...",
  "message": "Redirect user to Google OAuth consent",
  "credentialTypes": ["gmailOAuth2Api", "googleDriveOAuth2Api"]
}
```

#### Check n8n Credentials

```bash
curl -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_BASE_URL/api/v1/credentials"
```

#### Check n8n Workflow

```bash
curl -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_BASE_URL/api/v1/workflows/456"
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Missing code or state parameter"

**Cause:** Google redirect URI doesn't match configured URI

**Solution:**
1. Check `GOOGLE_REDIRECT_URI` in `.env`
2. Verify it matches **exactly** in Google Cloud Console
3. Include the full path: `/api/activation/oauth2/callback` or `/oauth2/callback`

### Issue 2: "No access token returned from Google"

**Cause:** Token exchange failed

**Solutions:**
- Verify `GOOGLE_CLIENT_SECRET` is correct
- Check server logs for detailed error from Google
- Ensure `GOOGLE_REDIRECT_URI` matches what was sent in auth request

### Issue 3: "Failed to create credential in n8n"

**Cause:** n8n API key invalid or credential type name mismatch

**Solutions:**
- Test n8n API key: `curl -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_BASE_URL/api/v1/workflows"`
- Check credential type name matches exactly (case-sensitive)
- Verify credential type exists in your n8n version

### Issue 4: "n8n_credential_ids column does not exist"

**Cause:** Database migration not run

**Solution:**
```bash
psql -U user -d database -f migrations/add_n8n_credential_ids.sql
```

### Issue 5: "Credential creation succeeded but workflow clone failed"

**Cause:** Workflow JSON structure incompatible

**Solutions:**
- Check n8n version compatibility
- Inspect workflow JSON for special characters
- Review server logs for detailed error

### Issue 6: "User denied consent" or "access_denied"

**Cause:** User clicked "Cancel" on Google consent screen

**Solution:**
- This is expected behavior - user will see error message
- They can try again by clicking "Activate" again

---

## 🔐 Security Considerations

### OAuth Tokens
- ✅ Tokens stored securely in n8n's encrypted credential store
- ✅ Never logged or exposed in API responses
- ✅ `refresh_token` stored for long-term access

### API Keys
- ✅ n8n API key stored in server environment only
- ✅ Never sent to frontend
- ✅ Use read/write access level (not admin)

### State Parameter
- ✅ Includes userId and workflowId
- ✅ Validated on callback
- ⚠️ Not encrypted (consider JWT-signing for production)

### HTTPS
- ⚠️ **REQUIRED** for production
- Google OAuth requires HTTPS redirect URI
- Use Let's Encrypt or similar for free certificates

---

## 📊 Monitoring & Logs

### What to Monitor

1. **OAuth Success Rate**
   - Track successful vs failed activations
   - Monitor `error=oauth_denied` redirects

2. **Credential Creation**
   - Count credentials created per user
   - Alert on repeated failures

3. **Workflow Activation**
   - Track active vs inactive cloned workflows
   - Monitor execution success rate

### Log Locations

Server logs show detailed flow:
```
========== OAuth2 Callback Received ==========
Processing activation for user 123, workflow template-id
Credential types to create: gmailOAuth2Api, googleDriveOAuth2Api
Step 2: Fetching template workflow from n8n...
✓ Fetched template workflow: Email Campaign Automation
Step 3: Creating credentials in n8n...
✓ Created credential user-123-gmailOAuth2Api-1234567890 with ID: 123
✓ Created credential user-123-googleDriveOAuth2Api-1234567891 with ID: 124
✓ Created 2 credentials in n8n
Step 4: Cloning workflow and injecting credentials...
Step 5: Creating cloned workflow in n8n...
✓ Created cloned workflow with ID: 456
Step 6: Activating cloned workflow...
✓ Activated workflow 456
========== Activation Complete ==========
```

---

## 🚀 Advanced: Adding New Credential Types

### Example: Adding YouTube OAuth Support

1. **Update credential map:**

```javascript
// server/services/credentialMap.js
module.exports = {
  // ... existing entries
  youtubeOAuth2Api: [
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.upload'
  ]
};
```

2. **Enable YouTube API in Google Cloud Console**

3. **Test with template workflow:**
   - Create workflow with YouTube node
   - Click Activate
   - Verify YouTube scope appears in consent screen

That's it! The system automatically handles the rest.

---

## 📞 Support & Troubleshooting

### Enable Debug Logging

Set environment variable:
```bash
DEBUG=activation:*
```

### Server Logs

All activation steps are logged with prefixes:
- `✓` = Success
- `⚠` = Warning
- `✗` = Error

### Check System Health

```bash
# Test n8n connectivity
curl -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_BASE_URL/api/v1/workflows"

# Test database
psql -U user -d database -c "SELECT COUNT(*) FROM user_workflow_instances;"

# Test Google OAuth endpoints
curl https://accounts.google.com/.well-known/openid-configuration
```

---

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [n8n API Documentation](https://docs.n8n.io/api/)
- [OAuth 2.0 Scopes for Google APIs](https://developers.google.com/identity/protocols/oauth2/scopes)

---

## ✅ Implementation Checklist

- [ ] Install `qs` package: `npm install qs`
- [ ] Add environment variables to `.env`
- [ ] Configure Google OAuth in Cloud Console
- [ ] Add authorized redirect URI in Google Console
- [ ] Generate n8n API key
- [ ] Run database migration for `n8n_credential_ids` column
- [ ] Update `credentialMap.js` with your credential types
- [ ] Verify route mounting in `server.js`
- [ ] Test activation flow end-to-end
- [ ] Verify credentials created in n8n
- [ ] Verify workflow cloned and active
- [ ] Check database records
- [ ] Test workflow execution
- [ ] Set up monitoring/logging
- [ ] Deploy to production with HTTPS

---

**🎉 Congratulations!** Your automated n8n credential creation and workflow cloning system is now ready!

