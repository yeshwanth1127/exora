# CRM n8n Setup Instructions

## What You Need

The CRM needs a **template workflow** in your existing n8n instance at `n8n.exora.solutions`.

## Step 1: Create CRM Template Workflow in n8n

1. **Login to n8n**: https://n8n.exora.solutions

2. **Create a new workflow** with these nodes:

### Basic CRM Workflow Template:

```
Webhook (Contact Created)
    ↓
PostgreSQL (Save to contacts table)
    ↓
WhatsApp (Send welcome message)

Webhook (Event Created)  
    ↓
PostgreSQL (Save to events table)
    ↓
Google Calendar (Create event)
    ↓
WhatsApp (Send confirmation)
    ↓
Schedule (Day before reminder)
    ↓
WhatsApp (Send reminder)
```

3. **Name it**: `CRM Template` or `Exora CRM Base`

4. **Save the workflow**

5. **Get the workflow ID**:
   - Look at the URL: `https://n8n.exora.solutions/workflow/ABC123`
   - The ID is: `ABC123`

## Step 2: Configure Exora Backend

Add to `exora/exora-mern/server/.env`:

```env
# CRM Configuration
CRM_TEMPLATE_WORKFLOW_ID=ABC123
CRM_FRONTEND_URL=http://localhost:3001
```

Replace `ABC123` with your actual workflow ID from step 1.

## Step 3: Restart Exora Backend

```batch
cd exora\exora-mern\server
npm start
```

## How It Works

When a user activates CRM:

1. **Exora backend** clones the template workflow
2. **Renames it** to "CRM - User {userId}"
3. **Updates credentials** with user's Google OAuth tokens
4. **Activates** the workflow
5. **Creates** `crm_users` record in exora-crm database
6. **Redirects** user to CRM frontend

## For Testing (Skip n8n for now)

If you want to test the CRM interface WITHOUT setting up the workflow yet, I can create a bypass route that just creates the CRM user record without cloning workflows.

Would you like me to create that?

## CRM Database Connection

The PostgreSQL node in n8n should connect to:

```
Host: your-postgres-host
Port: 5432
Database: exora-crm
User: postgres
Password: your-password
```

## Webhook URLs

Webhooks will be at:
- Contact Created: `https://n8n.exora.solutions/webhook/crm-contact-created`
- Event Created: `https://n8n.exora.solutions/webhook/crm-event-created`
- Event Updated: `https://n8n.exora.solutions/webhook/crm-event-updated`

The CRM backend will trigger these webhooks.


