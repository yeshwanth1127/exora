# Exora CRM - Complete Deployment Checklist

## 📦 Phase 1: Database Setup

- [ ] PostgreSQL server is running
- [ ] Run `exora-crm/database/setup-crm-db-CLEAN.bat`
- [ ] Verify tables created: `psql -U postgres -d exora-crm -c "\dt"`
- [ ] Test connection from both main Exora and CRM backends

## 🔧 Phase 2: CRM Backend Setup

- [ ] Copy `backend/env.template.production` to `backend/.env`
- [ ] Fill in all environment variables:
  - [ ] `JWT_SECRET` (MUST match main Exora server)
  - [ ] `DATABASE_URL` (PostgreSQL connection string)
  - [ ] `N8N_BASE_URL=https://n8n.exora.solutions`
  - [ ] `N8N_API_KEY` (get from n8n)
  - [ ] `CORS_ORIGINS=https://exora.solutions,https://crm.exora.solutions`
  - [ ] `EVOLUTION_API_URL` and `EVOLUTION_API_KEY`
  - [ ] `OPENAI_API_KEY` (for AI agents)
- [ ] Run `npm install` in `backend/`
- [ ] Test: `node backend/server.js`
- [ ] Should see: "✅ Exora CRM Backend running..."
- [ ] Set up PM2: `pm2 start backend/server.js --name exora-crm-backend`

## 🎨 Phase 3: CRM Frontend Setup

- [ ] Copy `frontend/env.template.production` to `frontend/.env.production`
- [ ] Set production URLs:
  - [ ] `VITE_API_URL=https://crm-api.exora.solutions/api`
  - [ ] `VITE_EXORA_URL=https://exora.solutions`
  - [ ] `VITE_CRM_URL=https://crm.exora.solutions`
- [ ] Run `npm install` in `frontend/`
- [ ] Build: `npm run build`
- [ ] Deploy `frontend/dist/` to `/var/www/exora-crm-frontend/`
- [ ] Or use PM2 with serve: `pm2 start "serve -s dist -l 3001" --name exora-crm-frontend`

## 🌐 Phase 4: Main Exora Backend Integration

Update `exora/exora-mern/server/.env`:

- [ ] Add CRM configuration:
```bash
# CRM Frontend URL
CRM_FRONTEND_URL=https://crm.exora.solutions

# CRM Database Connection
CRM_DB_HOST=localhost
CRM_DB_PORT=5432
CRM_DB_NAME=exora-crm
CRM_DB_USER=postgres
CRM_DB_PASSWORD=your_password

# n8n (if not already set)
N8N_BASE_URL=https://n8n.exora.solutions
N8N_API_KEY=your_n8n_api_key
```

- [ ] Restart main Exora backend: `pm2 restart exora-backend`
- [ ] Verify CRM DB connection in logs

## 🎯 Phase 5: Main Exora Frontend Integration

- [ ] Copy `client/env.template` to `client/.env.production`
- [ ] Set production URLs:
```bash
VITE_API_URL=https://exora.solutions/api
VITE_CRM_URL=https://crm.exora.solutions
VITE_ENV=production
```
- [ ] Rebuild main Exora frontend: `npm run build`
- [ ] Deploy to production

## 📡 Phase 6: n8n Workflow Setup

- [ ] Login to https://n8n.exora.solutions
- [ ] Go to **Workflows** → **Import from File**
- [ ] Upload: `exora-crm/n8n/crm-workflow-production.json`
- [ ] Rename workflow to: **"Exora CRM - Universal Business Assistant"**
- [ ] Configure credentials in workflow:
  - [ ] Evolution API credentials
  - [ ] Google Calendar MCP
  - [ ] Gmail MCP
  - [ ] Telegram Bot Token
  - [ ] OpenAI API Key
  - [ ] PostgreSQL (for chat memory)
- [ ] Save workflow
- [ ] Click **Active** to enable
- [ ] Note the workflow ID (will be auto-assigned to new CRM users)

## 🌍 Phase 7: DNS Configuration

Add DNS records:

- [ ] `crm.exora.solutions` → A record → `your_server_ip`
- [ ] `crm-api.exora.solutions` → A record → `your_server_ip`
- [ ] Wait for DNS propagation (5-30 minutes)
- [ ] Verify: `nslookup crm.exora.solutions`

## 🔒 Phase 8: Nginx Configuration

### CRM Frontend (crm.exora.solutions)

- [ ] Create: `/etc/nginx/sites-available/crm.exora.solutions`
- [ ] Copy configuration from `PRODUCTION_SETUP.md`
- [ ] Create symlink: `ln -s /etc/nginx/sites-available/crm.exora.solutions /etc/nginx/sites-enabled/`
- [ ] Test: `sudo nginx -t`

### CRM Backend (crm-api.exora.solutions)

- [ ] Create: `/etc/nginx/sites-available/crm-api.exora.solutions`
- [ ] Copy configuration from `PRODUCTION_SETUP.md`
- [ ] Create symlink: `ln -s /etc/nginx/sites-available/crm-api.exora.solutions /etc/nginx/sites-enabled/`
- [ ] Test: `sudo nginx -t`

### Reload Nginx

- [ ] `sudo systemctl reload nginx`

## 🔐 Phase 9: SSL Certificates

- [ ] Install certbot if not already: `sudo apt install certbot python3-certbot-nginx`
- [ ] Get certificate for CRM frontend:
```bash
sudo certbot --nginx -d crm.exora.solutions
```
- [ ] Get certificate for CRM backend:
```bash
sudo certbot --nginx -d crm-api.exora.solutions
```
- [ ] Verify auto-renewal: `sudo certbot renew --dry-run`

## ✅ Phase 10: Testing & Verification

### Backend Health Check
- [ ] `curl https://crm-api.exora.solutions/health`
- [ ] Should return: `{"status":"healthy","service":"exora-crm-api"}`

### Frontend Access
- [ ] Open https://crm.exora.solutions
- [ ] Should show "Loading CRM..." or redirect to auth

### Full Integration Test
1. [ ] Login to https://exora.solutions
2. [ ] Navigate to Business Dashboard
3. [ ] Click on **CRM** product card
4. [ ] CRM workflow should be added to dashboard
5. [ ] Click **Activate** on CRM workflow
6. [ ] Should redirect to https://crm.exora.solutions with token
7. [ ] Should show Setup Wizard
8. [ ] Complete setup (select industry, configure channels)
9. [ ] Should see CRM Dashboard
10. [ ] Try creating a contact manually
11. [ ] Check if contact appears in database:
```sql
psql -U postgres -d exora-crm -c "SELECT * FROM contacts;"
```

### n8n Workflow Test
- [ ] Go to https://n8n.exora.solutions
- [ ] Open "Exora CRM" workflow
- [ ] Send a test WhatsApp message (if Evolution API configured)
- [ ] Check workflow execution logs
- [ ] Verify data appears in CRM

## 📊 Phase 11: Monitoring Setup

- [ ] PM2 monitoring: `pm2 monit`
- [ ] Set up PM2 logs: `pm2 logs exora-crm-backend --lines 100`
- [ ] Monitor Nginx logs:
```bash
sudo tail -f /var/log/nginx/access.log | grep crm
sudo tail -f /var/log/nginx/error.log | grep crm
```
- [ ] Set up database monitoring:
```sql
-- Active connections to CRM database
SELECT * FROM pg_stat_activity WHERE datname='exora-crm';
```

## 🔄 Phase 12: Backup & Recovery

- [ ] Set up database backup cron:
```bash
# Daily backup at 2 AM
0 2 * * * pg_dump -U postgres exora-crm > /backups/exora-crm-$(date +\%Y\%m\%d).sql
```
- [ ] Test database restore:
```bash
psql -U postgres exora-crm < /backups/exora-crm-backup.sql
```
- [ ] Back up .env files (securely!)

## 🚨 Phase 13: Security Hardening

- [ ] Firewall rules:
```bash
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 80/tcp   # HTTP (for Let's Encrypt)
sudo ufw enable
```
- [ ] Disable PostgreSQL remote access (if not needed)
- [ ] Rotate API keys every 90 days
- [ ] Set up fail2ban for Nginx
- [ ] Enable rate limiting in Nginx
- [ ] Review CORS origins (no wildcards in production!)
- [ ] Enable security headers in Nginx:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

## 📱 Phase 14: WhatsApp/Telegram Integration

### Evolution API Setup
- [ ] Evolution API is running at https://evolution.exora.solutions
- [ ] Create instance: `exora-crm`
- [ ] Get instance credentials
- [ ] Update CRM backend .env with credentials
- [ ] Test webhook: Send test message

### Telegram Bot Setup
- [ ] Create bot with @BotFather
- [ ] Get bot token
- [ ] Update CRM backend .env
- [ ] Set webhook (if needed)

## 📅 Phase 15: Google Calendar Integration

- [ ] MCP Server is running and accessible
- [ ] Google OAuth configured
- [ ] Test calendar access via n8n workflow
- [ ] Verify events can be created/updated

## 🎉 Phase 16: Go Live!

- [ ] All checklist items above completed
- [ ] Test with real user account
- [ ] Monitor logs for first 24 hours
- [ ] Have rollback plan ready
- [ ] Communicate to users (if needed)

---

## 🆘 Rollback Plan

If something goes wrong:

1. **Stop CRM services**:
```bash
pm2 stop exora-crm-backend
pm2 stop exora-crm-frontend
```

2. **Revert Nginx configs**:
```bash
sudo rm /etc/nginx/sites-enabled/crm.exora.solutions
sudo rm /etc/nginx/sites-enabled/crm-api.exora.solutions
sudo systemctl reload nginx
```

3. **Restore database backup** (if needed):
```bash
psql -U postgres -c "DROP DATABASE exora_crm;"
psql -U postgres -c "CREATE DATABASE exora_crm;"
psql -U postgres exora_crm < /backups/last-good-backup.sql
```

4. **Revert main Exora changes**:
   - Remove CRM-related env vars
   - Rebuild frontend without CRM references
   - Restart main Exora backend

---

## 📞 Support Contacts

- **Database Issues**: Check PostgreSQL logs
- **API Errors**: `pm2 logs exora-crm-backend`
- **Frontend Issues**: Check browser console + Nginx logs
- **n8n Workflow Errors**: Check n8n execution logs

---

**Deployment Date**: ______________  
**Deployed By**: ______________  
**Version**: 1.0.0  
**Status**: ⬜ Planned | ⬜ In Progress | ⬜ Completed | ⬜ Rolled Back

