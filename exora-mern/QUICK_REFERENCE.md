# 🚀 Quick Reference Card - n8n Activation System

## ⚡ Installation (2 Minutes)

```bash
# 1. Install dependency
cd server && npm install qs

# 2. Add to .env
cat >> .env << EOF
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_REDIRECT_URI=https://api.example.com/api/activation/oauth2/callback
N8N_BASE_URL=https://n8n.example.com
N8N_API_KEY=your-n8n-key
FRONTEND_URL=https://app.example.com
EOF

# 3. Run migration
psql -U user -d database -f migrations/add_n8n_credential_ids.sql

# 4. Start server
npm start
```

---

## 📡 API Endpoints

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/workflow-required-creds` | POST | `{workflowId}` | `{credentialTypes[], scopes[]}` |
| `/activate-workflow` | POST | `{userId, workflowId}` | `{authorizationUrl}` |
| `/oauth2/callback` | GET | Query params | Redirect to frontend |

---

## 🔄 Complete Flow (One Diagram)

```
User clicks "Activate"
    ↓
Check credentials → Show dialog → User confirms
    ↓
Build OAuth URL → Redirect to Google
    ↓
User grants → Google redirects back
    ↓
Exchange code → Get tokens
    ↓
Create n8n credentials (one per type)
    ↓
Clone workflow → Inject credential IDs
    ↓
Activate workflow → Save to database
    ↓
Redirect user → Show success ✅
```

---

## 🗂️ Key Files

| File | Purpose |
|------|---------|
| `server/services/credentialMap.js` | Map credential types → OAuth scopes |
| `server/routes/activation.js` | OAuth flow + credential creation |
| `client/src/pages/BusinessDashboard.jsx` | Frontend activation logic |
| `server/models/UserWorkflowInstance.js` | Database persistence |

---

## 🧪 Quick Test

```bash
# 1. Check workflow credentials
curl -X POST http://localhost:5000/api/activation/workflow-required-creds \
  -H "Content-Type: application/json" \
  -d '{"workflowId": "1"}'

# 2. Check n8n connection
curl -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_BASE_URL/api/v1/workflows"

# 3. Test from UI
# - Go to dashboard
# - Click "Activate"
# - Complete OAuth
# - Verify in n8n
```

---

## 🐛 Debug Checklist

**OAuth not working?**
- [ ] `GOOGLE_REDIRECT_URI` matches Google Console exactly
- [ ] `GOOGLE_CLIENT_SECRET` is correct
- [ ] URI uses HTTPS (required in production)

**Credential creation failing?**
- [ ] `N8N_API_KEY` has create permissions
- [ ] Credential type exists in `credentialMap.js`
- [ ] Credential type name matches n8n exactly

**Database errors?**
- [ ] Migration ran successfully
- [ ] `n8n_credential_ids` column exists

---

## 📊 Database Query

```sql
-- Check user's workflows
SELECT 
  user_id,
  source_workflow_id,
  instance_workflow_id,
  n8n_credential_ids,
  activated_at
FROM user_workflow_instances
WHERE user_id = 123
ORDER BY activated_at DESC;

-- Count activations
SELECT COUNT(*) FROM user_workflow_instances;
```

---

## 🔧 Adding New Credential Type

**Example: YouTube**

```javascript
// 1. Edit server/services/credentialMap.js
youtubeOAuth2Api: [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.upload'
]

// 2. Enable API in Google Console

// 3. Done! Test with YouTube workflow
```

---

## 📝 Server Logs

**Successful activation looks like:**

```
========== OAuth2 Callback Received ==========
Processing activation for user 123, workflow abc
✓ Fetched template workflow: My Workflow
✓ Created credential user-123-gmailOAuth2Api-xxx with ID: 10
✓ Created credential user-123-googleDriveOAuth2Api-xxx with ID: 11
✓ Created 2 credentials in n8n
✓ Created cloned workflow with ID: 456
✓ Activated workflow 456
✓ OAuth tokens stored
✓ Workflow mapping stored
========== Activation Complete ==========
```

---

## 🔐 Security Checklist

- [ ] HTTPS enabled in production
- [ ] `.env` not committed to git
- [ ] API keys rotated regularly
- [ ] OAuth state validated
- [ ] Tokens stored encrypted (in n8n)

---

## 📚 Full Documentation

- **Setup Guide:** `N8N_ACTIVATION_SETUP.md` (comprehensive)
- **Environment:** `ENV_SETUP.md`
- **Implementation:** `IMPLEMENTATION_SUMMARY.md`
- **This Card:** `QUICK_REFERENCE.md`

---

## 🆘 Common Errors

| Error | Fix |
|-------|-----|
| `Missing code or state` | Check redirect URI configuration |
| `Token exchange failed` | Verify client secret |
| `Column does not exist` | Run database migration |
| `Credential creation failed` | Check n8n API key permissions |
| `Invalid credential type` | Add to credentialMap.js |

---

## ✅ Pre-Deploy Checklist

```bash
# Test each component:
✓ npm install qs
✓ Environment variables set
✓ Database migration run
✓ Google OAuth configured
✓ n8n API key working
✓ End-to-end test passed
✓ HTTPS enabled
✓ Monitoring set up
```

---

## 📞 Getting Help

1. Check `N8N_ACTIVATION_SETUP.md` troubleshooting section
2. Review server logs for detailed errors
3. Test components individually with CURL
4. Verify n8n API with direct requests

---

**🎉 You're all set! Click "Activate" and watch the magic happen!**

