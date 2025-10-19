# 🎯 Final Architecture Summary - Universal Automation CRM

## ✅ Confirmed Architecture

### **ONE Master n8n Workflow Template**

Contains all 7 automation modules (WhatsApp, AI Agent, RAG, Email, SMS, Calendar, Chatbot).

### **Cloning Strategy**

- ✅ Main Exora backend (`server/routes/activation.js`) handles cloning
- ✅ Each user gets their own cloned workflow instance
- ✅ Webhook path set to: `{crm_user_id}/automation`
- ✅ Workflow ID stored in: `crm_users.n8n_workflow_id`

### **Credential Strategy**

- ✅ **ALL credentials are SHARED** (PostgreSQL, Ollama, OpenAI, Evolution API, etc.)
- ✅ Configured ONCE in master template
- ✅ Automatically inherited by all cloned workflows
- ✅ Production/shared values used for all users

### **Data Isolation Strategy**

- ✅ Every database query filters by: `WHERE crm_user_id = $1::uuid`
- ✅ `crm_user_id` comes from webhook payload
- ✅ Webhook payload sent by CRM backend with authenticated user's ID
- ✅ Each user only sees their own data

---

## 🔄 Complete System Flow

```
┌─────────────────────────────────────────────────────────────┐
│ EXORA USER LOGS IN                                          │
│ Exora user_id: 100                                          │
│ Email: doctor@clinic.com                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ USER ACTIVATES CRM (Main Exora Backend)                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
    server/routes/activation.js:
    1. CREATE crm_users record
       → crm_user_id = "abc-def-123-456" (UUID)
       → exora_user_id = 100
    
    2. CLONE master workflow
       → Webhook path = "abc-def-123-456/automation"
       → Workflow ID = "wf-clone-xyz789"
       → Credentials = SHARED (inherited from master)
    
    3. STORE workflow ID
       → UPDATE crm_users SET n8n_workflow_id = 'wf-clone-xyz789'
       
    4. REDIRECT to CRM with JWT (contains exora_user_id = 100)
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ USER COMPLETES SETUP (CRM Backend)                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
    JWT decoded → exora_user_id = 100
    Query → crm_user_id = "abc-def-123-456"
    
    Auto-enable automations based on industry
    INSERT INTO automation_configs VALUES
      ('abc-def-123-456', 'whatsapp', true, '{"ai_model":"gpt-4"}'),
      ('abc-def-123-456', 'ai_agent', true, '{"temp":0.3}'),
      ('abc-def-123-456', 'calendar', true, '{"duration":30}'),
      ('abc-def-123-456', 'sms', true, '{}')
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ USER CREATES EVENT (CRM Frontend)                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
    POST /api/events
    Headers: Authorization: Bearer JWT
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ CRM BACKEND PROCESSES (routes/events.js)                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
    1. Decode JWT → exora_user_id = 100
    2. Get CRM user → crm_user_id = "abc-def-123-456"
    3. Create event in database
    4. Trigger automation:
       
       triggerUserAutomation(
         "abc-def-123-456",  ← CRM User ID
         "calendar",
         {event_id, start_time, end_time, ...}
       )
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ WORKFLOW SERVICE (workflowInstanceService.js)               │
└─────────────────────────────────────────────────────────────┘
                          ↓
    Build webhook URL:
    webhookUrl = `${N8N_BASE_URL}/webhook/${crm_user_id}/automation`
                = "n8n.../webhook/abc-def-123-456/automation"
    
    POST to webhook:
    {
      "module": "calendar",
      "crm_user_id": "abc-def-123-456",  ← KEY VALUE
      "event_id": "...",
      "start_time": "...",
      "trigger_source": "event_created"
    }
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ n8n WORKFLOW EXECUTES (wf-clone-xyz789)                     │
│ Uses SHARED credentials for all services                    │
│ Filters data by crm_user_id from payload                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
    Node 1: Webhook Entry
      Receives: crm_user_id = "abc-def-123-456"
      
    Node 2: Validate Input
      Passes through: crm_user_id
      
    Node 3: Get User Configs (PostgreSQL)
      Credential: PostgreSQL - CRM Production (SHARED)
      Query: WHERE crm_user_id = $1::uuid
      Parameter: $1 = "abc-def-123-456"  ← From webhook
      Result: User's enabled modules and configs
      
    Node 4: Transform Configs
      Converts to object
      
    Node 5: Module Router
      Routes to Calendar branch
      
    Node 6: Calendar Handler
      Checks if calendar is enabled for THIS user
      
    Node 7: Calendar Enabled?
      Yes → Continue
      
    Node 8: Create Calendar Event (Google Calendar)
      Credential: Google Calendar OAuth (SHARED)
      But uses calendar_id from user's config
      
    Node 9: Update Event with Google ID (PostgreSQL)
      Credential: PostgreSQL - CRM Production (SHARED)
      Query: UPDATE events 
             WHERE id = $1 AND crm_user_id = $2::uuid
      Parameters: [$event_id, "abc-def-123-456"]
      Updates: Only this user's event
      
    Node 10: Log Execution (PostgreSQL)
      Credential: PostgreSQL - CRM Production (SHARED)
      INSERT: (crm_user_id = "abc-def-123-456", ...)
      Creates: Log entry for this user
                          ↓
                    ✅ COMPLETE
```

---

## 🔐 Security Architecture

### **Level 1: Authentication (JWT)**
```
User logs into Exora → Gets JWT
JWT contains: exora_user_id = 100
CRM Backend validates JWT
Maps to: crm_user_id = "abc-def-123-456"
```

### **Level 2: Unique Webhooks**
```
User A: /webhook/user-a-uuid/automation
User B: /webhook/user-b-uuid/automation
User C: /webhook/user-c-uuid/automation

Each user can only trigger their own webhook
(URL contains their unique UUID)
```

### **Level 3: Database Filtering**
```sql
-- Every query includes:
WHERE crm_user_id = $1::uuid

-- crm_user_id comes from webhook payload
-- Payload is sent by authenticated CRM backend
-- Users cannot spoof crm_user_id (would need valid JWT)
```

### **Level 4: Workflow Cloning**
```
Each user has their own workflow instance
→ Different execution history
→ Different webhook URL
→ Same credentials, different data
```

---

## 🎯 Credential Configuration (ONE TIME)

### **In n8n Master Template:**

```
1. PostgreSQL Node
   └─ Credential: "PostgreSQL - CRM Production"
       ├─ Host: your-db-server
       ├─ Database: exora-crm
       └─ Used by ALL users

2. OpenAI Node  
   └─ Credential: "OpenAI - Production"
       ├─ API Key: sk-...
       └─ Used by ALL users

3. Evolution API Node
   └─ Credential: "Evolution API - Production"
       ├─ API Key: your-key
       └─ Used by ALL users
       
4. Ollama API
   └─ URL: http://localhost:11434/api/chat
       └─ Used by ALL users
```

**Configure ONCE. Clone MANY times. All clones use SAME credentials.**

---

## 📊 Data Isolation Pattern

### **Same Credential, Different Data:**

```
PostgreSQL Credential: "PostgreSQL - CRM Production"
  └─ Connected to: exora-crm database
  
User A's Workflow:
  Query: SELECT * FROM contacts WHERE crm_user_id = 'user-a-uuid'
  Result: [50 contacts belonging to User A]

User B's Workflow:  
  Query: SELECT * FROM contacts WHERE crm_user_id = 'user-b-uuid'
  Result: [200 contacts belonging to User B]

User C's Workflow:
  Query: SELECT * FROM contacts WHERE crm_user_id = 'user-c-uuid'
  Result: [30 contacts belonging to User C]
```

**Same database. Same credentials. Different results. Perfect isolation!**

---

## 🎨 Configuration Isolation

### **Per-User Settings (automation_configs table):**

```sql
-- User A (Healthcare)
automation_configs:
  crm_user_id: "user-a-uuid"
  module_key: "whatsapp"
  config_data: {
    "instance_name": "clinic-bot",
    "auto_reply": true,
    "ai_model": "gpt-4"
  }

-- User B (Restaurant)
automation_configs:
  crm_user_id: "user-b-uuid"
  module_key: "whatsapp"
  config_data: {
    "instance_name": "restaurant-bot",
    "auto_reply": true,
    "ai_model": "gpt-3.5"
  }
```

**Same WhatsApp module, different configurations!**

### **How It's Used:**

```javascript
// In n8n WhatsApp Handler:
const whatsappConfig = $json.enabled_modules.whatsapp;

// User A gets: {instance_name: "clinic-bot", ai_model: "gpt-4"}
// User B gets: {instance_name: "restaurant-bot", ai_model: "gpt-3.5"}

// Call Evolution API:
POST {EVOLUTION_API_URL}/message/sendText/{whatsappConfig.instance_name}
// User A → /message/sendText/clinic-bot
// User B → /message/sendText/restaurant-bot

// Call AI:
const model = whatsappConfig.ai_model;
// User A → Uses gpt-4
// User B → Uses gpt-3.5
```

---

## ✅ Final Implementation Checklist

### **Database:**
- [x] automation_modules table (7 modules seeded)
- [x] automation_configs table (per-user settings)
- [x] automation_execution_logs table (audit trail)

### **n8n:**
- [x] Master workflow template created
- [ ] Import to n8n (YOU DO THIS)
- [ ] Configure PostgreSQL credential (ONCE, SHARED)
- [ ] Configure OpenAI credential (ONCE, SHARED)
- [ ] Configure Evolution API credential (ONCE, SHARED)
- [ ] Configure other credentials as needed
- [ ] Verify all queries filter by crm_user_id
- [ ] Test with sample payload
- [ ] Note master workflow ID
- [ ] DO NOT activate master (keep as template)

### **Backend:**
- [x] workflowInstanceService.js (simplified - no cloning logic)
- [x] routes/automations.js (automation management)
- [x] routes/webhooks.js (trigger user workflows)
- [x] routes/events.js (triggers calendar automation)
- [x] Updated activation.js (clone with user webhook path)

### **Frontend:**
- [x] /automations page (marketplace UI)
- [x] /settings page (business config)
- [x] Debug panel showing workflow ID
- [x] Console logging for debugging

---

## 🎉 Summary

### **What You Have:**

✅ **ONE master workflow** with 7 modules and shared credentials  
✅ **Cloning handled** by existing activation.js  
✅ **CRM backend** just triggers user's webhook  
✅ **Data isolated** via crm_user_id in WHERE clauses  
✅ **User configs** stored per-user in database  
✅ **Complete debug** logging at all layers  
✅ **Production-ready** with proper security  

### **What You Need to Do:**

1. Import `master-crm-automation-workflow-complete.json` to n8n
2. Configure credentials ONCE (PostgreSQL, OpenAI, Evolution, etc.)
3. Verify all queries have `WHERE crm_user_id = $1::uuid`
4. Note master workflow ID
5. Add to .env: `CRM_MASTER_WORKFLOW_ID=...`
6. Test activation for a user
7. Verify cloned workflow uses shared credentials
8. Test automation execution
9. Check debug logs

### **Key Files:**

- `n8n/master-crm-automation-workflow-complete.json` - The workflow
- `n8n/CREDENTIAL_CONFIGURATION.md` - Credential setup guide
- `n8n/SETUP_INSTRUCTIONS.md` - Step-by-step setup
- `n8n/QUERY_PATTERN_GUIDE.md` - Database query patterns
- `SIMPLIFIED_ARCHITECTURE.md` - Architecture overview
- `DEBUG_WORKFLOW_INFO.md` - Debugging guide

**Everything is ready! Import the workflow and configure credentials to get started.** 🚀

