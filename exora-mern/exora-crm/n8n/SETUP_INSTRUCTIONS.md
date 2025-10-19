# n8n Workflow Setup Instructions

## 🎯 Critical Understanding

### **ONE Set of Credentials for ALL Users**

```
PostgreSQL Credential (Configured ONCE in master template)
    ↓ Inherited by
User A's Cloned Workflow
    ↓ Uses SAME credential
User B's Cloned Workflow
    ↓ Uses SAME credential
User C's Cloned Workflow
```

**Data isolation happens via `crm_user_id` in WHERE clauses, NOT different credentials!**

---

## 📋 Step-by-Step Setup

### **Step 1: Import Master Template**

1. Login to n8n (https://n8n.exora.solutions)
2. Go to **Workflows** → **Import from File**
3. Select: `master-crm-automation-workflow-complete.json`
4. Click **Import**

You'll see a new workflow: **"Exora CRM - Universal Automation Hub (Template)"**

---

### **Step 2: Configure Shared Credentials (ONE TIME)**

#### **A. PostgreSQL Credential**

1. Click on any PostgreSQL node (e.g., "Get User Configs")
2. Under "Credentials", click **Create New**
3. Select credential type: **Postgres**
4. Configure:
   ```
   Name: PostgreSQL - CRM Production
   Host: localhost (or your server IP)
   Database: exora-crm
   User: postgres
   Password: your-database-password
   Port: 5432
   SSL: Disable (or configure as needed)
   ```
5. Click **Save**
6. **Apply to ALL PostgreSQL nodes** in the workflow:
   - Get User Configs
   - Find Contact
   - Create Contact
   - Store Inbound Message
   - Get Conversation History
   - Store Outbound Message
   - Update Event with Google ID
   - Log Execution

---

#### **B. OpenAI Credential**

1. Click on "Call AI" node (or any OpenAI node)
2. Under "Credentials", click **Create New**
3. Select: **OpenAI API**
4. Configure:
   ```
   Name: OpenAI - Production
   API Key: sk-your-openai-api-key
   ```
5. Click **Save**
6. **Apply to nodes:**
   - Call AI
   - AI Agent Call
   - RAG AI Call

---

#### **C. Evolution API Credential**

1. Click on "Send WhatsApp Reply" node
2. Under "Credentials", click **Create New**
3. Select: **HTTP Header Auth**
4. Configure:
   ```
   Name: Evolution API - Production
   Header Name: apikey
   Header Value: your-evolution-api-key
   ```
5. Click **Save**
6. **Also set Evolution API URL:**
   - In node parameters, set base URL
   - Or use environment variable: `EVOLUTION_API_URL`

---

#### **D. Gmail Credential (Optional)**

1. Click on "Send Email" node
2. Under "Credentials", click **Create New**
3. Select: **Gmail OAuth2**
4. Follow OAuth flow
5. Click **Save**

---

#### **E. Twilio Credential (Optional)**

1. Click on "Send SMS" node
2. Under "Credentials", click **Create New**
3. Select: **Twilio API**
4. Configure:
   ```
   Name: Twilio - Production
   Account SID: your-twilio-sid
   Auth Token: your-twilio-token
   ```
5. Click **Save**

---

#### **F. Google Calendar Credential (Optional)**

1. Click on "Create Calendar Event" node
2. Under "Credentials", click **Create New**
3. Select: **Google Calendar OAuth2**
4. Follow OAuth flow
5. Click **Save**

---

### **Step 3: Verify User ID Filtering**

Check that ALL database query nodes have `WHERE crm_user_id = ...` filter:

#### **Examples to Verify:**

**✅ Correct:**
```sql
-- Get User Configs node
SELECT module_key, config_data 
FROM automation_configs 
WHERE crm_user_id = $1::uuid AND enabled = true

-- Parameters: ["={{ $json.crm_user_id }}"]
```

**✅ Correct:**
```sql
-- Find Contact node
SELECT id, name, whatsapp_number, phone 
FROM contacts 
WHERE crm_user_id = $1::uuid 
AND (whatsapp_number = $2 OR phone = $2) 
LIMIT 1

-- Parameters: ["={{ $json.crm_user_id }}", "={{ $json.from_phone }}"]
```

**✅ Correct:**
```sql
-- Store Inbound Message node
INSERT INTO activities 
(id, crm_user_id, contact_id, activity_type, direction, channel, body, status, completed_at)
VALUES 
(uuid_generate_v4(), $1::uuid, $2::uuid, 'message', 'inbound', 'whatsapp', $3, 'completed', NOW())

-- Parameters: [
--   "={{ $json.crm_user_id }}",
--   "={{ $json.contact_id }}",
--   "={{ $json.message }}"
-- ]
```

**❌ WRONG (No user filter):**
```sql
-- This would show ALL users' contacts!
SELECT * FROM contacts WHERE phone = $1
```

---

### **Step 4: Set Environment Variables (n8n)**

If using environment variables for URLs:

```bash
# n8n environment
EVOLUTION_API_URL=https://evolution.exora.solutions
OLLAMA_API_URL=http://localhost:11434
```

Or configure directly in nodes.

---

### **Step 5: Test Master Template**

**DO NOT activate yet!** Test manually:

1. Click **Execute Workflow** button in n8n
2. In webhook test, send:
   ```json
   {
     "module": "ai_agent",
     "crm_user_id": "test-uuid-123",
     "message": "Hello, test message",
     "trigger_source": "manual_test"
   }
   ```
3. Verify:
   - Database queries run without errors
   - User configs are fetched
   - Module routes correctly
   - Logs are created

---

### **Step 6: Note Master Workflow ID**

After import and configuration:

1. In n8n, open the master template workflow
2. Look at the URL: `https://n8n.exora.solutions/workflow/{WORKFLOW_ID}`
3. Copy the workflow ID (e.g., `RLxyz123`)
4. Add to `.env` in main Exora backend:
   ```bash
   CRM_MASTER_WORKFLOW_ID=RLxyz123
   ```

---

### **Step 7: Keep Master Inactive**

**Important:** Do NOT activate the master template!

- ❌ Do NOT click "Active" toggle on master template
- ✅ Only cloned user instances should be active
- ✅ Master template is just for cloning

---

## 🔄 What Happens During User Activation

```
User clicks "Activate CRM" in Exora dashboard
    ↓
Main Exora Backend: activation.js
    ↓
Fetches master template (ID from CRM_MASTER_WORKFLOW_ID)
    ↓
Clones workflow:
  - Name: "CRM Automation - user@email.com"
  - Webhook path: "{crm_user_id}/automation"
  - Credentials: SAME as master (inherited)
    ↓
Created workflow in n8n:
  - ID: "cloned-abc-123"
  - PostgreSQL credential: "PostgreSQL - CRM Production" ← SAME
  - OpenAI credential: "OpenAI - Production" ← SAME
  - Evolution credential: "Evolution API - Production" ← SAME
    ↓
Stores in database:
  UPDATE crm_users 
  SET n8n_workflow_id = 'cloned-abc-123'
  WHERE id = '{crm_user_id}'
```

**All cloned workflows inherit the credentials from master template!**

---

## 🧪 Testing Credential Sharing

### **Test 1: Verify Same Credentials**

After cloning for 2 users, check in n8n:

```
Master Template:
  └─ Get User Configs node
      └─ PostgreSQL credential: "PostgreSQL - CRM Production" (ID: 12345)

User A's Clone:
  └─ Get User Configs node
      └─ PostgreSQL credential: "PostgreSQL - CRM Production" (ID: 12345) ← SAME!

User B's Clone:
  └─ Get User Configs node
      └─ PostgreSQL credential: "PostgreSQL - CRM Production" (ID: 12345) ← SAME!
```

### **Test 2: Verify Data Isolation**

Trigger User A's workflow:
```bash
POST /webhook/user-a-uuid/automation
{
  "module": "whatsapp",
  "crm_user_id": "user-a-uuid",
  "message": "test"
}
```

Check execution in n8n:
- "Get User Configs" query: `WHERE crm_user_id = 'user-a-uuid'`
- "Find Contact" query: `WHERE crm_user_id = 'user-a-uuid'`
- Returns: Only User A's data ✅

---

## 🎨 Visual Representation

```
┌─────────────────────────────────────────────────────────────┐
│  SHARED LAYER (Credentials)                                 │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ PostgreSQL │  │  OpenAI    │  │ Evolution  │           │
│  │ Production │  │ Production │  │ Production │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│         ↑                ↑                ↑                 │
│         └────────────────┴────────────────┘                 │
│               Used by ALL workflows                         │
└─────────────────────────────────────────────────────────────┘
                            ↑
┌─────────────────────────────────────────────────────────────┐
│  WORKFLOW LAYER (Cloned Instances)                          │
│                                                              │
│  User A's Workflow                                          │
│  ├─ Webhook: /webhook/user-a-uuid/automation               │
│  └─ Uses shared credentials above ↑                         │
│                                                              │
│  User B's Workflow                                          │
│  ├─ Webhook: /webhook/user-b-uuid/automation               │
│  └─ Uses shared credentials above ↑                         │
└─────────────────────────────────────────────────────────────┘
                            ↑
┌─────────────────────────────────────────────────────────────┐
│  DATA LAYER (Per-User Isolation)                            │
│                                                              │
│  All queries filter by:                                     │
│  WHERE crm_user_id = '{{ $json.crm_user_id }}'             │
│                                                              │
│  User A's data: crm_user_id = 'user-a-uuid'                │
│  User B's data: crm_user_id = 'user-b-uuid'                │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Final Checklist

- [ ] Imported master template to n8n
- [ ] Configured PostgreSQL credential (ONCE)
- [ ] Configured OpenAI credential (ONCE)
- [ ] Configured Evolution API credential (ONCE)
- [ ] All database query nodes have `WHERE crm_user_id = $1::uuid`
- [ ] Webhook node has path parameter
- [ ] Tested manually with test payload
- [ ] Noted master workflow ID
- [ ] Set CRM_MASTER_WORKFLOW_ID in .env
- [ ] Master template is INACTIVE
- [ ] Ready for user activation!

**When users activate CRM, their cloned workflows will automatically use these shared credentials!** ✅

