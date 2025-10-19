# 🔧 Workflow Debug Information Guide

## Where to Find Workflow ID

### **1. Browser Console (Frontend)**

Open CRM Dashboard and check browser console:

```
═══════════════════════════════════════════════════
🔧 CRM WORKFLOW DEBUG INFO
═══════════════════════════════════════════════════
CRM User ID: abc-def-123-456-789
n8n Workflow ID: wf-clone-xyz123
Webhook URL: https://n8n.exora.solutions/webhook/abc-def-123-456-789/automation
Webhook Path: abc-def-123-456-789/automation
Business: My Healthcare Clinic
Industry: healthcare
Status: active
═══════════════════════════════════════════════════
```

**When:** Automatically logged when Dashboard page loads

---

### **2. Visual Debug Panel (Frontend)**

In CRM Dashboard, scroll to bottom:

```
┌─────────────────────────────────────────────┐
│ 🔧 Workflow Debug Info                  ▶  │  ← Click to expand
└─────────────────────────────────────────────┘
```

When expanded:
```
┌─────────────────────────────────────────────┐
│ 🔧 Workflow Debug Info                  ▼  │
├─────────────────────────────────────────────┤
│ CRM User ID:      abc-def-123-456-789      │
│ n8n Workflow ID:  wf-clone-xyz123          │
│ Webhook URL:      n8n.../webhook/abc.../... │
│ Webhook Path:     abc-def-123-456-789/auto │
│ Business:         My Healthcare Clinic      │
│ Industry:         healthcare                │
│ Status:           active                    │
└─────────────────────────────────────────────┘
```

**Location:** Bottom of `/` dashboard page  
**Interactive:** Click header to expand/collapse

---

### **3. API Endpoint**

Call the workflow info API:

```bash
curl https://crm-api.exora.solutions/api/workflow/info \
  -H "Authorization: Bearer YOUR_CRM_TOKEN"
```

**Response:**
```json
{
  "workflow_id": "wf-clone-xyz123",
  "webhook_url": "https://n8n.exora.solutions/webhook/abc-def-123/automation",
  "webhook_path": "abc-def-123-456-789/automation",
  "crm_user_id": "abc-def-123-456-789",
  "status": "active",
  "business_name": "My Healthcare Clinic",
  "industry": "healthcare"
}
```

**Backend Console Output:**
```
═══════════════════════════════════════════════════════════════
📊 [WorkflowInfo] USER WORKFLOW INFORMATION
═══════════════════════════════════════════════════════════════
CRM User ID: abc-def-123-456-789
n8n Workflow ID: wf-clone-xyz123
Webhook URL: https://n8n.exora.solutions/webhook/abc-def-123/automation
Webhook Path: abc-def-123-456-789/automation
Business: My Healthcare Clinic
Industry: healthcare
Status: active
═══════════════════════════════════════════════════════════════
```

---

### **4. Database Query**

```sql
SELECT 
  id as crm_user_id,
  exora_user_id,
  n8n_workflow_id,
  business_name,
  industry,
  status,
  created_at
FROM crm_users
WHERE exora_user_id = YOUR_EXORA_USER_ID;
```

**Example Result:**
```
┌──────────────────────┬───────────────┬─────────────────┬──────────────┬───────────┬────────┐
│ crm_user_id          │ exora_user_id │ n8n_workflow_id │ business_name│ industry  │ status │
├──────────────────────┼───────────────┼─────────────────┼──────────────┼───────────┼────────┤
│ abc-def-123-456-789  │ 100           │ wf-clone-xyz123 │ My Clinic    │ healthcare│ active │
└──────────────────────┴───────────────┴─────────────────┴──────────────┴───────────┴────────┘
```

---

## Backend Logging (Server Console)

### **When User Authenticates:**

```
🔐 [Auth] Existing CRM user authenticated
   CRM User ID: abc-def-123-456-789
   Workflow ID: wf-clone-xyz123
   Status: active
```

### **When Automation Triggers:**

#### **1. Event Created:**
```
═══════════════════════════════════════════════════════════════
📅 [Events] EVENT CREATED - TRIGGERING AUTOMATION
═══════════════════════════════════════════════════════════════
CRM User ID: abc-def-123-456-789
Event ID: event-uuid-123
Contact: John Doe
Title: Consultation
Time: 2025-10-20T10:00:00 → 2025-10-20T10:30:00
═══════════════════════════════════════════════════════════════
```

#### **2. Config Enrichment:**
```
🔧 [enrichWithConfigs] Enriching webhook for user: abc-def-123-456-789
✅ [enrichWithConfigs] Enabled modules for user: whatsapp, ai_agent, calendar, sms
📦 [enrichWithConfigs] Configs: {
  "whatsapp": {
    "instance_name": "my-clinic-bot",
    "auto_reply": true,
    "ai_model": "gpt-4"
  },
  "ai_agent": {
    "system_prompt": "You are a medical clinic assistant...",
    "temperature": 0.3,
    "max_tokens": 500
  },
  "calendar": {
    "default_duration": 30
  },
  "sms": {}
}
```

#### **3. Workflow Trigger:**
```
═══════════════════════════════════════════════════════════════
🚀 [WorkflowInstance] TRIGGERING USER AUTOMATION
═══════════════════════════════════════════════════════════════
📋 CRM User ID: abc-def-123-456-789
🔧 n8n Workflow ID: wf-clone-xyz123
⚡ Module: calendar
🌐 Webhook URL: https://n8n.exora.solutions/webhook/abc-def-123/automation
📦 Payload: {
  "module": "calendar",
  "crm_user_id": "abc-def-123-456-789",
  "event_id": "event-uuid-123",
  "contact_name": "John Doe",
  "start_time": "2025-10-20T10:00:00",
  "end_time": "2025-10-20T10:30:00",
  "title": "Consultation",
  "trigger_source": "event_created"
}
═══════════════════════════════════════════════════════════════
✅ [WorkflowInstance] Workflow triggered successfully
📤 Response: {
  "success": true,
  "execution_id": "exec-123"
}
═══════════════════════════════════════════════════════════════
```

---

## How to Use Debug Info

### **Verify Workflow Assignment:**

1. Open CRM Dashboard
2. Check browser console
3. Look for: `n8n Workflow ID: wf-clone-xyz123`
4. Or expand debug panel at bottom of page

### **Verify Webhook URL:**

The webhook URL should follow this pattern:
```
https://n8n.exora.solutions/webhook/{CRM_USER_UUID}/automation
```

Example:
```
https://n8n.exora.solutions/webhook/abc-def-123-456-789/automation
```

**Each user has UNIQUE UUID in the path!**

### **Test Webhook Manually:**

```bash
# Get your webhook URL from dashboard debug panel
# Then test it:

curl -X POST "https://n8n.exora.solutions/webhook/abc-def-123/automation" \
  -H "Content-Type: application/json" \
  -d '{
    "module": "ai_agent",
    "crm_user_id": "abc-def-123-456-789",
    "message": "Test message",
    "trigger_source": "manual_test"
  }'
```

### **Check n8n UI:**

1. Login to n8n
2. Go to **Workflows**
3. Find workflow named: `CRM Automation - youruser@email.com`
4. Click on it
5. Check **Webhook** node
6. Verify **Path** = `{your-crm-user-uuid}/automation`

---

## Troubleshooting

### **Issue: Workflow ID is null**

**Debug Steps:**
```sql
SELECT id, exora_user_id, n8n_workflow_id, status 
FROM crm_users 
WHERE exora_user_id = YOUR_EXORA_ID;
```

**If `n8n_workflow_id` is NULL:**
- CRM was not properly activated from Exora dashboard
- Cloning failed during activation
- **Solution:** Re-activate CRM from Exora dashboard

### **Issue: Webhook returns 404**

**Debug Steps:**
1. Check workflow ID exists in n8n:
   ```bash
   curl https://n8n.exora.solutions/api/v1/workflows/wf-clone-xyz123 \
     -H "X-N8N-API-KEY: your-key"
   ```

2. Verify webhook path matches:
   - Database shows: `abc-def-123/automation`
   - n8n workflow webhook node path: Should be same

3. Check if workflow is active in n8n

### **Issue: Automation not triggered**

**Check Backend Logs:**

Look for these log lines:
```
📅 [Events] EVENT CREATED - TRIGGERING AUTOMATION
🔧 [enrichWithConfigs] Enriching webhook for user...
🚀 [WorkflowInstance] TRIGGERING USER AUTOMATION
```

**If missing:**
- Event not being created
- Automation trigger is being skipped
- Check if module is enabled

**If present but fails:**
- Check webhook URL is correct
- Verify n8n is accessible
- Check n8n workflow is active

---

## Quick Debug Checklist

```
□ Open CRM Dashboard
□ Check browser console for workflow info
□ Expand debug panel at bottom
□ Verify CRM User ID is a UUID
□ Verify n8n Workflow ID is NOT null
□ Verify Webhook URL contains your CRM User ID
□ Create test event
□ Check backend console for trigger logs
□ Verify automation executes in n8n
□ Check automation_execution_logs table
```

---

## SQL Debug Queries

### **Check User's Workflow:**
```sql
SELECT 
  id as crm_user_id,
  n8n_workflow_id,
  business_name,
  industry,
  status
FROM crm_users
WHERE id = 'YOUR_CRM_USER_UUID';
```

### **Check Enabled Automations:**
```sql
SELECT 
  module_key,
  enabled,
  config_data
FROM automation_configs
WHERE crm_user_id = 'YOUR_CRM_USER_UUID'
AND enabled = true;
```

### **Check Recent Executions:**
```sql
SELECT 
  module_key,
  trigger_source,
  status,
  execution_time_ms,
  executed_at
FROM automation_execution_logs
WHERE crm_user_id = 'YOUR_CRM_USER_UUID'
ORDER BY executed_at DESC
LIMIT 10;
```

---

## Expected Log Flow

### **Complete Sequence:**

```
1. User Auth:
   🔐 [Auth] Existing CRM user authenticated
      CRM User ID: abc-def-123
      Workflow ID: wf-clone-xyz123

2. User Creates Event:
   📅 [Events] EVENT CREATED - TRIGGERING AUTOMATION
      CRM User ID: abc-def-123
      Event ID: event-123

3. Config Enrichment:
   🔧 [enrichWithConfigs] Enriching webhook for user: abc-def-123
   ✅ [enrichWithConfigs] Enabled modules: whatsapp, calendar, ai_agent

4. Workflow Trigger:
   🚀 [WorkflowInstance] TRIGGERING USER AUTOMATION
      CRM User ID: abc-def-123
      n8n Workflow ID: wf-clone-xyz123
      Module: calendar
      Webhook URL: https://n8n.../webhook/abc-def-123/automation

5. Success:
   ✅ [WorkflowInstance] Workflow triggered successfully
```

**If you see all 5 steps, automation is working correctly!**

---

## Visual Debug Panel Features

### **Frontend Display:**

The debug panel shows:
- ✅ **CRM User ID** - Your unique identifier in CRM database
- ✅ **n8n Workflow ID** - Your cloned workflow in n8n
- ✅ **Webhook URL** - Full URL for triggering automations
- ✅ **Webhook Path** - Just the path part
- ✅ **Business Name** - Your business
- ✅ **Industry** - Selected industry
- ✅ **Status** - active/pending_setup

### **Collapsible Design:**

- Default: Collapsed (just shows "🔧 Workflow Debug Info ▶")
- Click to expand: Shows all details
- Non-intrusive: Dashed border, gray background
- Easy copy: Values are in `<code>` tags for selection

---

## Production vs Development

### **Development:**
```
Webhook URL: http://localhost:5679/webhook/abc-def-123/automation
```

### **Production:**
```
Webhook URL: https://n8n.exora.solutions/webhook/abc-def-123/automation
```

**Both patterns work the same way - just different domain!**

---

## Summary

### **Frontend Debug:**
- ✅ Browser console logs on dashboard load
- ✅ Visual debug panel (collapsible)
- ✅ API endpoint `/api/workflow/info`

### **Backend Debug:**
- ✅ Auth middleware logs user info
- ✅ Event creation logs trigger info
- ✅ Config enrichment logs enabled modules
- ✅ Workflow service logs full trigger details

### **Database Debug:**
- ✅ SQL queries to check workflow ID
- ✅ Check enabled automations
- ✅ View execution logs

**You now have comprehensive debugging at every layer!** 🎯

