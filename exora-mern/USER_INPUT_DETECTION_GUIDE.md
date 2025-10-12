# 📝 User Input Detection - Complete Guide

## What Fields Are Shown to Users?

---

## 🎯 **The Rule:**

**Any field referenced as `{{ $json.XXX }}` in your workflow becomes a user input field.**

---

## 📋 **Real Examples**

### **Example 1: Google Docs - Create Document**

**Your Workflow in n8n:**
```json
{
  "nodes": [{
    "type": "n8n-nodes-base.googleDocs",
    "parameters": {
      "operation": "create",
      "title": "={{ $json.documentTitle }}",     ← References $json.documentTitle
      "folderId": "1a2b3c4d5e"                   ← Hardcoded value
    }
  }]
}
```

**User Sees:**
```
┌──────────────────────────────────┐
│  Document Title *                │
│  [My Q4 Report____________]      │
│  💡 The title of the document    │
│     to create                    │
└──────────────────────────────────┘
      [⚡ Execute Workflow]
```

**What Gets Sent to n8n:**
```json
{
  "input": {
    "documentTitle": "My Q4 Report"
  }
}
```

**Workflow Executes:**
```javascript
title: "My Q4 Report"      // ← From user input
folderId: "1a2b3c4d5e"    // ← Hardcoded in workflow
```

---

### **Example 2: Google Sheets - Append Rows**

**Your Workflow:**
```json
{
  "type": "n8n-nodes-base.googleSheets",
  "parameters": {
    "spreadsheetId": "={{ $json.sheetId }}",
    "range": "Sheet1!A:Z",                     ← Hardcoded
    "values": "={{ $json.rowValues }}"
  }
}
```

**User Sees:**
```
┌──────────────────────────────────┐
│  Sheet Id *                      │
│  [abc123xyz_______________]      │
│  💡 Found in spreadsheet URL     │
│                                  │
│  Rows to Append *                │
│  ┌──────┬──────┬──────┬──────┐  │
│  │  #   │ Col1 │ Col2 │ Col3 │  │
│  ├──────┼──────┼──────┼──────┤  │
│  │  1   │[Name]│[Age_]│[City]│  │
│  │  2   │[John]│[ 30_]│[NYC_]│  │
│  └──────┴──────┴──────┴──────┘  │
│  [➕ Add Row] [➕ Add Column]    │
│                                  │
│  Preview: [["Name","Age","City"],│
│            ["John","30","NYC"]]  │
└──────────────────────────────────┘
      [⚡ Execute Workflow]
```

**What Gets Sent:**
```json
{
  "input": {
    "sheetId": "abc123xyz",
    "rowValues": [
      ["Name", "Age", "City"],
      ["John", "30", "NYC"]
    ]
  }
}
```

---

### **Example 3: Gmail - Send Email**

**Your Workflow:**
```json
{
  "type": "n8n-nodes-base.gmail",
  "parameters": {
    "toEmail": "={{ $json.recipientEmail }}",
    "subject": "={{ $json.emailSubject }}",
    "body": "={{ $json.emailBody }}"
  }
}
```

**User Sees:**
```
┌──────────────────────────────────┐
│  Recipient Email *               │
│  [john@example.com_______] 📧    │
│                                  │
│  Email Subject *                 │
│  [Meeting Tomorrow_______]       │
│                                  │
│  Email Body *                    │
│  ┌─────────────────────────────┐│
│  │Hi John,                     ││
│  │                             ││
│  │Let's meet tomorrow at 10am ││
│  └─────────────────────────────┘│
└──────────────────────────────────┘
      [⚡ Execute Workflow]
```

**What Gets Sent:**
```json
{
  "input": {
    "recipientEmail": "john@example.com",
    "emailSubject": "Meeting Tomorrow",
    "emailBody": "Hi John,\n\nLet's meet tomorrow at 10am"
  }
}
```

---

### **Example 4: Workflow with NO User Inputs**

**Your Workflow:**
```json
{
  "type": "n8n-nodes-base.googleDocs",
  "parameters": {
    "operation": "get",
    "documentId": "hardcoded-doc-id-123"     ← No expressions!
  }
}
```

**User Sees:**
```
┌──────────────────────────────────┐
│         ⚡                        │
│  This workflow doesn't require   │
│  any input parameters.           │
│                                  │
│  Just click "Execute" to run it! │
└──────────────────────────────────┘
      [⚡ Execute Workflow]
```

---

## 🔄 **Input Type Conversion**

### **Array Type** (Spreadsheet rows, lists)

**User Sees:** Spreadsheet-like grid
```
Row 1: [Product] [Quantity] [Price]
Row 2: [Widget ] [   5    ] [ 9.99]
```

**Converts To:**
```json
[
  ["Product", "Quantity", "Price"],
  ["Widget", "5", "9.99"]
]
```

### **Object Type** (Properties, fields)

**User Sees:** Key-value editor (future: simple form)
```
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Corp"
}
```

**Stays As:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Corp"
}
```

### **String Type** (Titles, names, IDs)

**User Sees:** Simple text input
```
Document Title
[My Report_____________]
```

**Converts To:**
```json
"My Report"
```

---

## 🎨 **Field Types & Their UI**

| Type | User Sees | Example | Converts To |
|------|-----------|---------|-------------|
| **string** | Text input | `[My Document___]` | `"My Document"` |
| **email** | Email input | `[john@example.com]` | `"john@example.com"` |
| **text** | Textarea | `[Multi-line text...]` | `"Multi-line text..."` |
| **number** | Number input | `[42]` | `42` |
| **array** | Grid/Table | See spreadsheet grid above | `[["A", "B"]]` |
| **object** | JSON editor | Key-value pairs | `{"key": "value"}` |
| **boolean** | Checkbox | `[✓] Enable feature` | `true` |
| **date** | Date picker | `[2025-10-12]` | `"2025-10-12"` |
| **url** | URL input | `[https://...]` | `"https://..."` |
| **file** | File upload | 📎 document.pdf | File object |

---

## 🧠 **Smart Detection Examples**

### **Field Name → Type Inference:**

```javascript
// Email detected
recipientEmail    → type: 'email'     → Shows email input
userEmail         → type: 'email'     → Shows email input

// Array detected  
sheetValues       → type: 'array'     → Shows grid builder
rowData           → type: 'array'     → Shows grid builder
items             → type: 'array'     → Shows grid builder

// Object detected
properties        → type: 'object'    → Shows JSON editor
fields            → type: 'object'    → Shows JSON editor

// Text detected
emailBody         → type: 'text'      → Shows textarea
messageContent    → type: 'text'      → Shows textarea

// Number detected
itemCount         → type: 'number'    → Shows number input
```

---

## ✅ **User-Friendly Features:**

1. ✅ **No JSON typing required** - Grid/table for arrays
2. ✅ **Type-appropriate inputs** - Email validation, number spinners
3. ✅ **Visual builders** - Add/remove rows and columns
4. ✅ **Real-time preview** - See JSON structure as you type
5. ✅ **Helpful hints** - Tooltips explain each field
6. ✅ **Validation** - Email format, required fields, JSON syntax
7. ✅ **Default values** - Pre-filled when available

---

## 🎯 **Complete Example: Sheets Workflow**

**Workflow:**
```json
{
  "nodes": [{
    "name": "Append to Sales Sheet",
    "type": "n8n-nodes-base.googleSheets",
    "parameters": {
      "operation": "append",
      "spreadsheetId": "={{ $json.sheetId }}",
      "values": "={{ $json.salesData }}"
    }
  }]
}
```

**Detection:**
```javascript
// Analyzer finds:
fields = [
  { field: 'sheetId', type: 'string', label: 'Sheet Id' },
  { field: 'salesData', type: 'array', label: 'Sales Data' }  // ← Inferred as array!
]
```

**User Interface:**
```
Sheet Id *
[1a2b3c4d5e6f7g8h___________________]
💡 Found in the spreadsheet URL

Sales Data *
┌────┬────────────┬──────────┬────────┬─────┐
│ #  │  Column 1  │ Column 2 │ Column 3 │    │
├────┼────────────┼──────────┼──────────┼─────┤
│ 1  │ [Date____] │ [Product] │ [Amount] │ 🗑️ │
│ 2  │ [10/12/25] │ [Widget_] │ [  299 ] │ 🗑️ │
│ 3  │ [10/13/25] │ [Gadget_] │ [  499 ] │ 🗑️ │
└────┴────────────┴──────────┴──────────┴─────┘
[➕ Add Row] [➕ Add Column]

Preview:
[
  ["Date", "Product", "Amount"],
  ["10/12/25", "Widget", "299"],
  ["10/13/25", "Gadget", "499"]
]

             [⚡ Execute Workflow]
```

**Backend Receives:**
```json
{
  "input": {
    "sheetId": "1a2b3c4d5e6f7g8h",
    "salesData": [
      ["Date", "Product", "Amount"],
      ["10/12/25", "Widget", "299"],
      ["10/13/25", "Gadget", "499"]
    ]
  }
}
```

**n8n Executes:**
```javascript
// Workflow replaces expressions:
spreadsheetId: "1a2b3c4d5e6f7g8h"  // From $json.sheetId
values: [                           // From $json.salesData
  ["Date", "Product", "Amount"],
  ["10/12/25", "Widget", "299"],
  ["10/13/25", "Gadget", "499"]
]

// Appends these rows to Google Sheet ✅
```

---

## 🚀 **Summary:**

### **What We Ask:**
✅ **Simple inputs only** - Text boxes, dropdowns, tables
✅ **User-friendly** - No JSON syntax required
✅ **Smart conversion** - System converts to n8n format
✅ **Visual builders** - Grid for arrays, forms for objects

### **What We DON'T Ask:**
❌ Raw JSON blobs
❌ Complex syntax
❌ Technical formats
❌ Hardcoded values (already in workflow)

---

## 💡 **The Magic:**

**User types in simple, human-readable format:**
- Product name: "Widget"
- Quantity: 5
- Price: 9.99

**System automatically converts to:**
```json
{
  "input": {
    "productName": "Widget",
    "quantity": 5,
    "price": 9.99
  }
}
```

**n8n receives properly formatted JSON and executes! 🎯**

---

**Your users will love how easy it is - no JSON knowledge required!** ✨


