# 🚀 Ollama Deployment Guide

## ✅ What Was Changed

### **Core Architecture Change:**
- **Old:** Users select AI models (gpt-4, llama3, etc.) from CRM UI
- **New:** AI models are configured ONLY in n8n by admins/developers
- **Result:** Users see only business settings, technical AI config is hidden

---

## 📝 Changes Made

### **1. Backend - Industry Templates** ✅
**File:** `backend/config/industryTemplates.js`

**Changed:**
```javascript
// REMOVED ai_model from all industry default_configs
// Before:
whatsapp: { auto_reply: true, ai_model: 'llama3' }
ai_agent: { ..., ai_model: 'llama3.1' }

// After:
whatsapp: { auto_reply: true }  // No ai_model
ai_agent: { ... }  // No ai_model
```

**Affected Industries:**
- Healthcare
- Restaurant
- Salon
- Sales
- Consulting
- General

### **2. Database - User Config Schema** ✅
**File:** `database/update-dynamic-ai-models.sql`

**Changes:**
- Removed `ai_model` field from `automation_modules.config_schema`
- Updated WhatsApp, AI Agent, RAG Agent schemas
- Cleans existing user configs that have `ai_model`

**Result:**
- Users don't see "AI Model" dropdown in CRM
- Only business settings visible: instance names, prompts, etc.

### **3. Backend - Removed API Route** ✅
**Deleted:** `backend/routes/aiModels.js`
- No longer needed since users don't select models

### **4. n8n Workflow Configuration** ✅
**File:** `n8n/master-crm-automation-workflow-complete.json`

**AI Nodes Use Ollama:**
```json
{
  "url": "http://localhost:11434/api/chat",
  "authentication": "none",
  "body": {
    "model": "llama3",  // ← Admin configures this in n8n
    "messages": [...],
    "stream": false
  }
}
```

**Key Points:**
- Model is hardcoded in n8n workflow by admins
- Users trigger workflow, whatever model is configured gets used
- No user-facing model selection

---

## 🎯 How It Works Now

### **User Experience:**

1. **User goes to Automations page**
2. **Enables "WhatsApp" automation**
3. **Configures:**
   - ✅ Instance Name: `my-instance`
   - ✅ Auto Reply: Yes
   - ❌ AI Model: NOT SHOWN
4. **Sends test message**
5. **n8n workflow triggers:**
   - Uses `llama3` (or whatever model YOU configured in n8n)
   - User never sees or selects the model

### **Admin Configuration (You):**

1. **Open n8n workflow** (once, during setup)
2. **Edit "Call AI (Ollama)" node**
3. **Set model:**
   ```json
   {
     "model": "llama3"  // or llama3.1, mistral, etc.
   }
   ```
4. **Save workflow**
5. **All users** use that model automatically

---

## 🔧 Production VPS - Deployment Commands

### **Step 1: Install/Update Ollama Models**

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Pull recommended models
ollama pull llama3
ollama pull llama3.1
ollama pull mistral

# Optional: Advanced models
ollama pull mixtral
ollama pull phi3
ollama pull codellama

# Verify installed models
ollama list

# Test Ollama API
curl http://localhost:11434/api/tags
```

**Expected Output:**
```json
{
  "models": [
    {"name": "llama3:latest", ...},
    {"name": "mistral:latest", ...}
  ]
}
```

### **Step 2: Update CRM Database**

```bash
# Navigate to database folder
cd /path/to/exora/exora-mern/exora-crm/database

# Run migration
psql -U postgres -d exora-crm -f update-dynamic-ai-models.sql

# Verify changes
psql -U postgres -d exora-crm -c "
SELECT module_key, config_schema 
FROM automation_modules 
WHERE module_key IN ('whatsapp', 'ai_agent', 'rag_agent');
"
```

**Expected Output:**
- `whatsapp` config_schema should NOT have `ai_model` field
- `ai_agent` config_schema should NOT have `ai_model` field
- `rag_agent` config_schema should NOT have `ai_model` field

### **Step 3: Update n8n Master Workflow**

```bash
# Open n8n in browser
http://your-vps-ip:5679

# 1. Open workflow: "Exora CRM - Universal Automation Hub"
# 2. Find these nodes:
#    - "Call AI (Ollama)"
#    - "AI Agent Call (Ollama)" 
#    - "RAG AI Call (Ollama)"
# 3. For each node, update:
```

**Node Configuration:**
```
URL: http://localhost:11434/api/chat
Method: POST
Authentication: None

Body (JSON):
{
  "model": "llama3",
  "messages": [...],
  "stream": false,
  "options": {
    "temperature": 0.7,
    "num_predict": 500
  }
}
```

**4. Save workflow**  
**5. Activate workflow**

### **Step 4: Restart CRM Backend (if needed)**

```bash
# If using PM2
pm2 restart crm-backend

# Or if using systemd
sudo systemctl restart crm-backend

# Verify backend is running
curl http://localhost:3002/health
```

**Expected Output:**
```json
{
  "status": "healthy",
  "service": "exora-crm-api"
}
```

### **Step 5: Test from CRM**

1. **Open CRM:** `https://crm.exora.solutions`
2. **Go to Automations page**
3. **Enable WhatsApp automation:**
   - Instance Name: `test-instance`
   - Auto Reply: Yes
   - ✅ No "AI Model" field visible
4. **Save configuration**
5. **Send test WhatsApp message**
6. **Check response** - should use model configured in n8n

---

## 🧪 Verification Checklist

### **Database:**
- [ ] Migration executed successfully
- [ ] `automation_modules` table updated
- [ ] No `ai_model` in config schemas
- [ ] Existing user configs cleaned

### **n8n:**
- [ ] Workflow nodes use Ollama URL
- [ ] Models configured in n8n (llama3, etc.)
- [ ] Workflow saved and activated
- [ ] Test execution works

### **CRM Backend:**
- [ ] Backend restarted (if needed)
- [ ] Health check returns 200
- [ ] No errors in logs

### **CRM Frontend:**
- [ ] Automations page loads
- [ ] WhatsApp config form shows:
  - ✅ Instance Name
  - ✅ Auto Reply
  - ❌ AI Model (should NOT be visible)
- [ ] Can enable/save automation

### **End-to-End:**
- [ ] WhatsApp message triggers workflow
- [ ] AI response generated
- [ ] Response sent back to user
- [ ] Execution logged in CRM

---

## 📊 PostgreSQL Credentials (for n8n)

Since all services are on the same VPS:

```
Host: localhost
Port: 5432
Database: exora-crm
User: postgres
Password: [your-postgres-password]
SSL Mode: Disable
```

**Configure in n8n:**
1. Settings → Credentials
2. Add Credential → Postgres account
3. Name: `PostgreSQL - CRM Production`
4. Fill in above details
5. Test → Should succeed
6. Save

**Apply to all PostgreSQL nodes in workflow:**
- Get User Configs
- Find Contact
- Create Contact
- Store Inbound Message
- Get Conversation History
- Store Outbound Message
- Update Event with Google ID
- Log Execution

---

## 🎨 Ollama URL Configuration

### **If All Services on VPS (Not Docker):**
```
URL: http://localhost:11434/api/chat
```

### **If n8n in Docker, Ollama on VPS:**
```
URL: http://host.docker.internal:11434/api/chat
```

### **If Both in Docker (Same Network):**
```
URL: http://ollama:11434/api/chat
```

---

## 🔍 Troubleshooting

### **Problem: "Connection refused" to Ollama**

**Solution:**
```bash
# Check if Ollama is running
systemctl status ollama

# Start Ollama
sudo systemctl start ollama

# Enable auto-start
sudo systemctl enable ollama

# Test API
curl http://localhost:11434/api/tags
```

### **Problem: "Model not found"**

**Solution:**
```bash
# List installed models
ollama list

# Pull missing model
ollama pull llama3
```

### **Problem: Users still see "AI Model" field**

**Solution:**
```bash
# Re-run database migration
psql -U postgres -d exora-crm -f update-dynamic-ai-models.sql

# Clear browser cache
# Hard refresh CRM: Ctrl+Shift+R
```

### **Problem: AI not responding**

**Check:**
1. Ollama is running: `systemctl status ollama`
2. n8n workflow is active
3. Webhook URL is correct: `http://n8n-url/webhook/{crm_user_id}/automation`
4. Check n8n execution logs
5. Check CRM backend logs

---

## 📈 Performance

### **Recommended Models by Use Case:**

| Use Case | Model | Speed | Quality | RAM |
|----------|-------|-------|---------|-----|
| Fast responses | llama3 | Very Fast | Good | 4GB |
| Balanced | llama3.1 | Fast | Better | 5GB |
| Best quality | llama3.2 | Medium | Best | 6GB |
| Most capable | mixtral | Slow | Excellent | 8GB |
| Lightweight | phi3 | Fastest | Decent | 2GB |

**Your VPS:** Ensure at least 8GB RAM for mixtral, 4GB for llama3.

---

## 🎯 Key Benefits

### **Before (With User Model Selection):**
- ❌ Users confused by technical terms
- ❌ Might select wrong model for their use case
- ❌ Database stores redundant model info
- ❌ Need API to fetch/validate models

### **After (Admin-Only Configuration):**
- ✅ Clean, simple user interface
- ✅ You control quality (choose best model)
- ✅ Single source of truth: n8n workflow
- ✅ Less code, less complexity
- ✅ Users focus on business settings

---

## 📚 Related Documentation

- **n8n/OLLAMA_CONFIGURATION.md** - Detailed Ollama setup for n8n nodes
- **n8n/OLLAMA_MIGRATION_SUMMARY.md** - OpenAI to Ollama migration guide
- **n8n/master-crm-automation-workflow-complete.json** - Complete workflow with Ollama

---

## ✅ Summary

### **What Changed:**
1. Removed `ai_model` from all user-facing configs
2. AI model is now ONLY configured in n8n by admins
3. Users see simple business settings only
4. Database cleaned of model references

### **Commands to Run:**
```bash
# 1. Pull Ollama models
ollama pull llama3 llama3.1 mistral

# 2. Update database
psql -U postgres -d exora-crm -f database/update-dynamic-ai-models.sql

# 3. Configure n8n workflow nodes (manual in UI)
#    - Set URL: http://localhost:11434/api/chat
#    - Set model: llama3 (or your choice)

# 4. Restart backend (if needed)
pm2 restart crm-backend

# 5. Test from CRM UI
```

### **Result:**
- ✅ Cleaner architecture
- ✅ Simpler user experience
- ✅ Single source of truth for AI config
- ✅ No hardcoded models in user configs
- ✅ Admin has full control over AI quality

---

**You're ready to deploy!** 🚀

