# 🔧 CRM Redirect Fix

## ✅ **Problem:**
After Google OAuth, redirecting to `localhost:3001` instead of `https://crm.exora.solutions`.

## 🎯 **Root Cause:**
`NODE_ENV` might not be set to exactly `'production'`, causing production detection to fail.

## ✅ **Fix:**
**File:** `server/routes/activation.js` (Lines 869-882)

**Before:**
```javascript
const isProduction = process.env.NODE_ENV === 'production';
```

**After:**
```javascript
// More robust production detection
const isProduction = process.env.FRONTEND_URL?.includes('exora.solutions') || 
                    process.env.NODE_ENV === 'production';
```

**Why this works:**
- ✅ Checks if `FRONTEND_URL` contains `'exora.solutions'` (more reliable)
- ✅ Fallback to `NODE_ENV` check if needed
- ✅ Works even if `NODE_ENV` is not set

---

## 🚀 **Commands to Run:**

```bash
# SSH into VPS
ssh user@your-vps-ip

# Check current environment variables
cd /path/to/exora/exora-mern/server
cat .env | grep -E "NODE_ENV|FRONTEND_URL"

# Restart backend
pm2 restart exora-backend

# Watch logs for redirect info
pm2 logs exora-backend --lines 100
```

---

## 🧪 **Test It:**

1. Go to dashboard
2. Click "Activate" on CRM
3. Authorize Google

**Look for these logs:**
```
[CRM] 🔍 Detection:
[CRM]   - NODE_ENV: production (or undefined)
[CRM]   - FRONTEND_URL: https://exora.solutions
[CRM]   - isProduction: true
[CRM] ✅ Redirecting to: https://crm.exora.solutions
```

**Expected behavior:**
- ✅ Redirects to: `https://crm.exora.solutions?token=xxx&setup=true`
- ❌ NO redirect to `localhost:3001`

---

## 🔍 **If Still Getting localhost:**

### **Check 1: Verify FRONTEND_URL**

```bash
# On VPS
pm2 env 0 | grep FRONTEND_URL

# Should show:
# FRONTEND_URL: https://exora.solutions
```

**If empty or wrong:**
```bash
# Add to .env
echo "FRONTEND_URL=https://exora.solutions" >> .env
pm2 restart exora-backend
```

### **Check 2: Check Logs**

```bash
pm2 logs exora-backend | grep "CRM.*Detection" -A 4
```

**Should show:**
```
[CRM] 🔍 Detection:
[CRM]   - NODE_ENV: (whatever)
[CRM]   - FRONTEND_URL: https://exora.solutions
[CRM]   - isProduction: true
[CRM] ✅ Redirecting to: https://crm.exora.solutions
```

**If `isProduction: false`:**
- FRONTEND_URL is missing or wrong
- Fix it in .env

---

## 📋 **Environment Variables Required:**

```bash
# .env file should have:
FRONTEND_URL=https://exora.solutions
CRM_FRONTEND_URL=https://crm.exora.solutions  # Optional (only for override)
NODE_ENV=production  # Optional (fallback)
```

---

## 🎯 **Detection Logic:**

```javascript
isProduction = 
  FRONTEND_URL.includes('exora.solutions')  // Primary check ✅
  OR
  NODE_ENV === 'production'  // Fallback check
```

**If `isProduction = true`:**
```
CRM_FRONTEND_URL = 'https://crm.exora.solutions'
```

**If `isProduction = false`:**
```
CRM_FRONTEND_URL = process.env.CRM_FRONTEND_URL || 'http://localhost:3001'
```

---

## ✅ **Summary:**

- ✅ Production detection now checks `FRONTEND_URL` first
- ✅ More reliable than just `NODE_ENV`
- ✅ Added detailed logging to debug
- ✅ Works even if `NODE_ENV` is not set

**Just restart backend and test!** 🚀

