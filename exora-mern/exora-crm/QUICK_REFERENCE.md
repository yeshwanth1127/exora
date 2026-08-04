# 🚀 Quick Reference - Universal Automation CRM

## ONE Workflow, Not Seven ✅

**Answer:** You create **ONE master workflow** in n8n that contains all 7 modules.

Each user gets **their own cloned copy** with a unique webhook URL.

---

## 🎯 How It Works (Simple Explanation)

### **The Setup:**

```
1 Master Workflow in n8n (Template)
    ↓ Clone
User A's Workflow (Webhook: /abc-123/automation)
    ↓ Clone
User B's Workflow (Webhook: /xyz-456/automation)
    ↓ Clone
User C's Workflow (Webhook: /qwe-789/automation)
```

### **The Magic:**

When a user enables/disables automations in the CRM UI:
- ✅ Changes saved to **database** (automation_configs table)
- ✅ n8n workflow **queries database** on every run
- ✅ Uses latest configs automatically
- ✅ **No n8n changes needed!**

---

## 📝 What You Need to Build in n8n

### **Import This File:**
`exora-crm/n8n/master-crm-automation-workflow-complete.json`

### **It Contains:**

```
20 Nodes Total:

Entry & Routing (5 nodes):
1. Webhook Entry
2. Validate Input  
3. Get User Configs (PostgreSQL)
4. Transform Configs
5. Module Router (Switch - 7 outputs)

WhatsApp Branch (7 nodes):
6. WhatsApp Handler (Code - check if enabled)
7. WhatsApp Enabled? (IF)
8. Find Contact (PostgreSQL)
9. Contact Exists? (IF)
10. Create Contact (PostgreSQL)
11. Store Inbound Message (PostgreSQL)
12. Get Conversation History (PostgreSQL)
13. Prepare AI Context (Code)
14. Auto Reply Enabled? (IF)
15. Call AI (HTTP - OpenAI/Ollama)
16. Extract AI Response (Code)
17. Store Outbound Message (PostgreSQL)
18. Send WhatsApp Reply (HTTP - Evolution API)

Other Modules (2 nodes each):
- AI Agent: Handler + Call AI
- RAG Agent: Handler + Query Vector DB + Call AI
- Email: Handler + Send Email
- SMS: Handler + Send SMS
- Calendar: Handler + Create Event + Update DB
- Chatbot: Handler + Respond

Final (3 nodes):
19. Merge All Results
20. Prepare Log Data
21. Log Execution (PostgreSQL)
```

---

## 🔄 Synchronization (No n8n Edits Needed)

### **User Changes AI Model in UI:**

```
10:00 AM - User: Changes WhatsApp AI model from gpt-4 to llama3
           ↓
           PUT /api/automations/whatsapp/config
           ↓
           UPDATE automation_configs 
           SET config_data = '{"ai_model":"llama3"}'

10:01 AM - WhatsApp message arrives
           ↓
           n8n workflow executes
           ↓
           Node "Get User Configs" queries database
           ↓
           Returns: {whatsapp: {ai_model: "llama3"}}
           ↓
           WhatsApp Handler uses llama3 ✅
```

**NO RESTART. NO REDEPLOY. INSTANT!**

---

## 🔐 Per-User Isolation

### **Critical Security:**

Each user gets:
- ✅ Their own workflow clone in n8n
- ✅ Unique webhook URL: `/webhook/{their-uuid}/automation`
- ✅ Database queries filtered by their crm_user_id
- ✅ Their own automation configs
- ✅ Their own execution logs

User A **CANNOT:**
- ❌ Trigger User B's workflow
- ❌ See User B's data
- ❌ Access User B's configs
- ❌ View User B's logs

---

## 📊 Database Tables (3 New)

### **automation_modules** (Static Catalog)
```
7 rows (WhatsApp, AI Agent, RAG, Email, SMS, Calendar, Chatbot)
- module_key, name, icon, description
- config_schema (defines UI form)
```

### **automation_configs** (User Selections)
```
Each user's enabled modules and their configs
- crm_user_id, module_key, enabled, config_data
- UNIQUE (crm_user_id, module_key)
```

### **automation_execution_logs** (Audit Trail)
```
Every automation run logged
- crm_user_id, module_key, status, execution_time_ms
```

---

## 🎨 User Experience

### **Setup:**
1. Activate CRM → Workflow cloned automatically
2. Complete setup → 3-4 automations auto-enabled (based on industry)

### **Daily Use:**
1. Go to `/automations` → See 7 modules
2. Enable desired modules → Click "Enable"
3. Configure each module → Click "Configure"
4. Use CRM normally → Automations run automatically

### **Never Needed:**
- ❌ Login to n8n
- ❌ Edit workflow in n8n
- ❌ Understand n8n
- ❌ Configure credentials in n8n (future: will be done via CRM UI)

---

## 🚀 Quick Start (30 Minutes)

### **1. Database (2 min)**
```bash
psql -U postgres -d exora-crm -f database/add-automation-tables.sql
```

### **2. Import to n8n (5 min)**
- Import `n8n/master-crm-automation-workflow-complete.json`
- Configure PostgreSQL credential
- Note workflow ID
- Add to .env: `CRM_MASTER_WORKFLOW_ID=...`

### **3. Restart Backend (1 min)**
```bash
pm2 restart exora-backend
pm2 restart exora-crm-backend
```

### **4. Test (10 min)**
- Activate CRM from dashboard
- Complete setup (select industry)
- Check `/automations` → See enabled modules
- Configure WhatsApp → Change AI model
- Verify n8n → See cloned workflow with your UUID

### **5. Test Automation (10 min)**
- Create event in CRM
- Check if Calendar automation triggered
- Check `/automation-history` for logs

---

## 📞 Common Questions

### **Q: Do I need 7 separate workflows in n8n?**
**A:** NO! Just ONE master workflow. Users get clones of it.

### **Q: How do user changes in UI affect n8n?**
**A:** Database is the source of truth. n8n queries database on every run.

### **Q: Can users see other users' automations?**
**A:** NO! Each user has isolated workflow instance and database filtering.

### **Q: What if I want to add a new automation type?**
**A:** Insert row in automation_modules table. That's it! UI updates automatically.

### **Q: Can users edit the n8n workflow?**
**A:** NO! Users have zero access to n8n. Everything through CRM UI.

### **Q: How do I update the automation logic?**
**A:** Update master template in n8n. Optionally re-clone for existing users.

---

## 🔧 Key Files

### **Most Important:**
- `n8n/master-crm-automation-workflow-complete.json` - The ONE workflow
- `backend/services/workflowInstanceService.js` - Per-user management
- `frontend/src/pages/Automations/Automations.jsx` - Marketplace UI
- `server/routes/activation.js` - Cloning logic

### **Supporting:**
- `backend/routes/automations.js` - Automation API
- `backend/routes/webhooks.js` - Triggering logic
- `database/add-automation-tables.sql` - Schema

---

## ⚡ TL;DR

1. ✅ **Import** master workflow to n8n (ONE time)
2. ✅ **Run** database migration (ONE time)
3. ✅ **Activate** CRM from dashboard (per user)
4. ✅ **Each user** gets cloned workflow automatically
5. ✅ **Configure** automations via CRM UI
6. ✅ **Automations** run with user's configs
7. ✅ **Change configs** anytime → Instant effect
8. ✅ **Complete** isolation between users

**That's it! 🎉**

