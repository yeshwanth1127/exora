# Exora CRM - Production Deployment Guide

## 🚀 Production URLs

- **Main Exora**: https://exora.solutions
- **CRM Frontend**: https://crm.exora.solutions
- **CRM Backend**: https://crm-api.exora.solutions
- **n8n**: https://n8n.exora.solutions
- **Evolution API**: https://evolution.exora.solutions

---

## 📋 Pre-Deployment Checklist

### 1. Database Setup
```bash
# Connect to PostgreSQL server
psql -U postgres -h localhost

# Run database setup script
cd database
.\setup-crm-db-CLEAN.bat
```

### 2. Backend Configuration
```bash
cd backend

# Copy production template
cp env.template.production .env

# Edit .env with production values
nano .env
```

**Required Environment Variables:**
- `NODE_ENV=production`
- `JWT_SECRET` (MUST match main Exora backend)
- `DATABASE_URL` (PostgreSQL connection)
- `N8N_BASE_URL=https://n8n.exora.solutions`
- `N8N_API_KEY` (from n8n)
- `CORS_ORIGINS=https://exora.solutions,https://crm.exora.solutions`

### 3. Frontend Configuration
```bash
cd frontend

# Create production .env
cat > .env.production << EOF
VITE_API_URL=https://crm-api.exora.solutions/api
VITE_EXORA_URL=https://exora.solutions
VITE_CRM_URL=https://crm.exora.solutions
VITE_ENV=production
EOF
```

### 4. Main Exora Backend Configuration

Add to `exora/exora-mern/server/.env`:
```bash
# CRM Configuration
CRM_FRONTEND_URL=https://crm.exora.solutions
CRM_N8N_BASE_URL=https://n8n.exora.solutions

# CRM Database (separate from main exora-web)
CRM_DB_HOST=localhost
CRM_DB_PORT=5432
CRM_DB_NAME=exora-crm
CRM_DB_USER=postgres
CRM_DB_PASSWORD=your_password
```

---

## 🔧 Build Process

### Backend Build
```bash
cd backend

# Install dependencies
npm install --production

# Test connection
node server.js
# Should see: "✅ Exora CRM Backend running on https://crm-api.exora.solutions"
```

### Frontend Build
```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Output will be in: frontend/dist/
```

---

## 🌐 DNS Configuration

Add these DNS records to your domain:

```
Type    Name        Value                           TTL
A       crm         your_server_ip                  300
A       crm-api     your_server_ip                  300
```

---

## 🔒 Nginx Configuration

### CRM Frontend (https://crm.exora.solutions)
```nginx
server {
    listen 443 ssl http2;
    server_name crm.exora.solutions;

    ssl_certificate /etc/letsencrypt/live/exora.solutions/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/exora.solutions/privkey.pem;

    root /var/www/exora-crm-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

### CRM Backend (https://crm-api.exora.solutions)
```nginx
server {
    listen 443 ssl http2;
    server_name crm-api.exora.solutions;

    ssl_certificate /etc/letsencrypt/live/exora.solutions/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/exora.solutions/privkey.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Reload Nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔄 Process Management (PM2)

### Backend Process
```bash
cd backend

# Start with PM2
pm2 start server.js --name exora-crm-backend

# Save PM2 configuration
pm2 save

# Enable startup script
pm2 startup
```

### Frontend (Serve with Nginx or PM2)
If using PM2 with serve:
```bash
npm install -g serve
cd frontend
pm2 start "serve -s dist -l 3001" --name exora-crm-frontend
```

---

## 📡 n8n Workflow Setup

### 1. Import Workflow
1. Login to https://n8n.exora.solutions
2. Go to **Workflows** → **Import**
3. Upload: `n8n/crm-workflow-production.json`
4. Rename to: **"Exora CRM - Universal Business Assistant"**

### 2. Configure Credentials
Update these nodes in the workflow:
- **Evolution API**: Set Evolution API credentials
- **Google Calendar MCP**: Configure Google Calendar access
- **Gmail MCP**: Configure Gmail access
- **Telegram**: Set bot token
- **OpenAI**: Set API key

### 3. Activate Workflow
- Click **Active** toggle
- Test webhook: `https://n8n.exora.solutions/webhook/crm-webhook-test`

---

## ✅ Verification Checklist

### Backend Health
```bash
curl https://crm-api.exora.solutions/health
# Should return: {"status":"healthy","service":"exora-crm-api"}
```

### Frontend Access
```bash
curl https://crm.exora.solutions
# Should return HTML content
```

### Database Connection
```bash
# From backend directory
node -e "const {testConnection} = require('./config/db'); testConnection();"
```

### Full Flow Test
1. Login to https://exora.solutions
2. Go to Dashboard
3. Click on **CRM** card
4. Should add CRM workflow to dashboard
5. Click **Activate**
6. Should redirect to https://crm.exora.solutions with token
7. Should show Setup Wizard

---

## 🔐 Security Checklist

- [ ] JWT_SECRET is strong and matches main Exora
- [ ] Database passwords are strong
- [ ] CORS origins are properly configured
- [ ] SSL certificates are valid
- [ ] Firewall rules allow only necessary ports
- [ ] Database is not exposed to public internet
- [ ] API keys are stored in .env (not committed)
- [ ] PM2 is running as non-root user
- [ ] Nginx security headers are configured

---

## 📊 Monitoring

### View Logs
```bash
# Backend logs
pm2 logs exora-crm-backend

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Check Status
```bash
# PM2 processes
pm2 status

# Nginx status
sudo systemctl status nginx

# Database connections
psql -U postgres -c "SELECT * FROM pg_stat_activity WHERE datname='exora-crm';"
```

---

## 🆘 Troubleshooting

### Issue: CRM frontend shows auth error
**Solution**: Check if JWT_SECRET matches between main Exora and CRM backend

### Issue: Cannot connect to n8n
**Solution**: Verify N8N_BASE_URL and N8N_API_KEY in backend .env

### Issue: Database connection failed
**Solution**: Check DATABASE_URL format and PostgreSQL service status

### Issue: CORS errors
**Solution**: Ensure CORS_ORIGINS includes both exora.solutions and crm.exora.solutions

---

## 📞 Support

For issues:
1. Check logs: `pm2 logs exora-crm-backend`
2. Verify environment variables
3. Test database connection
4. Check Nginx configuration
5. Review n8n workflow status

---

**Last Updated**: October 2025  
**Version**: 1.0.0

