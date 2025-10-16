# Exora CRM - Quick Start Guide

## Prerequisites

- PostgreSQL running (shared with Exora)
- Node.js 18+ installed
- Python 3.11+ installed
- Docker (optional, for easier deployment)

## Step 1: Database Setup (2 minutes)

Create a NEW database `exora-crm` in your existing PostgreSQL server:

**Windows:**
```batch
cd exora-crm\database
setup-crm-db.bat
```

**Mac/Linux:**
```bash
cd exora-crm/database
chmod +x setup-crm-db.sh
./setup-crm-db.sh
```

**Manual:**
```bash
# Create database
psql -U postgres -c "CREATE DATABASE \"exora-crm\";"

# Run schema
psql -U postgres -d exora-crm -f schema.sql

# Verify
psql -U postgres -d exora-crm -c "\dt"
```

You should see 7 tables: `crm_users`, `contacts`, `events`, `activities`, `opportunities`, `staff_members`, `automation_history`

## Step 2: Backend Setup (5 minutes)

```bash
cd exora-crm/backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your settings:
# 1. DATABASE_URL: postgresql://postgres:YOUR_PASSWORD@localhost:5432/exora-crm
# 2. JWT_SECRET: MUST match the JWT_SECRET from exora/exora-mern/server/.env
# 3. Other settings as needed

# Start backend
uvicorn app.main:app --reload --port 8000
```

Backend should be running at http://localhost:8000

**IMPORTANT:** Make sure `JWT_SECRET` in CRM .env matches Exora's JWT_SECRET exactly!

## Step 3: Frontend Setup (5 minutes)

```bash
cd exora-crm/frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000/api" > .env.local

# Start frontend
npm run dev
```

Frontend should be running at http://localhost:3001

## Step 4: Add CRM Routes to Exora Backend (2 minutes)

The CRM route has already been added to `exora/exora-mern/server/routes/crm.js`

Ensure it's loaded in `server.js` (already done):
```javascript
app.use('/api/crm', require('./routes/crm'));
```

Add environment variables to Exora's `.env`:
```env
# CRM Configuration
CRM_N8N_BASE_URL=http://localhost:5679
CRM_N8N_API_KEY=your-n8n-api-key
CRM_TEMPLATE_WORKFLOW_ID=your-workflow-id
CRM_FRONTEND_URL=http://localhost:3001
```

Restart Exora server:
```bash
cd exora/exora-mern/server
npm start
```

## Step 5: Test the Integration (5 minutes)

1. **Open Exora Dashboard**: http://localhost:3000
2. **Login** with your account
3. **Click on CRM card** (you should see it in the products section)
4. **Activate CRM** - will redirect to Google OAuth
5. **Complete OAuth** - will redirect to CRM setup wizard
6. **Complete setup** - select industry, enter business info
7. **You're in!** - CRM dashboard should load

## Step 6: Set Up n8n (Optional for now)

You can test the CRM without n8n first. To add full automation:

1. Install n8n (Docker):
```bash
docker run -d --name n8n-crm \
  -p 5679:5678 \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=admin \
  n8nio/n8n
```

2. Access n8n: http://localhost:5679
3. Import workflow from `exora-crm/n8n/crm-workflow-template.json`
4. Configure credentials
5. Activate workflow

## Testing the Flow

### Test 1: Create Contact Manually
1. Open CRM at http://localhost:3001
2. Go to "Contacts" (or "Patients" if healthcare)
3. Click "Add Contact"
4. Fill form and submit
5. Contact should appear in list

### Test 2: Create Appointment
1. Go to "Calendar" 
2. Click "New Event"
3. Fill appointment details
4. Submit
5. Event should be created
6. Check PostgreSQL: `SELECT * FROM events ORDER BY created_at DESC LIMIT 1;`

### Test 3: View Automation History
1. Go to "Automation History"
2. Should see all automated actions
3. Filter by type, date range

## Troubleshooting

### Backend won't start
- Check DATABASE_URL is correct
- Make sure PostgreSQL is running
- Verify all .env variables are set

### Frontend won't connect to backend
- Check VITE_API_URL in .env.local
- Verify backend is running on port 8000
- Check browser console for CORS errors

### CRM card doesn't appear in Exora dashboard
- Make sure `crm.js` route is added to server.js
- Restart Exora backend
- Clear browser cache
- Check browser console for errors

### Can't activate CRM
- Verify CRM_TEMPLATE_WORKFLOW_ID is set
- Check n8n is accessible
- Look at Exora backend logs for errors

## Next Steps

Once everything is working:

1. **Set up n8n workflows** for full automation
2. **Configure WhatsApp** (Evolution API)
3. **Set up Telegram bot**
4. **Configure Ollama** for AI responses
5. **Test end-to-end** flow

## Development Mode

Run all services in development mode:

```bash
# Terminal 1: Exora Backend
cd exora/exora-mern/server
npm start

# Terminal 2: Exora Frontend
cd exora/exora-mern/client
npm run dev

# Terminal 3: CRM Backend
cd exora-crm/backend
source venv/bin/activate
uvicorn app.main:app --reload

# Terminal 4: CRM Frontend
cd exora-crm/frontend
npm run dev
```

All services should be running and connected!

## Production Deployment

See `exora-crm/docs/DEPLOYMENT.md` for production setup instructions.

