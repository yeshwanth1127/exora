# 🔗 Webhook System - Complete Explanation

## How the System Detects and Uses Webhook URLs

---

## 🎯 **The Problem You Identified:**

> "To run, we need to know the webhook link. How does my system know the workflow's webhook trigger link?"

**Answer:** The system **automatically detects** webhook URLs from the cloned workflow's configuration!

---

## 🔍 **How Webhook Detection Works:**

### **Step 1: User Activates Workflow**

When you activate a workflow:
```
1. Template workflow (ID: template-123) is cloned
2. New instance created: user-1 — Document Creator (ID: clone-456)
3. Workflow is ACTIVATED in n8n
4. Webhook becomes available at production URL
```

### **Step 2: User Clicks "Run Automation"**

Backend flow:
```javascript
// 1. Get user's cloned workflow ID
const instance = await UserWorkflowInstance.findByUserSource({
  userId: 1,
  sourceWorkflowId: 'template-123'
});
// instance.instance_workflow_id = 'clone-456'

// 2. Fetch actual workflow from n8n
const workflow = await n8n.getWorkflow('clone-456');

// 3. Analyze the CLONED workflow (not template!)
const analysis = WorkflowAnalyzer.analyzeWorkflow(workflow);

// 4. Extract webhook information
analysis.triggers = [
  {
    type: 'webhook',
    method: 'POST',
    path: 'create-document',  // ← From node.parameters.path
    url: 'https://n8n.exora.solutions/webhook/create-document',
    webhookMode: 'production'  // ← Because workflow.active = true
  }
]
```

### **Step 3: Execution Uses Detected URL**

```javascript
if (strategy.method === 'webhook' && strategy.trigger?.url) {
  // Uses the detected webhook URL from the CLONED workflow
  result = await executeViaWebhook(strategy.trigger.url, executionPayload);
}
```

---

## 🔐 **Production vs Test Webhooks**

n8n has **two types** of webhook URLs:

### **Production Webhook** (Active Workflows)
```
URL: https://n8n.exora.solutions/webhook/{path}
When: Workflow is ACTIVE (toggle is green)
Use: Real executions, production traffic
```

### **Test Webhook** (Inactive Workflows)
```
URL: https://n8n.exora.solutions/webhook-test/{path}
When: Workflow is INACTIVE (toggle is gray)
Use: Testing during workflow development
```

**Our System's Logic:**
```javascript
const webhookUrl = workflow.active 
  ? `${N8N_BASE_URL}/webhook/${path}`      // Production
  : `${N8N_BASE_URL}/webhook-test/${path}`; // Test
```

---

## 📍 **Where Webhook Path Comes From:**

### **In n8n Workflow JSON:**

```json
{
  "nodes": [
    {
      "id": "webhook-node-123",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "create-document",      // ← This is the webhook path!
        "httpMethod": "POST",
        "responseMode": "onReceived"
      }
    }
  ]
}
```

**Our Code Extracts:**
```javascript
const path = node.parameters?.path || node.id;
// → path = 'create-document'

const webhookUrl = `${N8N_BASE_URL}/webhook/${path}`;
// → webhookUrl = 'https://n8n.exora.solutions/webhook/create-document'
```

---

## 🔄 **Complete Flow Example:**

### **Scenario: User Runs Workflow with Webhook**

**1. Template Workflow in n8n:**
```
Name: "Create Document Template"
ID: SftL7umOE2ZN0EN9
Webhook: /webhook/create-doc-template
Status: INACTIVE (template)
```

**2. User Activates:**
```
→ Clones to: "user-1 — Create Document Template"
→ New ID: abc123xyz
→ Webhook: /webhook/create-doc-template (same path)
→ Status: ACTIVE
→ Production URL: https://n8n.exora.solutions/webhook/create-doc-template
```

**3. User Clicks "Run Automation":**
```javascript
// Backend fetches workflow abc123xyz
GET /api/v1/workflows/abc123xyz
→ Returns workflow JSON with webhook node

// WorkflowAnalyzer scans nodes
node.type = 'n8n-nodes-base.webhook'
node.parameters.path = 'create-doc-template'

// Constructs URL
webhookUrl = 'https://n8n.exora.solutions/webhook/create-doc-template'

// Returns to frontend
{
  triggers: [{
    type: 'webhook',
    url: 'https://n8n.exora.solutions/webhook/create-doc-template',
    method: 'POST'
  }]
}
```

**4. User Fills Form & Executes:**
```javascript
// WorkflowExecutor uses detected URL
POST https://n8n.exora.solutions/webhook/create-doc-template
Body: {
  user: { id: 1 },
  input: { documentTitle: "My Doc", folderId: "xyz" }
}

// Webhook triggers workflow in n8n
// Uses user's credentials
// Returns result
```

---

## 🎯 **Key Points:**

### ✅ **System ALWAYS Uses Cloned Workflow Data**

```javascript
// ❌ WRONG - Don't use template
const template = await n8n.getWorkflow('template-123');

// ✅ CORRECT - Use user's clone
const instance = await UserWorkflowInstance.findByUserSource(...);
const workflow = await n8n.getWorkflow(instance.instance_workflow_id);
```

### ✅ **Webhook Path is Preserved During Clone**

When you clone a workflow:
- n8n copies the webhook node's `path` parameter
- Same path = same webhook URL
- But it's now the USER's workflow executing

### ✅ **Active Status Determines URL Type**

```javascript
// User's workflow is ACTIVE → use production webhook
workflow.active = true
→ URL: /webhook/create-document

// User's workflow is INACTIVE → use test webhook
workflow.active = false  
→ URL: /webhook-test/create-document
```

---

## 🚨 **Important Considerations:**

### **1. Webhook Uniqueness**

If multiple users activate the same template:
- Template: `/webhook/create-doc`
- User 1 clone: `/webhook/create-doc` ⚠️
- User 2 clone: `/webhook/create-doc` ⚠️

**Problem:** Same path! Webhooks might conflict.

**Solution (Future):**
- Append user ID to webhook path during cloning
- Or use n8n's webhook ID system

### **2. Workflow Must Be Active**

```javascript
// Workflow active = true → Production webhook works ✅
// Workflow active = false → Production webhook fails ❌

if (!workflow.active) {
  return {
    error: 'Workflow must be active to execute via webhook'
  };
}
```

### **3. Alternative: Use n8n API Instead**

For workflows without webhooks:
```javascript
POST /api/v1/workflows/{workflowId}/execute
Body: { input data }

// n8n executes workflow programmatically
// Returns execution result
```

---

## 🛠️ **How to View Webhook URL:**

### **Option 1: From Frontend (Future Feature)**

In the execution modal, show:
```
🔗 Webhook URL: https://n8n.exora.solutions/webhook/create-document
📋 [Copy URL]
```

### **Option 2: From Backend Logs**

When user clicks "Run Automation":
```
Webhook detected: https://n8n.exora.solutions/webhook/create-document (production mode)
```

### **Option 3: Query n8n API**

```javascript
const webhooks = await n8n.getWorkflowWebhooks(workflowId);
console.log(webhooks);
// [{url: '...', method: 'POST', mode: 'production'}]
```

---

## 📊 **Execution Methods Comparison:**

| Method | When Used | URL Pattern | Pros | Cons |
|--------|-----------|-------------|------|------|
| **Webhook** | Workflow has webhook node | `/webhook/{path}` | Fast, real-time | Requires active workflow |
| **API** | No webhook node | `/api/v1/workflows/{id}/execute` | Works inactive too | Slower startup |
| **Auto-detect** | System chooses best | Varies | Best of both | More complex |

---

## ✅ **Current Implementation:**

Your system **automatically**:

1. ✅ Fetches the **cloned workflow** (not template)
2. ✅ Scans for webhook nodes
3. ✅ Extracts `path` from node parameters
4. ✅ Constructs correct URL based on active status
5. ✅ Uses production webhook for active workflows
6. ✅ Falls back to API execution if no webhook
7. ✅ Logs webhook URL to console
8. ✅ Returns webhook info to frontend

**No manual configuration needed!** The webhook URL is **discovered automatically** from the workflow's own configuration. 🎉

---

## 🧪 **Testing Webhook Detection:**

### **Test 1: Check What's Detected**

```bash
# Start your workflow execution
# Check backend logs:

Analyzed workflow clone-456:
  inputs: 2
  triggers: 1
  executionStrategy: webhook
  
Webhook detected: https://n8n.exora.solutions/webhook/create-document (production mode)
```

### **Test 2: Verify URL Works**

```bash
# Manual test
curl -X POST https://n8n.exora.solutions/webhook/create-document \
  -H "Content-Type: application/json" \
  -d '{"input": {"documentTitle": "Test"}}'
```

---

## 🎓 **Summary:**

**Q: How does the system know the webhook URL?**

**A: It reads it directly from the cloned workflow's configuration!**

```
User's Cloned Workflow in n8n
  ↓
  Contains webhook node with path parameter
  ↓
  WorkflowAnalyzer scans and extracts
  ↓
  Constructs: {N8N_URL}/webhook/{path}
  ↓
  Used for execution
```

**It's automatic, dynamic, and always uses the correct URL for each user's workflow!** ✨

