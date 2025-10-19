# 🔐 CRM Security & Redirect Fix

## 🔥 **Critical Issues Fixed:**

### **1. Security Issue: User Credentials Being Stored in n8n**
**Problem:** Google OAuth credentials were being created in n8n (visible to admins) even for CRM activations.

**Fix:**
- Added strict `isCRM === true` check at the very beginning of OAuth callback
- Added detailed logging to debug why credentials were being created
- CRM flow now completely skips credential creation

### **2. Redirect Issue: localhost instead of production URL**
**Problem:** After activation, redirecting to `http://localhost:3001` instead of `https://crm.exora.solutions`.

**Fix:**
- Added `NODE_ENV` check for production environment
- Production: Always uses `https://crm.exora.solutions`
- Development: Uses `process.env.CRM_FRONTEND_URL` or falls back to localhost

---

## ✅ **Changes Made:**

### **File: `server/routes/activation.js`**

**Change 1: Enhanced CRM Detection (Lines 472-478)**
```javascript
const { sessionId, userId, workflowId, credentialType, credentialTypes, provider, isCRM } = parsed;

console.log(`\n[OAUTH CALLBACK] Full parsed state:`, JSON.stringify(parsed, null, 2));
console.log(`[OAUTH CALLBACK] isCRM type: ${typeof isCRM}, value: ${isCRM}, strict check: ${isCRM === true}`);

// ⚠️ CRITICAL: CRM CHECK MUST BE FIRST - BEFORE ANY CREDENTIAL CREATION
if (isCRM === true) {
  // CRM flow - skip ALL credential creation
  ...
}
```

**Change 2: Production URL Detection (Lines 601-610)**
```javascript
// Determine CRM URL based on environment
const isProduction = process.env.NODE_ENV === 'production';
const CRM_FRONTEND_URL = isProduction 
  ? 'https://crm.exora.solutions'  // ✅ Production
  : (process.env.CRM_FRONTEND_URL || 'http://localhost:3001');  // Dev

console.log('[CRM] ✅ CRM activation complete! Redirecting to CRM...');
console.log(`[CRM] NODE_ENV: ${process.env.NODE_ENV}, isProduction: ${isProduction}`);
console.log(`[CRM] Redirect URL: ${CRM_FRONTEND_URL}`);
```

---

## 🚀 **Commands to Run:**

### **1. Set NODE_ENV to production**

Add to your `.env` file:
```bash
# SSH into VPS
ssh user@your-vps-ip

# Edit .env in exora-mern/server
cd /path/to/exora/exora-mern/server
nano .env

# Add this line:
NODE_ENV=production
```

### **2. Restart Backend**

```bash
pm2 restart exora-backend

# Or if using ecosystem file
pm2 restart all

# Check environment
pm2 env 0
```

### **3. Check Logs**

```bash
pm2 logs exora-backend --lines 50
```

---

## 🧪 **Test Again:**

1. Go to dashboard: `https://exora.solutions/dashboard`
2. Click **"Activate"** on CRM card
3. Authorize Google

**Expected Logs:**
```
[OAUTH CALLBACK] Full parsed state: {
  "sessionId": "xxx",
  "userId": 1,
  "workflowId": "X2PlE5wehzaBCdSe",
  "credentialTypes": ["gmailOAuth2", "googleCalendarOAuth2Api"],
  "provider": "google",
  "isCRM": true  ✅
}
[OAUTH CALLBACK] isCRM type: boolean, value: true, strict check: true
========== [CRM] SIMPLIFIED ACTIVATION FLOW ==========
[CRM] Skipping credential collection - user will configure manually later
[CRM] ✓ Cloned workflow ID: xxx
[CRM] NODE_ENV: production, isProduction: true
[CRM] Redirect URL: https://crm.exora.solutions
```

**Expected Behavior:**
- ✅ NO credentials created in n8n
- ✅ Redirects to: `https://crm.exora.solutions?token=xxx&setup=true`
- ✅ User lands in CRM setup wizard

---

## 🔍 **Debugging:**

### **If Credentials Are Still Being Created:**

Check the logs for:
```
[OAUTH CALLBACK] isCRM type: ???, value: ???, strict check: ???
```

**If you see:**
- `isCRM type: undefined` - The flag isn't being passed
- `isCRM type: string` - It's being passed as string "true" not boolean
- `strict check: false` - The check is failing

**If still seeing "Redirecting to frontend for next provider":**
- The CRM check isn't working
- The OAuth callback might be triggered twice
- Check for duplicate callback prevention

### **If Still Redirecting to localhost:**

Check:
```
[CRM] NODE_ENV: undefined, isProduction: false
[CRM] Redirect URL: http://localhost:3001
```

**Solution:**
1. Add `NODE_ENV=production` to `.env`
2. Restart: `pm2 restart exora-backend`
3. Verify: `pm2 env 0 | grep NODE_ENV`

---

## 📋 **Security Checklist:**

- [ ] `NODE_ENV=production` set in `.env`
- [ ] Backend restarted
- [ ] Test activation shows: `isCRM: true` (boolean)
- [ ] Logs show: `[CRM] SIMPLIFIED ACTIVATION FLOW`
- [ ] Logs show: `Redirect URL: https://crm.exora.solutions`
- [ ] NO logs showing: "Creating n8n credential"
- [ ] NO logs showing: "Remaining providers"
- [ ] Check n8n UI: NO new credentials for this user
- [ ] Browser redirects to: `https://crm.exora.solutions`

---

## ⚠️ **If Credentials Already Exist in n8n:**

### **Delete User's Credentials:**

1. Go to n8n: `https://n8n.exora.solutions`
2. Settings → Credentials
3. Search for: `user-1-gmailOAuth2` and `user-1-googleCalendarOAuth2Api`
4. Delete them
5. **Important:** These shouldn't exist for CRM users!

### **Why This Matters:**

- ✅ **CRM users configure credentials in CRM UI** (WhatsApp, etc.)
- ✅ **Shared credentials** (PostgreSQL, Ollama) are admin-configured once
- ❌ **User's personal OAuth credentials should NOT be in n8n**
- ❌ **Security risk:** Admins can see user's Google tokens

---

## 🎯 **Correct Architecture:**

### **CRM Flow:**
```
User clicks "Activate CRM"
   ↓
Google OAuth (for authorization only, NO credential storage)
   ↓
[Backend] Clones workflow (NO credentials attached)
   ↓
[Backend] Redirects to CRM: https://crm.exora.solutions
   ↓
User completes setup wizard
   ↓
User configures automations in CRM UI
   ↓
Credentials stored in CRM database (automation_configs table)
   ↓
n8n workflow uses CRM database to fetch user configs ✅
```

### **Non-CRM Flow (Regular Workflows):**
```
User clicks "Activate"
   ↓
Google OAuth
   ↓
[Backend] Creates credentials in n8n
   ↓
[Backend] Clones workflow with credential IDs
   ↓
[Backend] Redirects to dashboard
   ↓
Workflow uses n8n credentials ✅
```

---

## 🛡️ **Data Security:**

| Data Type | Stored Where | Accessible By |
|-----------|--------------|---------------|
| User's WhatsApp config | `automation_configs` (CRM DB) | Only that user |
| User's AI prompts | `automation_configs` (CRM DB) | Only that user |
| User's contacts | `contacts` (CRM DB) | Only that user |
| Shared PostgreSQL cred | n8n (admin-configured) | All workflows |
| Shared Ollama | Local service | All workflows |
| ❌ User's Google OAuth | Should NOT be in n8n | - |

---

## ✅ **Summary:**

1. **Security fixed:** User credentials no longer stored in n8n for CRM
2. **Redirect fixed:** Production uses `https://crm.exora.solutions`
3. **Logging added:** Can debug isCRM detection issues
4. **Environment check:** Detects production vs development

**Run:**
```bash
# Add NODE_ENV=production to .env
echo "NODE_ENV=production" >> /path/to/exora/exora-mern/server/.env

# Restart
pm2 restart exora-backend

# Test activation again
```

**Should now work correctly!** ✅

