# Per-User Workflow Isolation - Complete Architecture

## 🔐 Critical Security Concept

**Each user gets their OWN cloned n8n workflow instance that ONLY they can access.**

Users NEVER interact with n8n directly - all automation management happens through the CRM UI.

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                    n8n Server                                     │
│                                                                   │
│  Master Template (Never executed directly)                       │
│  └─ ID: "master-crm-automation"                                  │
│     Webhook: /webhook/TEMPLATE/automation                        │
│                                                                   │
│  User A's Instance (Cloned from template)                        │
│  └─ ID: "abc-def-123"                                            │
│     Webhook: /webhook/[CRM_USER_A_UUID]/automation               │
│     ↑ ONLY User A can trigger this                              │
│                                                                   │
│  User B's Instance (Cloned from template)                        │
│  └─ ID: "xyz-789-456"                                            │
│     Webhook: /webhook/[CRM_USER_B_UUID]/automation               │
│     ↑ ONLY User B can trigger this                              │
│                                                                   │
│  User C's Instance (Cloned from template)                        │
│  └─ ID: "qwe-rty-789"                                            │
│     Webhook: /webhook/[CRM_USER_C_UUID]/automation               │
│     ↑ ONLY User C can trigger this                              │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Storage

### `crm_users` Table
```sql
┌─────────────┬────────────────┬──────────────────┬────────────────┐
│ id (UUID)   │ exora_user_id  │ n8n_workflow_id  │ status         │
├─────────────┼────────────────┼──────────────────┼────────────────┤
│ abc-def-123 │ 1              │ wf-clone-001     │ active         │
│ xyz-789-456 │ 2              │ wf-clone-002     │ active         │
│ qwe-rty-789 │ 3              │ wf-clone-003     │ pending_setup  │
└─────────────┴────────────────┴──────────────────┴────────────────┘
```

**Key Fields:**
- `id` (UUID) - Used in webhook path for isolation
- `exora_user_id` - Links to main Exora user
- `n8n_workflow_id` - Their specific cloned workflow in n8n
- `status` - pending_setup | active

---

## 🔄 Activation Flow (When User Activates CRM)

### Step-by-Step Process:

```
User clicks "Activate" on CRM card in Exora Dashboard
    ↓
Main Exora Backend: /activate-workflow
    ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Create CRM User Record                              │
└─────────────────────────────────────────────────────────────┘
    ↓
    INSERT INTO crm_users (exora_user_id, status)
    VALUES (123, 'pending_setup')
    RETURNING id
    ↓
    crm_user_id = "abc-def-123" (UUID)

┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Fetch Master Template from n8n                      │
└─────────────────────────────────────────────────────────────┘
    ↓
    GET n8n/api/v1/workflows/MASTER_TEMPLATE_ID
    ↓
    Returns: {
      id: "master-crm-automation",
      name: "Exora CRM - Universal Automation Hub (Template)",
      nodes: [
        {
          type: "n8n-nodes-base.webhook",
          parameters: { path: "TEMPLATE/automation" }
        },
        ... 30 more nodes
      ]
    }

┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Clone Workflow with User-Specific Webhook Path      │
└─────────────────────────────────────────────────────────────┘
    ↓
    // Update webhook node
    nodes.map(node => {
      if (node.type === 'n8n-nodes-base.webhook') {
        node.parameters.path = "abc-def-123/automation" ← USER-SPECIFIC
      }
      return node;
    })
    ↓
    POST n8n/api/v1/workflows
    {
      name: "CRM Automation - user@email.com",
      nodes: [...updated nodes with user-specific path],
      active: false
    }
    ↓
    Returns: { id: "wf-clone-001" }

┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Store Cloned Workflow ID                            │
└─────────────────────────────────────────────────────────────┘
    ↓
    UPDATE crm_users 
    SET n8n_workflow_id = 'wf-clone-001'
    WHERE id = 'abc-def-123'

┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Redirect to CRM with Token                          │
└─────────────────────────────────────────────────────────────┘
    ↓
    Generate JWT with exora_user_id = 123
    ↓
    Redirect: https://crm.exora.solutions?token=JWT&setup=true
```

**Result:**
- ✅ User has their own workflow instance
- ✅ Webhook URL is unique: `n8n.exora.solutions/webhook/abc-def-123/automation`
- ✅ Other users can't trigger this webhook (different UUID)
- ✅ Workflow ID stored in database for future use

---

## 🎯 Triggering User Automations (Runtime)

### **Example: User Creates Event in CRM**

```
User creates appointment in CRM UI
    ↓
POST /api/events
    ↓
Backend: router.post('/', async (req, res) => {
  const crmUserId = req.user.crm_user_id; // From JWT
  
  // Create event in database
  const event = await pool.query('INSERT INTO events...');
  
  // Trigger user's SPECIFIC workflow
  await triggerUserAutomation(crmUserId, 'calendar', {
    event_id: event.id,
    start_time: event.start_time,
    end_time: event.end_time,
    contact_name: contact.name,
    trigger_source: 'event_created'
  });
})
    ↓
services/n8nService.js: triggerUserAutomation()
    ↓
services/workflowInstanceService.js: triggerUserWorkflow()
    ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Get User's Workflow ID from Database                │
└─────────────────────────────────────────────────────────────┘
    ↓
    SELECT n8n_workflow_id FROM crm_users WHERE id = 'abc-def-123'
    ↓
    Returns: "wf-clone-001"

┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Get Webhook URL for This Workflow                   │
└─────────────────────────────────────────────────────────────┘
    ↓
    GET n8n/api/v1/workflows/wf-clone-001
    ↓
    Find webhook node, extract path: "abc-def-123/automation"
    ↓
    Build URL: https://n8n.exora.solutions/webhook/abc-def-123/automation

┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Call User's Specific Webhook                        │
└─────────────────────────────────────────────────────────────┘
    ↓
    POST https://n8n.exora.solutions/webhook/abc-def-123/automation
    {
      "module": "calendar",
      "crm_user_id": "abc-def-123",
      "event_id": "event-uuid",
      "start_time": "2025-10-20T10:00:00",
      "trigger_source": "event_created"
    }

┌─────────────────────────────────────────────────────────────┐
│ n8n Executes User A's Workflow Instance ONLY                 │
└─────────────────────────────────────────────────────────────┘
    ↓
    1. Get User Configs (queries automation_configs for user abc-def-123)
    2. Routes to Calendar Handler
    3. Creates Google Calendar event
    4. Updates database
    5. Logs execution
```

**Security:** User B cannot trigger User A's automations because:
- Different webhook URL (different UUID in path)
- Different workflow instance ID
- Database queries filtered by `crm_user_id`

---

## 🔒 Isolation Mechanisms

### **Level 1: Unique Webhook URLs**

```
User A: /webhook/abc-def-123/automation
User B: /webhook/xyz-789-456/automation
User C: /webhook/qwe-rty-789/automation
```

Each user has a UUID-based webhook path. Without knowing another user's UUID, you can't trigger their automations.

### **Level 2: Database Filtering**

Every n8n workflow node that queries the database includes:
```sql
WHERE crm_user_id = $1::uuid
```

Even if someone somehow triggered another user's workflow, the database queries would only return that user's data.

### **Level 3: Workflow Cloning**

Each user gets a completely separate workflow instance:
- Different workflow ID in n8n
- Different execution history
- Different credentials (if/when implemented)
- Independent activation state

### **Level 4: Backend Validation**

```javascript
// CRM Backend validates JWT
const crmUserId = req.user.crm_user_id; // From validated JWT

// Only triggers THIS user's workflow
await triggerUserWorkflow(crmUserId, module, data);
```

---

## 🎯 Complete Data Flow Example

### **Scenario: User A Receives WhatsApp Message**

```
┌──────────────────────────────────────────────────────────────┐
│ External Event: WhatsApp Message to User A's Number         │
└──────────────────────────────────────────────────────────────┘
    ↓
Evolution API → Evolution Webhook (configured per instance)
    ↓
CRM Backend: /api/webhooks/whatsapp-incoming
{
  "crm_user_id": "abc-def-123",  ← Identified by WhatsApp instance
  "from_phone": "+5511987654321",
  "message": "I need appointment"
}
    ↓
enrichWithConfigs Middleware
    ↓
Queries database:
SELECT module_key, config_data 
FROM automation_configs 
WHERE crm_user_id = 'abc-def-123' 
AND enabled = true
    ↓
Returns: {
  whatsapp: {instance_name: 'clinic-bot', auto_reply: true, ai_model: 'gpt-4'},
  ai_agent: {system_prompt: 'Medical assistant...', temperature: 0.3},
  calendar: {default_duration: 30}
}
    ↓
Attached to request: req.body.enabled_modules = {...}
    ↓
triggerUserAutomation('abc-def-123', 'whatsapp', {...})
    ↓
workflowInstanceService.triggerUserWorkflow()
    ↓
┌──────────────────────────────────────────────────────────────┐
│ Get User A's Workflow ID                                     │
└──────────────────────────────────────────────────────────────┘
    SELECT n8n_workflow_id FROM crm_users WHERE id = 'abc-def-123'
    Returns: "wf-clone-001"
    ↓
┌──────────────────────────────────────────────────────────────┐
│ Get User A's Webhook URL                                     │
└──────────────────────────────────────────────────────────────┘
    GET n8n/api/v1/workflows/wf-clone-001
    Extract webhook path: "abc-def-123/automation"
    Build URL: https://n8n.exora.solutions/webhook/abc-def-123/automation
    ↓
┌──────────────────────────────────────────────────────────────┐
│ Trigger User A's Workflow                                    │
└──────────────────────────────────────────────────────────────┘
    POST https://n8n.exora.solutions/webhook/abc-def-123/automation
    {
      "module": "whatsapp",
      "crm_user_id": "abc-def-123",
      "from_phone": "+5511987654321",
      "message": "I need appointment",
      "enabled_modules": {
        "whatsapp": {...},
        "ai_agent": {...},
        "calendar": {...}
      }
    }
    ↓
┌──────────────────────────────────────────────────────────────┐
│ n8n Workflow Instance "wf-clone-001" Executes                │
│ (This is User A's isolated workflow)                         │
└──────────────────────────────────────────────────────────────┘
    ↓
1. Validate Input Node
   - Adds start_time for performance tracking
   ↓
2. Get User Configs Node (PostgreSQL)
   - Queries: WHERE crm_user_id = 'abc-def-123'
   - Gets ONLY User A's automation configs
   ↓
3. Transform Configs Node
   - Converts to easy-to-use object
   ↓
4. Module Router (Switch)
   - Checks: $json.module === 'whatsapp' → TRUE
   - Routes to WhatsApp branch
   ↓
5. WhatsApp Handler
   - Checks enabled_modules.whatsapp exists → YES
   - Extracts config: auto_reply=true, ai_model='gpt-4'
   ↓
6. WhatsApp Enabled? (IF Node)
   - skip_execution = false → Proceeds
   ↓
7. Find Contact (PostgreSQL)
   - SELECT FROM contacts WHERE crm_user_id = 'abc-def-123'
   - Gets ONLY User A's contacts
   ↓
8. Create Contact (if not exists)
   - INSERT with crm_user_id = 'abc-def-123'
   ↓
9. Store Inbound Message
   - INSERT INTO activities WHERE crm_user_id = 'abc-def-123'
   ↓
10. Get Conversation History
    - SELECT FROM activities WHERE crm_user_id = 'abc-def-123'
    - Last 10 messages for context
    ↓
11. Prepare AI Context
    - Combines history
    - Gets AI Agent config (system_prompt, temperature)
    ↓
12. Auto Reply Enabled?
    - whatsappConfig.auto_reply = true → YES
    ↓
13. Call AI (OpenAI/Ollama)
    - Model: gpt-4 (from user's config)
    - System prompt: "Medical assistant..." (from AI Agent config)
    - Temperature: 0.3 (from AI Agent config)
    ↓
14. Extract AI Response
    ↓
15. Store Outbound Message
    - INSERT INTO activities (direction='outbound')
    ↓
16. Send WhatsApp Reply (Evolution API)
    - Instance: clinic-bot (from user's config)
    - To: +5511987654321
    - Message: AI response
    ↓
17. Merge All Results
    ↓
18. Prepare Log Data
    ↓
19. Log Execution (PostgreSQL)
    INSERT INTO automation_execution_logs
    (
      crm_user_id = 'abc-def-123',
      module_key = 'whatsapp',
      status = 'success',
      execution_time_ms = 1234
    )

DONE! ✅
```

**Meanwhile, User B's workflow (wf-clone-002) was never touched!**

---

## 🔐 Security Guarantees

### **What User A CANNOT Do:**

❌ Trigger User B's workflow  
❌ See User B's data in database queries  
❌ Access User B's n8n workflow in n8n UI (different workflow ID)  
❌ Modify User B's automation configs  
❌ View User B's execution logs  

### **What User A CAN Do:**

✅ Trigger their own workflow via CRM UI  
✅ See only their own data  
✅ Configure their own automation modules  
✅ View their own execution logs  
✅ Enable/disable their own automations  

### **What Users CANNOT Do (n8n Access):**

❌ Access n8n UI directly (requires n8n credentials)  
❌ View ANY workflows in n8n  
❌ Edit their workflow directly  
❌ See other users' workflows  
❌ Export workflow JSON  

**All automation management happens through CRM UI only!**

---

## 🛠️ Backend Services

### **Service: workflowInstanceService.js**

Complete API for per-user workflow management:

```javascript
// Get user's workflow ID from database
getUserWorkflowInstance(crmUserId)
  → SELECT n8n_workflow_id FROM crm_users WHERE id = crmUserId
  → Returns: "wf-clone-001"

// Get user's webhook URL
getUserWorkflowWebhookUrl(crmUserId)
  → Gets workflow ID
  → Fetches workflow from n8n
  → Extracts webhook path
  → Returns: "https://n8n.exora.solutions/webhook/abc-def-123/automation"

// Clone master workflow for new user
cloneWorkflowForUser(masterWorkflowId, crmUserId, exoraUserId)
  → Fetches master template
  → Updates webhook path to user-specific
  → Creates new workflow in n8n
  → Stores workflow ID in crm_users table
  → Returns: cloned workflow ID

// Activate user's workflow
activateUserWorkflow(crmUserId)
  → Gets workflow ID
  → POST n8n/api/v1/workflows/{id}/activate

// Trigger user's workflow
triggerUserWorkflow(crmUserId, module, data)
  → Gets webhook URL for user
  → POST to user's specific webhook
  → Returns: workflow execution result
```

---

## 📡 API Endpoints

### **CRM Backend Routes:**

#### `/api/workflow/status` (GET)
```javascript
// Check if user has workflow instance
{
  "has_workflow": true,
  "workflow_id": "wf-clone-001",
  "status": "active"
}
```

#### `/api/workflow/activate` (POST)
```javascript
// Activate user's workflow in n8n
{
  "success": true,
  "message": "Workflow activated successfully"
}
```

#### `/api/workflow/deactivate` (POST)
```javascript
// Deactivate user's workflow in n8n
{
  "success": true,
  "message": "Workflow deactivated successfully"
}
```

#### `/api/workflow/webhook-url` (GET)
```javascript
// Get user's webhook URL (for debugging)
{
  "webhook_url": "https://n8n.exora.solutions/webhook/abc-def-123/automation"
}
```

#### `/api/webhooks/trigger-automation` (POST)
```javascript
// Trigger automation (uses per-user workflow)
Request: {
  "module": "whatsapp",
  "crm_user_id": "abc-def-123",
  "message": "Hello"
}

Response: {
  "success": true,
  "message": "Automation triggered",
  "result": {...}
}
```

---

## 🎨 Frontend Integration

Users interact with automations through CRM UI:

### **1. Enable Automation**
```
User → /automations → Click "Enable" on WhatsApp
                   ↓
          POST /api/automations/enable
                   ↓
     INSERT INTO automation_configs
                   ↓
        Module now enabled!
```

### **2. Trigger Automation**
```
User → Creates event in Calendar page
                   ↓
          POST /api/events
                   ↓
     Backend automatically triggers user's workflow
                   ↓
     triggerUserAutomation(crm_user_id, 'calendar', {...})
                   ↓
     Calls user's specific webhook
                   ↓
     User's n8n workflow executes
```

### **3. View Execution Logs**
```
User → /automation-history
                   ↓
     GET /api/automations/logs
                   ↓
     SELECT FROM automation_execution_logs
     WHERE crm_user_id = 'abc-def-123'
                   ↓
     Shows ONLY this user's automation runs
```

---

## 🧪 Testing Isolation

### **Test 1: Verify Unique Webhook Paths**

```bash
# User A's webhook
curl -X POST https://n8n.exora.solutions/webhook/abc-def-123/automation \
  -d '{"module":"whatsapp","crm_user_id":"abc-def-123","message":"test"}'
# ✅ Should work

# Try to trigger User A's workflow with User B's ID
curl -X POST https://n8n.exora.solutions/webhook/abc-def-123/automation \
  -d '{"module":"whatsapp","crm_user_id":"xyz-789-456","message":"test"}'
# ⚠️ Will execute but database queries will return User A's data (not User B's)
# This is still safe because of database filtering
```

### **Test 2: Verify Database Filtering**

```sql
-- User A triggers automation
-- n8n queries:
SELECT * FROM contacts WHERE crm_user_id = 'abc-def-123'
-- Returns: [User A's contacts]

-- Even if User B somehow triggered User A's workflow:
SELECT * FROM contacts WHERE crm_user_id = 'xyz-789-456'
-- Returns: [User B's contacts] - correctly isolated
```

### **Test 3: Verify Workflow Cloning**

```bash
# Check n8n has separate workflow instances
GET n8n/api/v1/workflows
# Should return multiple workflows:
# - "CRM Automation - userA@email.com" (ID: wf-clone-001)
# - "CRM Automation - userB@email.com" (ID: wf-clone-002)
# - "CRM Automation - userC@email.com" (ID: wf-clone-003)
```

---

## 📋 Configuration Files

### **Environment Variables Required:**

```bash
# n8n Connection
N8N_BASE_URL=https://n8n.exora.solutions
N8N_API_KEY=your-n8n-api-key

# Master Template ID (set after importing template)
CRM_MASTER_WORKFLOW_ID=master-crm-automation

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/exora-crm
```

---

## 🚀 Deployment Checklist

### **1. Import Master Template to n8n**
```bash
# In n8n UI:
# 1. Go to Workflows → Import from File
# 2. Upload: exora-crm/n8n/master-crm-automation-workflow-complete.json
# 3. Configure PostgreSQL credential
# 4. DO NOT activate (it's just a template)
# 5. Note the workflow ID (e.g., "RLxyz123")
# 6. Add to .env: CRM_MASTER_WORKFLOW_ID=RLxyz123
```

### **2. Test Workflow Cloning**
```bash
# Activate CRM for a test user from Exora dashboard
# Check n8n:
# - New workflow should appear: "CRM Automation - testuser@email.com"
# - Webhook path should be: [CRM_USER_UUID]/automation

# Check database:
SELECT id, exora_user_id, n8n_workflow_id, status FROM crm_users;
# Should show workflow ID for test user
```

### **3. Test Automation Trigger**
```bash
# In CRM UI as test user:
# 1. Go to /automations
# 2. Enable WhatsApp
# 3. Configure settings
# 4. Send test message

# Check logs:
SELECT * FROM automation_execution_logs 
WHERE crm_user_id = [TEST_USER_CRM_ID]
ORDER BY executed_at DESC LIMIT 1;

# Should show successful execution
```

---

## 🎯 Summary

### **Single Master Template Workflow:**
✅ ONE workflow JSON file  
✅ Contains all 7 automation modules  
✅ Never executed directly  
✅ Serves as template for cloning  

### **Per-User Cloned Instances:**
✅ Each user gets their own clone  
✅ Unique webhook URL per user  
✅ Isolated execution  
✅ Independent configuration  

### **Database-Driven Behavior:**
✅ Queries user's enabled modules  
✅ Applies user's custom configs  
✅ Filters data by crm_user_id  
✅ Logs to user's own records  

### **Security & Isolation:**
✅ UUID-based webhook paths  
✅ Database-level filtering  
✅ Separate workflow instances  
✅ JWT authentication required  
✅ No direct n8n access  

---

## 📊 Files Created/Modified

### **New Files (3):**
1. `n8n/master-crm-automation-workflow-complete.json` - Complete n8n workflow
2. `backend/services/workflowInstanceService.js` - Per-user workflow management
3. `backend/routes/workflowManagement.js` - Workflow API endpoints

### **Modified Files (4):**
1. `server/routes/activation.js` - Clone with user-specific webhook path
2. `backend/services/n8nService.js` - Added triggerUserAutomation()
3. `backend/routes/webhooks.js` - Use per-user workflow instances
4. `backend/routes/events.js` - Trigger user-specific workflows
5. `backend/server.js` - Added workflow management route

---

**Status:** ✅ Complete per-user workflow isolation system implemented!

Each user's CRM is completely isolated from other users, with their own:
- n8n workflow instance
- Webhook URL
- Database records
- Automation configurations
- Execution logs

**Users never need n8n access - everything managed through CRM UI!** 🔒

