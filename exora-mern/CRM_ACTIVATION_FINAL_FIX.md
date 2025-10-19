# ✅ CRM Activation Flow - Final Fix

## 🎯 **What Was Changed:**

### **1. Dashboard Filter** ✅
Workflows containing "user -" (with space) are now hidden from the dashboard.

### **2. CRM Activation Flow** ✅
Now uses the SAME flow as non-CRM workflows, but with CRM-specific logic:
- Google OAuth credentials ARE created in n8n
- Manual credentials (postgres, httpHeaderAuth) are SKIPPED
- After Google OAuth, goes straight to workflow cloning
- Redirects to CRM instead of main dashboard

---

## 📝 **Changes Made:**

### **File 1: `server/routes/workflows.js`**

**Lines 25-36: Enhanced Workflow Filter**
```javascript
const templateWorkflows = allWorkflows.filter(wf => {
  const name = wf.name || '';
  // Exclude workflows that:
  // - Start with "user-" (no space)
  // - Contain "user -" (with space) anywhere  ✅ NEW
  // - Contain " — " (cloned workflows)
  // - Start with "CRM Automation -" (cloned CRM workflows)  ✅ NEW
  return !name.match(/^user-\d+/i) && 
         !name.toLowerCase().includes('user -') &&  // ✅ NEW
         !name.includes(' — ') &&
         !name.startsWith('CRM Automation -');  // ✅ NEW
});
```

### **File 2: `server/routes/activation.js`**

**Change 1: Removed Early CRM Check (Line 472-473)**
```javascript
// OLD: Early check that skipped everything
// if (isCRM === true) { ... skip all credential creation ... }

// NEW: Let Google credentials be created, only check later
console.log(`\n[OAUTH CALLBACK] Full parsed state:`, JSON.stringify(parsed, null, 2));
console.log(`[OAUTH CALLBACK] isCRM: ${isCRM}, type: ${typeof isCRM}`);
```

**Change 2: Smart Remaining Provider Check (Lines 619-675)**
```javascript
if (remaining.length > 0) {
  console.log(`\n[NEW] Remaining providers: ${remaining.map(p => p.credentialType).join(', ')}`);
  
  // ⚡ CRM SPECIAL LOGIC: Skip manual credentials
  if (isCRM === true) {
    const remainingTypes = remaining.map(p => p.type);
    const allManual = remainingTypes.every(type => type === 'manual' || type === 'apikey');
    
    if (allManual) {
      console.log('[CRM] 🎯 All remaining providers are manual - skipping to workflow cloning');
      // Fall through to cloning (don't redirect)
    } else {
      // Still have OAuth remaining - redirect to wizard
      return res.send(...);
    }
  } else {
    // Non-CRM: Always redirect for remaining providers
    return res.send(...);
  }
}
```

**Change 3: CRM Workflow Preparation (Lines 690-761)**
```javascript
if (isCRM === true) {
  console.log('\n[CRM] 🎯 Preparing CRM-specific workflow clone...');
  
  // 1. Create CRM user record
  const crmUserResult = await crmPool.query(
    `INSERT INTO crm_users (exora_user_id, status) VALUES ($1, 'pending_setup')...`,
    [userId]
  );
  const crmUserId = crmUserResult.rows[0].id;
  
  // 2. Update webhook path to use CRM user ID
  const clonedNodes = templateWorkflow.nodes.map(node => {
    if (node.type === 'n8n-nodes-base.webhook') {
      return {
        ...node,
        parameters: {
          ...node.parameters,
          path: `${crmUserId}/automation`  // ✅ User-specific
        }
      };
    }
    return node;
  });
  
  // 3. Create workflow payload with ONLY Google credentials
  newWorkflowPayload = {
    name: `CRM Automation - ${userLabel}`,
    nodes: clonedNodes,
    connections: templateWorkflow.connections || {},
    settings: templateWorkflow.settings || {},
    staticData: templateWorkflow.staticData || null
  };
  
  // 4. Inject ONLY Google OAuth credentials (skip postgres, httpHeaderAuth)
  newWorkflowPayload.nodes = newWorkflowPayload.nodes.map(node => {
    if (node.credentials) {
      const updatedCredentials = {};
      Object.keys(node.credentials).forEach(credType => {
        // Only inject OAuth credentials
        if (finalCredMap[credType] && (credType.includes('OAuth') || credType.includes('google'))) {
          updatedCredentials[credType] = {
            id: finalCredMap[credType],
            name: `${userLabel}-${credType}`
          };
        }
      });
      if (Object.keys(updatedCredentials).length > 0) {
        node.credentials = updatedCredentials;
      }
    }
    return node;
  });
}
```

**Change 4: CRM-Specific Redirect (Lines 846-896)**
```javascript
if (isCRM === true) {
  console.log('\n[CRM] 🎯 Finalizing CRM activation...');
  
  // Update CRM database with workflow ID
  await crmPool.query(
    `UPDATE crm_users SET n8n_workflow_id = $1 WHERE exora_user_id = $2`,
    [clonedWorkflowId, userId]
  );
  
  // Generate JWT for CRM
  const crmToken = jwt.sign({ id: userId, email: ... }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
  // Determine CRM URL based on environment
  const isProduction = process.env.NODE_ENV === 'production';
  const CRM_FRONTEND_URL = isProduction 
    ? 'https://crm.exora.solutions'  // ✅ Production
    : (process.env.CRM_FRONTEND_URL || 'http://localhost:3001');  // Dev
  
  return res.send(`... Redirect to ${CRM_FRONTEND_URL}?token=${crmToken}&setup=true ...`);
}
```

---

## 🎯 **How It Works Now:**

### **CRM Activation Flow:**

```
1. User clicks "Activate" on CRM card
   ↓
2. Backend detects: Gmail, Calendar (OAuth), Postgres, httpHeaderAuth (manual)
   ↓
3. Creates unified OAuth URL with isCRM=true
   ↓
4. User authorizes Google
   ↓
5. OAuth callback receives credentials
   ↓
6. Creates Google credentials in n8n ✅
   ↓
7. Checks remaining providers: postgres, httpHeaderAuth
   ↓
8. CRM CHECK: All remaining are manual → Skip to cloning ✅
   ↓
9. Creates CRM user record, gets crm_user_id
   ↓
10. Updates webhook path: {crm_user_id}/automation
   ↓
11. Injects ONLY Google credentials (skips manual)
   ↓
12. Clones workflow in n8n ✅
   ↓
13. Activates workflow
   ↓
14. Updates CRM database with workflow ID
   ↓
15. Redirects to: https://crm.exora.solutions?token=xxx&setup=true ✅
```

### **Non-CRM Activation Flow:**

```
1. User clicks "Activate" on regular workflow
   ↓
2. Backend detects required credentials
   ↓
3. Creates OAuth URL(s)
   ↓
4. User authorizes (Google, etc.)
   ↓
5. Creates credentials in n8n
   ↓
6. Checks remaining providers
   ↓
7. If remaining → Redirects to wizard for manual setup
   ↓
8. Once all done → Clones workflow with ALL credentials
   ↓
9. Activates workflow
   ↓
10. Redirects to: https://exora.solutions/dashboard
```

---

## 🔧 **Commands to Run:**

```bash
# 1. SSH into VPS
ssh user@your-vps-ip

# 2. Ensure NODE_ENV is set
cd /path/to/exora/exora-mern/server
echo "NODE_ENV=production" >> .env

# 3. Restart backend
pm2 restart exora-backend

# 4. Watch logs
pm2 logs exora-backend --lines 50
```

---

## 🧪 **Test It:**

1. Go to: `https://exora.solutions/dashboard`
2. Click **"Activate"** on CRM card
3. Authorize Google when prompted

**Expected Logs:**
```
[OAUTH CALLBACK] isCRM: true, type: boolean
✓ Created credential user-1-gmailOAuth2-xxx with ID: xxx
✓ Created credential user-1-googleCalendarOAuth2Api-xxx with ID: xxx
[NEW] ✓ Created 2 credentials successfully
[NEW] Remaining providers: postgres, httpHeaderAuth
[CRM] 🎯 All remaining providers are manual - skipping to workflow cloning
[CRM] 🎯 Preparing CRM-specific workflow clone...
[CRM] ✓ CRM user ID: xxx
[CRM] ✓ Updating webhook path to: xxx/automation
[CRM] 🔑 Injecting Google OAuth credentials...
[CRM] ✓ Injected gmailOAuth2 into node Gmail
[CRM] ✓ Injected googleCalendarOAuth2Api into node Google Calendar
[CRM] ✓ CRM workflow payload ready
✓ Created cloned workflow with ID: xxx
✓ Activated workflow xxx
[CRM] ✓ Updated CRM user with workflow ID: xxx
[CRM] NODE_ENV: production, isProduction: true
[CRM] ✅ Redirecting to: https://crm.exora.solutions
```

**Expected Browser:**
- ✅ Sees: "CRM Activated Successfully!"
- ✅ Redirects to: `https://crm.exora.solutions?token=xxx&setup=true`
- ✅ Lands in CRM setup wizard

**Check n8n UI:**
- ✅ New workflow: "CRM Automation - user1"
- ✅ Google credentials attached
- ✅ Postgres/httpHeaderAuth nodes: NO credentials (will be configured later)
- ✅ Webhook path: `{crm_user_id}/automation`

---

## ✅ **What's Different from Before:**

| Before | After |
|--------|-------|
| ❌ No credentials created | ✅ Google credentials created |
| ❌ Workflow NOT cloned | ✅ Workflow cloned successfully |
| ❌ Redirected to wizard for manual setup | ✅ Skips manual setup, goes to CRM |
| ❌ User stuck in credential loop | ✅ Smooth one-flow activation |

---

## 🔒 **Security:**

- ✅ Google credentials created in n8n (needed for Email/Calendar nodes)
- ✅ Postgres/httpHeaderAuth NOT created (will be configured in CRM UI later)
- ✅ Each user gets unique workflow with unique webhook path
- ✅ Data isolation maintained by `crm_user_id` in database queries
- ✅ No user sees other users' workflows (filtered on dashboard)

---

## 📊 **Dashboard Filter:**

| Workflow Name | Visible on Dashboard? |
|---------------|-----------------------|
| `Exora CRM - Template` | ✅ Yes (template) |
| `WhatsApp Bot - Template` | ✅ Yes (template) |
| `user-1 — WhatsApp Bot` | ❌ No (user clone) |
| `user - 1 - Email Automation` | ❌ No (contains "user -") |
| `CRM Automation - user1` | ❌ No (CRM clone) |

---

## 🎯 **Summary:**

### **Dashboard:**
- ✅ Filters out "user -" workflows
- ✅ Filters out "CRM Automation -" workflows
- ✅ Only shows templates

### **CRM Activation:**
- ✅ Uses same flow as non-CRM
- ✅ Creates Google OAuth credentials
- ✅ Skips manual credentials after OAuth
- ✅ Clones workflow with Google creds only
- ✅ Redirects to CRM (production-aware)

### **Configuration:**
- ✅ Manual credentials configured in CRM UI later
- ✅ PostgreSQL uses shared production credential
- ✅ WhatsApp/Evolution API configured per user

---

**Ready to test! Just restart backend and try activating CRM.** 🚀

