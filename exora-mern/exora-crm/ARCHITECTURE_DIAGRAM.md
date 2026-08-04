# 🎨 Visual Architecture Diagram

## System Architecture (Simplified)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USERS                                       │
│                                                                          │
│  👤 User A (Healthcare)   👤 User B (Restaurant)   👤 User C (Sales)   │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
                              CRM Frontend
                         (React - Single App)
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                           CRM Backend API                                │
│                         (Express.js - Single Instance)                   │
│                                                                          │
│  Identifies user from JWT → crm_user_id                                 │
│  Fetches user's configs from database                                   │
│  Triggers user's SPECIFIC workflow instance                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        PostgreSQL Database                               │
│                         (exora-crm database)                             │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │ crm_users                                                      │     │
│  ├────────────────┬──────────────┬─────────────────────────────┤     │
│  │ id             │ exora_user_id│ n8n_workflow_id             │     │
│  ├────────────────┼──────────────┼─────────────────────────────┤     │
│  │ user-a-uuid    │ 100          │ wf-clone-001                │     │
│  │ user-b-uuid    │ 200          │ wf-clone-002                │     │
│  │ user-c-uuid    │ 300          │ wf-clone-003                │     │
│  └────────────────┴──────────────┴─────────────────────────────┘     │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │ automation_configs                                             │     │
│  ├────────────────┬────────────┬─────────┬────────────────────┤     │
│  │ crm_user_id    │ module_key │ enabled │ config_data        │     │
│  ├────────────────┼────────────┼─────────┼────────────────────┤     │
│  │ user-a-uuid    │ whatsapp   │ true    │ {ai_model:'gpt-4'} │     │
│  │ user-a-uuid    │ ai_agent   │ true    │ {temp:0.3,...}     │     │
│  │ user-b-uuid    │ email      │ true    │ {from:'sales@...'} │     │
│  │ user-b-uuid    │ chatbot    │ true    │ {color:'#667eea'}  │     │
│  └────────────────┴────────────┴─────────┴────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         n8n Server                                       │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │ Master Template (ID: master-crm-automation)                   │      │
│  │ ✖ Never executed directly                                     │      │
│  │ ✔ Used for cloning only                                       │      │
│  │ Webhook: /webhook/TEMPLATE/automation                         │      │
│  └──────────────────────────────────────────────────────────────┘      │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │ User A's Instance (ID: wf-clone-001)                          │      │
│  │ ✔ Cloned from master                                          │      │
│  │ ✔ Active: true                                                │      │
│  │ ✔ Webhook: /webhook/user-a-uuid/automation                    │      │
│  │                                                                │      │
│  │ Nodes (20 total):                                             │      │
│  │  1. Webhook → 2. Get Configs (user-a-uuid) → 3. Router →    │      │
│  │  4-10. WhatsApp Branch → 11-12. AI Agent → etc.             │      │
│  └──────────────────────────────────────────────────────────────┘      │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │ User B's Instance (ID: wf-clone-002)                          │      │
│  │ ✔ Cloned from master                                          │      │
│  │ ✔ Active: true                                                │      │
│  │ ✔ Webhook: /webhook/user-b-uuid/automation                    │      │
│  │                                                                │      │
│  │ Nodes (20 total):                                             │      │
│  │  1. Webhook → 2. Get Configs (user-b-uuid) → 3. Router →    │      │
│  │  4-10. WhatsApp Branch → 11-12. AI Agent → etc.             │      │
│  └──────────────────────────────────────────────────────────────┘      │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │ User C's Instance (ID: wf-clone-003)                          │      │
│  │ ✔ Cloned from master                                          │      │
│  │ ✔ Active: true                                                │      │
│  │ ✔ Webhook: /webhook/user-c-uuid/automation                    │      │
│  │                                                                │      │
│  │ Nodes (20 total):                                             │      │
│  │  1. Webhook → 2. Get Configs (user-c-uuid) → 3. Router →    │      │
│  │  4-10. WhatsApp Branch → 11-12. AI Agent → etc.             │      │
│  └──────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Workflow Internal Structure (All 7 Modules)

```
┌──────────────────────────────────────────────────────────────────┐
│  User's Workflow Instance (e.g., wf-clone-001)                   │
└──────────────────────────────────────────────────────────────────┘
                             ↓
        ┌───────────────────────────────────┐
        │  Webhook Entry                     │
        │  Path: {user-uuid}/automation     │
        └───────────────────────────────────┘
                             ↓
        ┌───────────────────────────────────┐
        │  Validate Input                    │
        │  - Add timestamps                  │
        │  - Add execution ID                │
        └───────────────────────────────────┘
                             ↓
        ┌───────────────────────────────────┐
        │  Get User Configs (PostgreSQL)    │
        │  WHERE crm_user_id = {user-uuid}  │
        │  AND enabled = true               │
        └───────────────────────────────────┘
                             ↓
        ┌───────────────────────────────────┐
        │  Transform Configs                 │
        │  Array → Object                   │
        └───────────────────────────────────┘
                             ↓
        ┌───────────────────────────────────┐
        │  Module Router (Switch)            │
        │  Routes based on: $json.module    │
        └───────────────────────────────────┘
         ↓      ↓      ↓      ↓      ↓      ↓      ↓
    ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
    │ WA  │ │ AI  │ │ RAG │ │Email│ │ SMS │ │ Cal │ │Chat │
    └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘
       ↓       ↓       ↓       ↓       ↓       ↓       ↓
    ┌──────────────────────────────────────────────────────┐
    │           Merge All Results                           │
    └──────────────────────────────────────────────────────┘
                             ↓
        ┌───────────────────────────────────┐
        │  Prepare Log Data                  │
        │  - Calculate execution time        │
        │  - Format for database             │
        └───────────────────────────────────┘
                             ↓
        ┌───────────────────────────────────┐
        │  Log Execution (PostgreSQL)        │
        │  INSERT INTO                      │
        │  automation_execution_logs        │
        └───────────────────────────────────┘
                             ↓
                    ✅ COMPLETE
```

---

## WhatsApp Module (Detailed)

```
┌───────────────────────────────────────────────────────────────┐
│  WhatsApp Handler (Code Node)                                 │
│  - Check if whatsapp in enabled_modules                       │
│  - If NO → return {status: 'disabled', skip: true}            │
│  - If YES → extract config (instance, auto_reply, ai_model)   │
└───────────────────────────────────────────────────────────────┘
                             ↓
        ┌───────────────────────────────────┐
        │  WhatsApp Enabled? (IF)            │
        │  skip_execution === true?         │
        └───────────────────────────────────┘
           NO ↓                  YES → Skip to Merge
        ┌───────────────────────────────────┐
        │  Find Contact (PostgreSQL)         │
        │  WHERE crm_user_id = {user}       │
        │  AND whatsapp_number = {from}     │
        └───────────────────────────────────┘
                             ↓
        ┌───────────────────────────────────┐
        │  Contact Exists? (IF)              │
        └───────────────────────────────────┘
        NO ↓                     YES ↓
    ┌─────────┐           ┌─────────┐
    │ Create  │           │ Use     │
    │ Contact │           │ Existing│
    └─────────┘           └─────────┘
                ↓           ↓
        ┌───────────────────────────────────┐
        │  Store Inbound Message             │
        │  INSERT INTO activities           │
        └───────────────────────────────────┘
                             ↓
        ┌───────────────────────────────────┐
        │  Get Conversation History          │
        │  Last 10 messages for context     │
        └───────────────────────────────────┘
                             ↓
        ┌───────────────────────────────────┐
        │  Prepare AI Context                │
        │  - Format conversation             │
        │  - Get AI Agent config             │
        │  - Combine history + message       │
        └───────────────────────────────────┘
                             ↓
        ┌───────────────────────────────────┐
        │  Auto Reply Enabled? (IF)          │
        │  config.auto_reply === true?      │
        └───────────────────────────────────┘
           YES ↓                NO → Skip to Merge
        ┌───────────────────────────────────┐
        │  Call AI (HTTP)                    │
        │  - Model: from config (gpt-4/etc) │
        │  - Prompt: from AI Agent config   │
        │  - Temperature: from AI config    │
        └───────────────────────────────────┘
                             ↓
        ┌───────────────────────────────────┐
        │  Extract AI Response               │
        │  Parse JSON response               │
        └───────────────────────────────────┘
                             ↓
        ┌───────────────────────────────────┐
        │  Store Outbound Message            │
        │  INSERT INTO activities           │
        │  (direction='outbound')           │
        └───────────────────────────────────┘
                             ↓
        ┌───────────────────────────────────┐
        │  Send WhatsApp Reply (HTTP)        │
        │  - To: Original sender             │
        │  - Instance: from config           │
        │  - Message: AI response            │
        └───────────────────────────────────┘
                             ↓
                    → Merge Results →
```

---

## Config Flow (User Changes Settings)

```
┌─────────────────────────────────────────────────────────────┐
│  USER: Changes WhatsApp AI Model from gpt-4 to llama3      │
└─────────────────────────────────────────────────────────────┘
                          ↓
    CRM UI: /automations page
    Click "Configure" on WhatsApp card
    Change AI Model dropdown to "llama3"
    Click "Save Configuration"
                          ↓
    PUT /api/automations/whatsapp/config
    {
      "config_data": {
        "instance_name": "my-bot",
        "auto_reply": true,
        "ai_model": "llama3"  ← Changed
      }
    }
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  DATABASE: automation_configs table updated                 │
└─────────────────────────────────────────────────────────────┘
    UPDATE automation_configs
    SET config_data = '{"ai_model":"llama3",...}'
    WHERE crm_user_id = 'user-a-uuid'
    AND module_key = 'whatsapp'
                          ↓
                  ✅ CONFIG SAVED
                          
─────────────────────────────────────────────────────────────
                  1 MINUTE LATER
─────────────────────────────────────────────────────────────
                          
┌─────────────────────────────────────────────────────────────┐
│  AUTOMATION RUNS: WhatsApp message received                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
    Backend triggers user's workflow
    POST /webhook/user-a-uuid/automation
                          ↓
    n8n Workflow Executes
                          ↓
    Node: Get User Configs (PostgreSQL)
    SELECT config_data FROM automation_configs
    WHERE crm_user_id = 'user-a-uuid'
    AND module_key = 'whatsapp'
                          ↓
    Returns: {
      "instance_name": "my-bot",
      "auto_reply": true,
      "ai_model": "llama3"  ← UPDATED VALUE! ✅
    }
                          ↓
    Node: WhatsApp Handler
    const aiModel = config.ai_model; // "llama3"
                          ↓
    Node: Call AI
    URL = http://ollama:11434/api/chat  ← Uses Ollama for llama3
    Model = "llama3"  ← User's custom choice
                          ↓
    AI response generated with llama3 ✅
                          ↓
    Response sent to patient ✅
```

**NO n8n edit. NO restart. NO redeploy. INSTANT synchronization!**

---

## Per-User Isolation (Security)

```
┌─────────────────────────────────────────────────────────────┐
│  User A Triggers Automation                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
    JWT: {id: 100, email: "usera@email.com"}
                          ↓
    Backend: Decode JWT
    exora_user_id = 100
                          ↓
    Query: SELECT id FROM crm_users WHERE exora_user_id = 100
    Returns: crm_user_id = "user-a-uuid"
                          ↓
    Query: SELECT n8n_workflow_id FROM crm_users WHERE id = "user-a-uuid"
    Returns: "wf-clone-001"
                          ↓
    Trigger: POST /webhook/user-a-uuid/automation
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  n8n: Workflow wf-clone-001 Executes                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
    All database queries include:
    WHERE crm_user_id = 'user-a-uuid'
                          ↓
    Returns ONLY User A's data:
    - contacts (User A's)
    - events (User A's)
    - activities (User A's)
    - automation_configs (User A's)
                          ↓
                  ✅ ISOLATED

─────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│  User B is COMPLETELY UNAFFECTED                            │
└─────────────────────────────────────────────────────────────┘

    User B's workflow (wf-clone-002) was never triggered
    User B's data was never queried
    User B's configs were never loaded
    User B's logs don't show User A's execution
    
                  ✅ PERFECT ISOLATION
```

---

## Data Ownership

```
┌──────────────────┬──────────────┬──────────────┬──────────────┐
│                  │  User A      │  User B      │  User C      │
├──────────────────┼──────────────┼──────────────┼──────────────┤
│ n8n Workflow ID  │ wf-clone-001 │ wf-clone-002 │ wf-clone-003 │
│ Webhook Path     │ user-a-uuid/ │ user-b-uuid/ │ user-c-uuid/ │
│ Industry         │ Healthcare   │ Restaurant   │ Sales        │
│ Enabled Modules  │ 4 modules    │ 4 modules    │ 3 modules    │
│ Contacts         │ 50 patients  │ 200 customers│ 30 leads     │
│ Events           │ 120 appts    │ 80 bookings  │ 15 meetings  │
│ Execution Logs   │ 500 runs     │ 300 runs     │ 100 runs     │
└──────────────────┴──────────────┴──────────────┴──────────────┘
```

**Each column is completely isolated from the others!**

---

## Configuration Inheritance

```
┌─────────────────────────────────────────────────────────────┐
│  LEVEL 1: Master Template (automation_modules table)        │
│  Defines what's POSSIBLE                                    │
└─────────────────────────────────────────────────────────────┘
    module_key: 'whatsapp'
    config_schema: {
      properties: {
        instance_name: {type: 'string'},
        auto_reply: {type: 'boolean'},
        ai_model: {type: 'string', enum: ['gpt-4', 'gpt-3.5', 'llama3']}
      }
    }
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  LEVEL 2: Industry Template (industryTemplates.js)          │
│  Defines what's RECOMMENDED                                 │
└─────────────────────────────────────────────────────────────┘
    healthcare: {
      recommended_automations: ['whatsapp', ...],
      default_configs: {
        whatsapp: {
          auto_reply: true,
          ai_model: 'gpt-4'
        }
      }
    }
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  LEVEL 3: User's Config (automation_configs table)          │
│  Defines what's ACTUALLY USED                               │
└─────────────────────────────────────────────────────────────┘
    crm_user_id: 'user-a-uuid'
    module_key: 'whatsapp'
    enabled: true
    config_data: {
      instance_name: 'my-custom-bot',  ← User customized
      auto_reply: true,                ← From industry default
      ai_model: 'llama3'               ← User changed from gpt-4
    }
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  RUNTIME: n8n uses Level 3 values                           │
└─────────────────────────────────────────────────────────────┘
```

**Users start with industry defaults but can fully customize!**

---

## Request Flow (Complete)

```
┌─────────────────────────────────────────────────────────────┐
│  1. EXTERNAL TRIGGER (WhatsApp message)                     │
└─────────────────────────────────────────────────────────────┘
    Evolution API → CRM Backend
    POST /api/webhooks/whatsapp-incoming
    {
      crm_user_id: "user-a-uuid",
      from_phone: "+55...",
      message: "Hello"
    }
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  2. MIDDLEWARE: enrichWithConfigs                           │
└─────────────────────────────────────────────────────────────┘
    Query: SELECT module_key, config_data 
           FROM automation_configs
           WHERE crm_user_id = 'user-a-uuid'
           AND enabled = true
    
    Returns: [
      {module_key: 'whatsapp', config_data: {ai_model: 'llama3', ...}},
      {module_key: 'ai_agent', config_data: {...}},
      {module_key: 'calendar', config_data: {...}}
    ]
    
    Transform to: req.body.enabled_modules = {
      whatsapp: {ai_model: 'llama3', ...},
      ai_agent: {...},
      calendar: {...}
    }
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  3. SERVICE: triggerUserWorkflow                            │
└─────────────────────────────────────────────────────────────┘
    a) Get workflow ID from database:
       SELECT n8n_workflow_id FROM crm_users WHERE id = 'user-a-uuid'
       → "wf-clone-001"
    
    b) Get webhook URL:
       GET n8n/api/v1/workflows/wf-clone-001
       → Extract path: "user-a-uuid/automation"
       → Build URL: n8n.exora.solutions/webhook/user-a-uuid/automation
    
    c) POST to user's specific webhook
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  4. n8n: User A's Workflow Executes                         │
└─────────────────────────────────────────────────────────────┘
    Webhook → Validate → Get Configs (queries DB again for freshness)
    → Router → WhatsApp Handler → Process → AI → Reply → Log
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  5. RESULT: Patient receives AI response                    │
│           CRM shows conversation                           │
│           Automation logged                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Files You Need

### **Import to n8n (1 file):**
```
exora-crm/n8n/master-crm-automation-workflow-complete.json
```

### **Run Migration (1 file):**
```
exora-crm/database/add-automation-tables.sql
```

### **Everything Else:**
Already implemented in backend and frontend!

---

## Environment Variables

### **Main Exora Backend (.env):**
```bash
CRM_MASTER_WORKFLOW_ID=RLxyz123  # From n8n import
```

### **CRM Backend (.env):**
```bash
N8N_BASE_URL=https://n8n.exora.solutions
N8N_API_KEY=your-n8n-api-key
EVOLUTION_API_URL=https://evolution.exora.solutions
```

---

## Testing Commands

### **1. Check Database:**
```sql
-- Verify modules
SELECT module_key, name FROM automation_modules;
-- Should show 7 rows

-- Check user's configs
SELECT * FROM automation_configs WHERE crm_user_id = 'your-uuid';
-- Should show enabled automations

-- View logs
SELECT * FROM automation_execution_logs 
WHERE crm_user_id = 'your-uuid' 
ORDER BY executed_at DESC 
LIMIT 10;
```

### **2. Check n8n:**
```bash
# List workflows
curl https://n8n.exora.solutions/api/v1/workflows \
  -H "X-N8N-API-KEY: your-key"

# Should show cloned workflows for each user
```

### **3. Test API:**
```bash
# Get available modules
curl https://crm-api.exora.solutions/api/automations/modules \
  -H "Authorization: Bearer $TOKEN"

# Get user's configs
curl https://crm-api.exora.solutions/api/automations/configs \
  -H "Authorization: Bearer $TOKEN"

# Trigger automation
curl -X POST https://crm-api.exora.solutions/api/webhooks/trigger-automation \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"module":"ai_agent","crm_user_id":"your-uuid","prompt":"test"}'
```

---

## 🎉 Final Answer to Your Questions

### **Q: Do I need each of the 7 workflows designed in n8n separately or as one single workflow?**

**A:** ✅ **ONE single workflow** - the master template contains all 7 modules as conditional branches.

### **Q: If one single workflow, how does enabling different functions sync with n8n?**

**A:** ✅ **Database synchronization** - n8n queries the database on every run to get user's enabled modules and their configs. When user changes settings in UI, database updates, and next automation run uses new settings automatically.

### **Critical Point: Users only talk to their own cloned instance?**

**A:** ✅ **Absolutely YES!** 
- Each user gets their own cloned workflow (stored in `crm_users.n8n_workflow_id`)
- Unique webhook URL per user: `/webhook/{user-uuid}/automation`
- Backend always routes to user's specific workflow instance
- Database queries filter by `crm_user_id`
- Complete isolation guaranteed

---

## 🎊 You're Ready!

Everything is implemented, documented, and ready to deploy.

**Next Steps:**
1. Import workflow to n8n
2. Run database migration
3. Set environment variables
4. Restart services
5. Test with a user

**Refer to:** `COMPLETE_E2E_IMPLEMENTATION.md` for detailed deployment steps.

🚀 **Happy Automating!**

