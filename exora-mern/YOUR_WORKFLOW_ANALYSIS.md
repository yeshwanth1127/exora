# 📊 Your Specific Workflow - What User Will See

## Your Workflow Nodes:

1. **Webhook** (Trigger)
2. **Google Docs** - "Create a document" 
3. **Google Drive** - "Create file from text"

---

## 🔍 **Analysis Process:**

### **Node 1: Webhook**
```json
{
  "name": "Webhook",
  "type": "n8n-nodes-base.webhook",
  "parameters": {
    "path": "0f03a9a9-aad0-479d-b811-467dc7286757"
  }
}
```

**Detection:**
- ✅ Is webhook node → Detects trigger
- ✅ Path: `0f03a9a9-aad0-479d-b811-467dc7286757`
- ✅ Webhook URL: `https://n8n.exora.solutions/webhook/0f03a9a9-aad0-479d-b811-467dc7286757`
- ❌ No user inputs needed (webhook just triggers)

---

### **Node 2: Google Docs - "Create a document"**
```json
{
  "name": "Create a document",
  "type": "n8n-nodes-base.googleDocs",
  "parameters": {}  // ← Empty!
}
```

**Detection:**
- ❌ No `{{ $json.xxx }}` expressions found
- ✅ Node name contains "Create" → Inferred operation: `create`
- ✅ Lookup registry: `googleDocs` → operation `create`
- ✅ Registry defines required fields: **title**, **content**, **folderId**
- ✅ **Adds these fields to form!**

**Fields Added:**
```javascript
[
  { field: 'title', type: 'string', label: 'Document Title', required: true },
  { field: 'content', type: 'text', label: 'Document Content', required: false },
  { field: 'folderId', type: 'string', label: 'Folder ID (Optional)', required: false }
]
```

---

### **Node 3: Google Drive - "Create file from text"**
```json
{
  "name": "Create file from text",
  "type": "n8n-nodes-base.googleDrive",
  "parameters": {
    "operation": "createFromText",
    "driveId": {"value": "My Drive"},     // ← Hardcoded
    "folderId": {"value": "root"}         // ← Hardcoded
  }
}
```

**Detection:**
- ❌ No `{{ $json.xxx }}` expressions
- ✅ Has operation: `createFromText`
- ✅ Lookup registry: `googleDrive` → operation `createFromText`
- ✅ Registry defines: **name**, **text**, **folderId**
- ✅ **Adds these fields to form!**

**Fields Added:**
```javascript
[
  { field: 'name', type: 'string', label: 'File Name', required: true },
  { field: 'text', type: 'text', label: 'File Content', required: true },
  { field: 'folderId', type: 'string', label: 'Folder ID', required: false }
]
```

---

## 👤 **What User Will See:**

### **Execution Modal Opens:**

```
┌─────────────────────────────────────────────┐
│ ⚡ Run Automation                            │
│ user-1 — [Your Workflow Name]              │
├─────────────────────────────────────────────┤
│                                             │
│ Fill in the required information to run    │
│ this automation:                            │
│                                             │
│ ━━━━ Create a document ━━━━                │
│                                             │
│ Document Title *                            │
│ [_________________________________]         │
│ 💡 The title of the document to create     │
│                                             │
│ Document Content                            │
│ ┌─────────────────────────────────────┐    │
│ │ Enter document content...           │    │
│ │                                     │    │
│ │                                     │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ Folder ID (Optional)                        │
│ [_________________________________]         │
│ 💡 Leave empty for root folder             │
│                                             │
│ ━━━━ Create file from text ━━━━            │
│                                             │
│ File Name *                                 │
│ [_________________________________]         │
│ 📄 document.txt                             │
│                                             │
│ File Content *                              │
│ ┌─────────────────────────────────────┐    │
│ │ Enter file content...               │    │
│ │                                     │    │
│ │                                     │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ Folder ID                                   │
│ [_________________________________]         │
│ 💡 Leave empty for root folder             │
│                                             │
│                                             │
│     [⚡ Execute Workflow]  [Cancel]         │
│                                             │
│ * Required fields                           │
└─────────────────────────────────────────────┘
```

---

## **User Fills In:**

```
Document Title:     "Q4 Sales Report"
Document Content:   "This is the quarterly sales analysis..."
Folder ID:          "1a2b3c4d5e" (or leave empty)

File Name:          "sales-report.txt"
File Content:       "Sales data: 
                     Q1: $100k
                     Q2: $150k..."
Folder ID:          (leave empty)
```

---

## **System Sends to n8n Webhook:**

```json
POST https://n8n.exora.solutions/webhook/0f03a9a9-aad0-479d-b811-467dc7286757

{
  "user": { "id": 1 },
  "context": {
    "runId": "uuid-here",
    "timestamp": "2025-10-12T10:00:00Z"
  },
  "input": {
    "title": "Q4 Sales Report",
    "content": "This is the quarterly sales analysis...",
    "folderId": "1a2b3c4d5e",
    "name": "sales-report.txt",
    "text": "Sales data:\nQ1: $100k\nQ2: $150k..."
  }
}
```

---

## **How n8n Processes:**

Since your nodes have **empty or hardcoded parameters**, n8n will use:

**Google Docs node:**
- Uses default behavior (creates empty doc) OR
- Ignores the input data since no expressions map to it

**Google Drive node:**
- Uses hardcoded `driveId` and `folderId`
- Creates file but might not use the input text

---

## 🚨 **The Real Issue:**

Your workflow nodes **don't have expressions**, so even though users provide input, **n8n won't use it!**

You need to update your workflow in n8n:

### **Google Docs Node - Should Be:**
```json
{
  "parameters": {
    "operation": "create",
    "title": "={{ $json.title }}",           ← ADD THIS
    "content": "={{ $json.content }}",       ← ADD THIS  
    "folderId": "={{ $json.folderId }}"      ← ADD THIS
  }
}
```

### **Google Drive Node - Should Be:**
```json
{
  "parameters": {
    "operation": "createFromText",
    "name": "={{ $json.name }}",             ← ADD THIS
    "text": "={{ $json.text }}",             ← ADD THIS
    "folderId": "={{ $json.folderId || 'root' }}"  ← ADD THIS (with default)
  }
}
```

---

## ✅ **After Fixing Workflow:**

**User will see the SAME form** (because our system adds registry fields)

**BUT now n8n will actually USE the input data!**

---

## 🎯 **Summary:**

**What User Sees Now:**
- ✅ Form with all fields from both nodes
- ✅ Title, content, folder ID for Google Docs
- ✅ File name, file content, folder ID for Google Drive

**Problem:**
- ❌ Workflow nodes don't have expressions
- ❌ n8n won't map the input data to node parameters
- ❌ Creates empty documents

**Solution:**
- ✅ Add `{{ $json.fieldName }}` expressions to your workflow nodes in n8n
- ✅ Then user inputs will actually be used!

---

**Your system is smart - it shows the right fields! But the n8n workflow needs expressions to actually USE those inputs.** 🎯
