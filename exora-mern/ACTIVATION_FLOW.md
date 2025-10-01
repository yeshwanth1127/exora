# Workflow Activation Flow - Complete Guide

## Overview
This document describes the end-to-end OAuth and workflow activation flow for n8n workflows in the Exora platform.

## Flow Summary

### 1. User Initiates Activation
**Location:** `BusinessDashboard.jsx` (Frontend)
- User clicks "Activate" button on a workflow card
- `toggleWorkflowStatus()` function is triggered
- If workflow is currently inactive, it initiates the OAuth flow

### 2. Backend Generates OAuth URL
**Endpoint:** `POST /activate-workflow`
**File:** `routes/activation.js`

**Request Body:**
```json
{
  "userId": 8,
  "workflowId": "workflow_123",
  "scopes": [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
  ]
}
```

**Process:**
- Validates `userId` and `workflowId`
- Checks for required Google OAuth environment variables
- Encodes state as JSON: `{ userId, workflowId }`
- Calls `OAuthService.buildAuthUrl()` with scopes and state
- Returns authorization URL to frontend

**Response:**
```json
{
  "success": true,
  "authorizationUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&scope=...&state=..."
}
```

### 3. User Redirected to Google Consent Page
**Location:** Frontend `BusinessDashboard.jsx`
- Frontend receives `authorizationUrl`
- Performs full-page redirect: `window.location.href = data.authorizationUrl`
- User sees Google's OAuth consent screen
- User grants permissions

### 4. Google Redirects Back to Callback
**URL:** `https://exora.solutions/oauth/callback?code=...&state=...`
**Endpoint:** `GET /oauth/callback`
**File:** `routes/activation.js`

**Process:**
- Extracts `code` and `state` from query parameters
- Calls `OAuthService.handleOAuthCallback('google', code, state)`
  - Parses state JSON to extract `userId` and `workflowId`
  - Exchanges authorization code for access/refresh tokens via Google API
  - Returns tokens and session context
- Stores OAuth tokens in database via `OAuthTokens.upsert()`
  - Tokens are **encrypted** using `OAUTH_ENCRYPTION_KEY`
  - Stored per user, workflow, and provider
- Provisions the n8n workflow instance

### 5. N8N Workflow Provisioning
**Service:** `ActivationService`
**File:** `services/ActivationService.js`

**Steps:**

a. **Check for Existing Instance**
- Queries `UserWorkflowInstance.findByUserSource({ userId, sourceWorkflowId })`
- If exists: reuses the existing n8n workflow instance
- If not: clones a new instance from the template

b. **Clone Workflow (if needed)**
- Calls `cloneWorkflowForUser(workflowId, userId)`
- Fetches source workflow from n8n
- Appends user ID to workflow name: `${workflow.name} (User ${userId})`
- Creates new workflow in n8n via `n8n.createWorkflow()`

c. **Create/Update Google Credential**
- Calls `createOrUpdateGoogleCredentialForUser({ userId, workflowId, tokens })`
- Formats credential for n8n's Google OAuth2 API
- Creates/updates credential via n8n API
- Returns credential ID

d. **Attach Credential to Workflow Nodes**
- Calls `attachCredentialToGoogleNodes(workflow, credentialId)`
- Finds all Google-related nodes (e.g., `googleCalendar`, `googleSheets`, `gmail`)
- Attaches the credential ID to each node's `credentials` field
- Updates workflow in n8n via `n8n.updateWorkflow()`

e. **Activate Workflow**
- Calls `activateWorkflow(workflowId)`
- Sets workflow `active: true` in n8n

f. **Record Instance in Database**
- Calls `UserWorkflowInstance.upsert({ userId, sourceWorkflowId, instanceWorkflowId, status: 'active' })`
- Tracks the mapping between user, template, and instance

### 6. Redirect to Success Page
**URL:** `https://exora.solutions/workflow-activation?success=true&userId=8&workflowId=123`
**Frontend Page:** `WorkflowActivation.jsx`

**Process:**
- Parses query parameters
- Shows success message: "✅ Workflow activated successfully!"
- Automatically redirects to dashboard after 2 seconds

**Error Handling:**
- If any error occurs during OAuth/provisioning, redirects to:
  `https://exora.solutions/workflow-activation?error=<error_message>`
- Shows error message with retry option

### 7. Dashboard Updates
**Location:** `BusinessDashboard.jsx`
- User returns to dashboard
- Workflow status shows as "active"
- User can now use the workflow with their own OAuth credentials

## Key Security Features

### 1. Token Encryption
**File:** `models/OAuthTokens.js`
- All OAuth tokens are encrypted before storage
- Uses AES-256-CBC encryption
- Encryption key from `OAUTH_ENCRYPTION_KEY` environment variable
- Tokens are decrypted only when needed for n8n API calls

### 2. State Validation
- State parameter includes `userId` and `workflowId`
- Prevents CSRF attacks by encoding context
- Validates state matches expected user session

### 3. User-Specific Instances
- Each user gets their own workflow instance
- Credentials are isolated per user
- No cross-user data leakage

### 4. Token Refresh (Future Enhancement)
- `OAuthService.refreshAccessToken()` available
- Can implement background job to refresh tokens before expiry
- Stored `expiryDate` in database for tracking

## Environment Variables Required

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://exora.solutions/oauth/callback

# Frontend URL
FRONTEND_URL=https://exora.solutions

# Token Encryption
OAUTH_ENCRYPTION_KEY=64-character-hex-string

# N8N Configuration
N8N_API_KEY=your-n8n-api-key
N8N_BASE_URL=https://n8n.exora.solutions
```

## Database Tables

### 1. `oauth_tokens`
```sql
CREATE TABLE oauth_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  workflow_id VARCHAR(255) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  access_token TEXT NOT NULL,      -- encrypted
  refresh_token TEXT,               -- encrypted
  expiry_date TIMESTAMP,
  scope TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, workflow_id, provider)
);
```

### 2. `user_workflow_instances`
```sql
CREATE TABLE user_workflow_instances (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  source_workflow_id VARCHAR(255) NOT NULL,
  instance_workflow_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'inactive',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, source_workflow_id)
);
```

### 3. `dashboard_data`
```sql
CREATE TABLE dashboard_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workflows JSONB DEFAULT '[]',
  is_configured BOOLEAN DEFAULT FALSE,
  -- ... other fields
);
```

## API Endpoints

### Activation Routes
```javascript
POST /activate-workflow
  - Initiates OAuth flow
  - Returns authorization URL

GET /oauth/callback
  - Handles Google OAuth callback
  - Provisions n8n workflow
  - Redirects to frontend
```

### Dashboard Routes
```javascript
GET /api/dashboard/overview
  - Returns user's dashboard data

POST /api/dashboard/workflows
  - Adds workflows to dashboard

PATCH /api/workflows/:id/status
  - Toggles workflow status (deactivate)
```

## Error Scenarios & Handling

### 1. Missing Environment Variables
- **Error:** "Missing Google OAuth env"
- **Response:** 500 status, JSON error
- **Frontend:** Shows alert to user

### 2. OAuth Token Exchange Failure
- **Error:** "Google token exchange failed: ..."
- **Redirect:** `/workflow-activation?error=oauth_failed`
- **Frontend:** Shows error message with retry button

### 3. N8N API Failure
- **Error:** Network/API errors from n8n
- **Redirect:** `/workflow-activation?error=<error_message>`
- **Frontend:** Shows error message

### 4. Database Errors
- **Error:** PostgreSQL connection/query errors
- **Handling:** Caught and logged, redirect with error
- **Frontend:** Generic error message

## Testing Checklist

- [ ] Environment variables properly set
- [ ] Database tables created and accessible
- [ ] Google OAuth consent screen configured
- [ ] Redirect URI matches exactly
- [ ] N8N API accessible and authenticated
- [ ] Encryption key is 64 characters
- [ ] Frontend routes configured
- [ ] Token encryption/decryption works
- [ ] Workflow cloning works
- [ ] Credential attachment works
- [ ] Multiple users can activate same workflow independently
- [ ] Error redirects function properly
- [ ] Success redirects work
- [ ] Dashboard updates after activation

## Production Readiness

### Completed ✅
- [x] End-to-end OAuth flow
- [x] Token encryption
- [x] User-specific workflow instances
- [x] Error handling and redirects
- [x] Database persistence
- [x] State validation
- [x] Duplicate workflow prevention
- [x] Frontend/backend integration

### Future Enhancements 🚀
- [ ] Background token refresh job
- [ ] Webhook for n8n execution status updates
- [ ] User notification on workflow errors
- [ ] Analytics/metrics tracking
- [ ] Multi-provider OAuth (Microsoft, etc.)
- [ ] Rate limiting on activation endpoint
- [ ] Audit logging for security events
- [ ] User dashboard for managing OAuth permissions

