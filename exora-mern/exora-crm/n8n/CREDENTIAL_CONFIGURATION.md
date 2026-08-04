# n8n Credential Configuration Guide

## ⚠️ IMPORTANT: Shared vs Per-User

### **SHARED (Same for All Users):**
- ✅ PostgreSQL Connection (exora-crm database)
- ✅ Ollama API URL
- ✅ OpenAI API Key
- ✅ Evolution API credentials
- ✅ Gmail/SMTP credentials
- ✅ Twilio credentials
- ✅ Google Calendar OAuth

### **PER-USER (Isolated by crm_user_id):**
- ✅ Database QUERIES (filtered by WHERE crm_user_id = ...)
- ✅ Configuration data (automation_configs table)
- ✅ Contacts, events, activities (all filtered by crm_user_id)
- ✅ Execution logs (stored with crm_user_id)

---

## 🔧 How It Works

### **Shared Credentials in n8n:**

When you import the workflow template to n8n, you configure ONE set of credentials:

```
PostgreSQL Credential: "PostgreSQL - CRM Production"
  ├─ Host: your-db-server
  ├─ Database: exora-crm
  ├─ User: postgres
  └─ Password: your-password
  
  ↓ Used by ALL user workflow clones
  
User A's workflow → Uses "PostgreSQL - CRM Production"
User B's workflow → Uses "PostgreSQL - CRM Production"  
User C's workflow → Uses "PostgreSQL - CRM Production"
```

**All users connect to the SAME database with the SAME credentials.**

---

### **Data Isolation via Queries:**

Even though all users use the same database connection, they only see their own data:

```sql
-- User A's workflow queries:
SELECT * FROM contacts WHERE crm_user_id = 'user-a-uuid'
-- Returns: Only User A's contacts

-- User B's workflow queries:  
SELECT * FROM contacts WHERE crm_user_id = 'user-b-uuid'
-- Returns: Only User B's contacts

-- Same database, same credentials, different results!
```

---

## 📋 Credentials to Configure in n8n

### **1. PostgreSQL (SHARED)**

**Credential Type:** `postgres`  
**Name:** `PostgreSQL - CRM Production`

**Configuration:**
```
Host: localhost (or your DB server)
Database: exora-crm
User: postgres
Password: your-password
Port: 5432
SSL: Disable (or configure as needed)
```

**Used by nodes:**
- Get User Configs
- Find Contact
- Create Contact
- Store Inbound Message
- Get Conversation History
- Store Outbound Message
- Update Event with Google ID
- Log Execution

---

### **2. OpenAI (SHARED)**

**Credential Type:** `openAiApi`  
**Name:** `OpenAI - Production`

**Configuration:**
```
API Key: sk-your-openai-api-key
Organization ID: (optional)
```

**Used by nodes:**
- Call AI (when ai_model = 'gpt-4' or 'gpt-3.5')
- AI Agent Call
- RAG AI Call

---

### **3. Evolution API (SHARED)**

**Credential Type:** `httpHeaderAuth`  
**Name:** `Evolution API - Production`

**Configuration:**
```
Name: apikey
Value: your-evolution-api-key
```

**Used by nodes:**
- Send WhatsApp Reply

**Note:** Each user configures their WhatsApp instance_name in CRM UI, but uses the same Evolution API credentials.

---

### **4. Gmail (SHARED)**

**Credential Type:** `gmailOAuth2`  
**Name:** `Gmail - Production`

**Configuration:**
```
OAuth2 Flow:
- Client ID: your-google-client-id
- Client Secret: your-google-client-secret
- Scopes: https://www.googleapis.com/auth/gmail.send
```

**Used by nodes:**
- Send Email

**Note:** Emails are sent FROM your configured Gmail account. Users can customize the signature via CRM UI.

---

### **5. Twilio (SHARED)**

**Credential Type:** `twilioApi`  
**Name:** `Twilio - Production`

**Configuration:**
```
Account SID: your-twilio-account-sid
Auth Token: your-twilio-auth-token
```

**Used by nodes:**
- Send SMS

**Note:** Users configure which Twilio phone number to use in CRM UI.

---

### **6. Google Calendar (SHARED)**

**Credential Type:** `googleCalendarOAuth2Api`  
**Name:** `Google Calendar - Production`

**Configuration:**
```
OAuth2 Flow:
- Client ID: your-google-client-id
- Client Secret: your-google-client-secret
- Scopes: https://www.googleapis.com/auth/calendar
```

**Used by nodes:**
- Create Calendar Event

**Note:** Users can specify which calendar_id to use in CRM UI.

---

## 🔒 Security Model

### **Why This is Secure:**

```
┌─────────────────────────────────────────────────────────┐
│  All users use SAME credentials to connect to services  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  But each user's workflow receives THEIR crm_user_id    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  All database queries filter by crm_user_id             │
│  WHERE crm_user_id = 'abc-def-123'                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Database returns ONLY that user's data                  │
└─────────────────────────────────────────────────────────┘
```

**Example:**

```
User A's workflow executes:
  ↓
Webhook payload: {crm_user_id: "user-a-uuid", ...}
  ↓
PostgreSQL Query (uses SHARED credential):
  SELECT * FROM contacts WHERE crm_user_id = 'user-a-uuid'
  ↓
Returns: User A's 50 contacts
  ↓
OpenAI API Call (uses SHARED credential):
  POST https://api.openai.com/v1/chat/completions
  Headers: Authorization: Bearer sk-shared-key
  ↓
WhatsApp Send (uses SHARED Evolution API credential):
  POST https://evolution-api/message/sendText/user-a-instance
  Headers: apikey: shared-evolution-key
  Instance: "user-a-clinic-bot" ← From user's config
```

**User B's workflow cannot see User A's data even though they use the same database credentials!**

---

## ⚙️ Configuration in Master Template

### **When You Import the Workflow:**

The JSON file has placeholder credential IDs:

```json
{
  "credentials": {
    "postgres": {
      "id": "POSTGRES_CREDENTIAL_ID",
      "name": "PostgreSQL - CRM"
    }
  }
}
```

### **After Import, Update Each Node:**

1. Click on node (e.g., "Get User Configs")
2. Go to "Credentials" section
3. Select: "PostgreSQL - CRM Production"
4. Repeat for all nodes that need credentials

### **n8n Will Automatically:**
- Use the selected credential for THIS node
- When workflow is cloned, the credential reference is copied
- All cloned workflows use the SAME credential

---

## 🎯 Credential Mapping

### **Master Template:**
```json
{
  "nodes": [
    {
      "name": "Get User Configs",
      "type": "n8n-nodes-base.postgres",
      "credentials": {
        "postgres": {
          "id": "POSTGRES_CREDENTIAL_ID",  ← Placeholder
          "name": "PostgreSQL - CRM"
        }
      }
    }
  ]
}
```

### **After You Configure in n8n:**
```json
{
  "nodes": [
    {
      "name": "Get User Configs",
      "type": "n8n-nodes-base.postgres",
      "credentials": {
        "postgres": {
          "id": "12345",  ← Real credential ID from n8n
          "name": "PostgreSQL - CRM Production"
        }
      }
    }
  ]
}
```

### **When Cloned for User A:**
```json
{
  "nodes": [
    {
      "name": "Get User Configs",
      "type": "n8n-nodes-base.postgres",
      "credentials": {
        "postgres": {
          "id": "12345",  ← SAME credential ID!
          "name": "PostgreSQL - CRM Production"
        }
      },
      "parameters": {
        "query": "SELECT ... WHERE crm_user_id = $1::uuid",
        "values": ["={{ $json.crm_user_id }}"]  ← User's ID from webhook
      }
    }
  ]
}
```

---

## 🔍 Where crm_user_id Comes From

### **Webhook Payload (From CRM Backend):**

```javascript
// CRM Backend triggers workflow
triggerUserWorkflow(crmUserId, 'calendar', {
  event_id: '...',
  contact_name: 'John Doe',
  start_time: '...'
});

// Sends to webhook:
POST https://n8n.exora.solutions/webhook/{crmUserId}/automation
{
  "module": "calendar",
  "crm_user_id": "abc-def-123",  ← THIS IS THE KEY
  "event_id": "...",
  "contact_name": "John Doe",
  "start_time": "..."
}
```

### **Used Throughout Workflow:**

```javascript
// In every database query node:
"query": "SELECT ... WHERE crm_user_id = $1::uuid"
"parameters": ["={{ $json.crm_user_id }}"]  // abc-def-123

// This ensures User A only sees User A's data
// Even though User B uses the same PostgreSQL credential
```

---

## 🎯 Summary

### **Credentials:**
- ✅ ONE set of credentials configured in master template
- ✅ Automatically copied to all cloned user workflows
- ✅ All users share same database connection, API keys, etc.

### **Data Isolation:**
- ✅ `crm_user_id` passed in webhook payload
- ✅ Every database query filters by `WHERE crm_user_id = $1`
- ✅ Users can only see/modify their own data

### **Configuration Isolation:**
- ✅ automation_configs table stores per-user settings
- ✅ Each user has different ai_model, instance_name, etc.
- ✅ Workflow reads user's config from database at runtime

---

## 📝 Configuration Checklist

Before activating CRM for users:

- [ ] Configure PostgreSQL credential in n8n (points to exora-crm database)
- [ ] Configure OpenAI credential in n8n
- [ ] Configure Evolution API credential in n8n
- [ ] Configure Gmail OAuth in n8n
- [ ] Configure Twilio credential in n8n
- [ ] Configure Google Calendar OAuth in n8n
- [ ] Test master template manually
- [ ] Verify database queries include crm_user_id filter
- [ ] Clone for test user
- [ ] Verify cloned workflow uses same credentials

**All credential configuration is ONE-TIME in the master template!**

