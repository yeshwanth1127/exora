# Exora CRM Integration - Complete Flow

## Overview
This document explains how the CRM module integrates with the main Exora platform, providing each user with their own CRM instance connected to their activated n8n workflow.

---

## 🏗️ Architecture

### Components
1. **Main Exora Platform** (exora-mern/client & server)
   - User dashboard
   - Workflow management
   - Authentication

2. **CRM Module** (exora-mern/exora-crm)
   - Frontend: React app (Vite)
   - Backend: Node.js/Express API
   - Database: PostgreSQL (shared with n8n)

3. **n8n Workflows**
   - Automation engine
   - Connects CRM to external services (WhatsApp, Telegram, Google Calendar, etc.)

---

## 🔄 Complete User Flow

### Step 1: User Adds CRM Workflow to Dashboard

**Method A: Via Alex Chat**
1. User asks Alex: "show workflows"
2. Alex displays available workflow templates
3. User clicks on "Exora CRM" workflow card
4. Workflow is added to dashboard (status: `inactive`)

**Method B: Via CRM Card in Dashboard**
1. User sees "AI-First CRM" card in "AI Automation Solutions" section
2. User clicks the card
3. CRM workflow is automatically added to dashboard (status: `inactive`)

**Code Flow:**
```javascript
// Frontend: DashboardAlex.jsx or BusinessDashboard.jsx
const response = await fetch(`${API_BASE_URL}/dashboard/workflows`, {
  method: 'POST',
  body: JSON.stringify({ 
    workflows: [{ ...crmWorkflowTemplate, isCRM: true }] 
  })
});

// Backend: controllers/dashboardController.js
await DashboardData.upsert(userId, {
  workflows: [...existing, { ...crmWorkflow, status: 'inactive' }]
});
```

---

### Step 2: User Activates CRM Workflow

**User clicks "Activate" button on the CRM workflow card**

**Activation Process (10 Steps):**

```
Step 1: Fetch required credentials
  → Detects: googleOAuth2Api (for Calendar, Gmail, etc.)

Step 2: Create activation session
  → Stores session in database with user_id and workflow_id

Step 3: Redirect to OAuth
  → User grants Google permissions
  → Redirects back to callback URL

Step 4: Exchange OAuth code for tokens
  → Gets access_token and refresh_token from Google

Step 5: Store OAuth tokens
  → Saves tokens to oauth_tokens table

Step 6: Create n8n credentials
  → Creates credential in n8n with user's tokens
  → Returns credential ID (e.g., "BhtEsDPOMGczKrib")

Step 7: Fetch template workflow
  → Gets "Exora CRM" workflow from n8n

Step 8: Clone workflow for user
  → Creates "user-1 — Exora CRM" workflow
  → Injects user's credential IDs into all nodes

Step 9: Create cloned workflow in n8n
  → Returns cloned workflow ID (e.g., "czOJsWpkAY4BlhRM")

Step 10: Activate cloned workflow
  → POST /api/v1/workflows/{id}/activate
  → Workflow is now running!

Step 11: Create database entries
  → user_workflow_instances: Links user to their workflow instance
  → crm_users: Creates CRM user record

Step 12: Update dashboard
  → Sets workflow status to 'active'
```

**Code Flow:**
```javascript
// Frontend: BusinessDashboard.jsx
onClick={() => toggleWorkflowStatus(workflowId, 'inactive')}

// Backend: routes/activation.js
router.post('/activate-workflow', async (req, res) => {
  // Steps 1-12 above
  const clonedWorkflowId = await cloneAndActivateWorkflow();
  
  await UserWorkflowInstance.upsert({
    userId,
    sourceWorkflowId: 'X2PlE5wehzaBCdSe', // Template ID
    instanceWorkflowId: clonedWorkflowId   // User's clone ID
  });
  
  await pool.query(
    'INSERT INTO crm_users (exora_user_id, n8n_workflow_id, status)',
    [userId, clonedWorkflowId, 'pending_setup']
  );
});
```

---

### Step 3: User Opens CRM

**Once workflow is active, user sees "🏢 Open CRM" button**

**Button Logic:**
```javascript
// Frontend: BusinessDashboard.jsx (Line 790-796)
{workflow.isCRM || workflow.name?.toLowerCase().includes('crm') ? (
  <button 
    className="workflow-crm-btn"
    onClick={() => handleOpenCRM()}
  >
    🏢 Open CRM
  </button>
) : (
  <button onClick={() => handleRunAutomation(workflow)}>
    ⚡ Execute
  </button>
)}
```

**What happens when clicked:**
```javascript
// Frontend: BusinessDashboard.jsx (Line 98-111)
const handleOpenCRM = () => {
  const token = localStorage.getItem('token'); // Exora JWT
  
  const CRM_URL = import.meta.env.VITE_CRM_URL || 
    (window.location.hostname === 'localhost' 
      ? 'http://localhost:3001' 
      : 'https://crm.exora.solutions');
  
  // Opens CRM in new tab with authentication
  window.open(`${CRM_URL}?token=${token}`, '_blank');
};
```

---

### Step 4: CRM Frontend Authenticates User

**URL:** `https://crm.exora.solutions?token=eyJhbGc...`

**CRM Frontend Flow:**
```javascript
// exora-crm/frontend/src/App.jsx (Line 29-48)
const initializeAuth = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token'); // Gets Exora JWT
  
  if (token) {
    // Validate token with CRM backend
    const userData = await validateToken(token);
    
    // Store token for future requests
    localStorage.setItem('crm_token', token);
    
    setUser(userData);
    setAuthenticated(true);
    
    // Check if user needs setup
    if (userData.status === 'pending_setup') {
      setNeedsSetup(true); // Shows setup wizard
    }
    
    // Clean URL (remove token from address bar)
    window.history.replaceState({}, '', window.location.pathname);
  }
};
```

**CRM Backend Validates Token:**
```javascript
// exora-crm/backend/middleware/auth.js (Line 8-55)
async function validateExoraToken(req, res, next) {
  const token = req.headers.authorization; // Bearer {token}
  
  // Verify JWT using same secret as Exora
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  const exoraUserId = decoded.id;
  const email = decoded.email;
  
  // Get CRM user from database
  const crmUser = await pool.query(
    'SELECT * FROM crm_users WHERE exora_user_id = $1',
    [exoraUserId]
  );
  
  req.user = {
    exora_user_id: exoraUserId,
    crm_user_id: crmUser.id,
    email: email,
    crm_user: crmUser
  };
  
  next();
}
```

---

### Step 5: User Completes CRM Setup (First Time Only)

**If `status === 'pending_setup'`, shows Setup Wizard:**

```javascript
// exora-crm/frontend/src/pages/Setup/SetupWizard.jsx
<SetupWizard>
  Step 1: Choose Industry (Healthcare, Real Estate, etc.)
  Step 2: Configure WhatsApp number
  Step 3: Configure admin phone/email
  Step 4: Add staff members (optional)
  Step 5: Complete!
</SetupWizard>

// On completion:
POST /api/setup/complete
{
  industry: "healthcare",
  admin_whatsapp: "+5511987654321",
  admin_email: "admin@clinic.com"
}

// Backend updates:
UPDATE crm_users 
SET status = 'active', 
    industry = 'healthcare',
    admin_whatsapp = '+5511987654321'
WHERE exora_user_id = 1;
```

---

### Step 6: User Uses CRM

**CRM Dashboard Loads:**
```
┌─────────────────────────────────────────────┐
│  Exora CRM                          [Menu]   │
├─────────────────────────────────────────────┤
│  📊 Dashboard                                │
│  📞 Contacts                                 │
│  📋 Pipeline                                 │
│  📅 Calendar                                 │
│  📧 Inbox (WhatsApp messages)                │
│  🤖 Automation History                       │
│  ⚙️ Settings                                 │
└─────────────────────────────────────────────┘
```

**All API requests include Exora token:**
```javascript
// exora-crm/frontend/src/services/api.js
const api = axios.create({
  baseURL: 'https://crm-api.exora.solutions',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('crm_token')}`
  }
});

// Example: Get contacts
const contacts = await api.get('/api/contacts');
// Backend validates token → returns data for this user only
```

---

## 🔗 How CRM Connects to User's n8n Workflow

### Database Schema

**Main Exora Database:**
```sql
-- Links Exora user to their workflow instance
user_workflow_instances
  - user_id: 1
  - source_workflow_id: 'X2PlE5wehzaBCdSe'  -- Template
  - instance_workflow_id: 'czOJsWpkAY4BlhRM' -- User's clone
  - status: 'active'
  - n8n_credential_ids: { "googleOAuth2Api": "BhtEsDPOMGczKrib" }
```

**CRM Database:**
```sql
-- CRM user settings
crm_users
  - id: 1
  - exora_user_id: 1  -- Links to Exora platform
  - n8n_workflow_id: 'czOJsWpkAY4BlhRM' -- Their workflow
  - status: 'active'
  - industry: 'healthcare'
  - admin_whatsapp: '+5511987654321'
  - telegram_chat_id: '123456789'

-- Contacts table
contacts
  - id: 'uuid-123'
  - crm_user_id: 1  -- Belongs to CRM user
  - name: 'João Silva'
  - whatsapp_number: '+5511999999999'
  - email: 'joao@email.com'

-- Events/Appointments
events
  - id: 'uuid-456'
  - crm_user_id: 1
  - contact_id: 'uuid-123'
  - title: 'Consultation'
  - start_time: '2025-10-16 10:00:00'
  - status: 'scheduled'

-- WhatsApp Messages
activities
  - id: 'uuid-789'
  - crm_user_id: 1
  - contact_id: 'uuid-123'
  - body: 'Hi, I want to schedule...'
  - channel: 'whatsapp'
  - direction: 'inbound'

-- Automation logs
automation_history
  - crm_user_id: 1
  - automation_type: 'event_created'
  - result: 'success'
  - details: { sent_whatsapp: true, created_calendar: true }
```

### Workflow Integration

**When user creates appointment in CRM:**
```javascript
// 1. CRM Frontend
POST /api/events
{
  contact_id: 'uuid-123',
  start_time: '2025-10-16T10:00:00',
  title: 'Consultation'
}

// 2. CRM Backend saves to DB
INSERT INTO events (crm_user_id, contact_id, start_time, title)
VALUES (1, 'uuid-123', '2025-10-16 10:00:00', 'Consultation');

// 3. CRM Backend triggers n8n webhook
POST https://n8n.exora.solutions/webhook/{user-workflow-webhook-id}
{
  event_id: 'uuid-456',
  contact_phone: '+5511999999999',
  contact_name: 'João Silva',
  start_time: '2025-10-16T10:00:00'
}

// 4. User's n8n workflow runs (their cloned workflow)
Workflow: "user-1 — Exora CRM"
  → Send WhatsApp confirmation to patient
  → Create Google Calendar event
  → Send Telegram notification to admin
  → Log to automation_history table
```

**When patient sends WhatsApp message:**
```javascript
// 1. Evolution API receives message
// 2. Evolution API sends to n8n webhook
POST https://n8n.exora.solutions/webhook/{whatsapp-webhook}
{
  from: '+5511999999999',
  body: 'I want to schedule an appointment'
}

// 3. User's n8n workflow runs
Workflow: "user-1 — Exora CRM"
  → Look up contact in database (using crm_user_id = 1)
  → Get conversation history
  → Call AI to generate response
  → Send WhatsApp reply
  → Store message in activities table

// 4. CRM Inbox shows the conversation in real-time
// (Frontend polls /api/activities or uses websockets)
```

---

## 🔐 Security & Isolation

### User Isolation
1. **Each user has their own cloned workflow**
   - User 1: `user-1 — Exora CRM` (workflow ID: abc123)
   - User 2: `user-2 — Exora CRM` (workflow ID: def456)

2. **Each workflow has unique credentials**
   - User 1 connects their Google account
   - User 2 connects their Google account
   - Credentials never shared between users

3. **Database isolation via `crm_user_id`**
   ```sql
   -- All queries filtered by user
   SELECT * FROM contacts WHERE crm_user_id = 1;
   SELECT * FROM events WHERE crm_user_id = 1;
   ```

4. **Token-based authentication**
   - Exora JWT contains `user_id`
   - CRM backend validates and extracts `user_id`
   - All operations scoped to that user

---

## 🎯 Summary

### Single User Journey:
```
1. User adds CRM workflow to dashboard
   ↓
2. User clicks "Activate"
   ↓
3. OAuth flow (grants Google permissions)
   ↓
4. n8n clones workflow + injects credentials
   ↓
5. Database records created (user_workflow_instances, crm_users)
   ↓
6. Dashboard shows "🏢 Open CRM" button
   ↓
7. User clicks → CRM opens with their token
   ↓
8. CRM validates token → shows their data
   ↓
9. User completes setup (first time only)
   ↓
10. User manages contacts, appointments, messages
   ↓
11. n8n workflow automates everything
   ↓
12. User sees automation history in CRM
```

### Key URLs:
- **Exora Dashboard**: `https://exora.solutions/dashboard`
- **CRM Frontend**: `https://crm.exora.solutions`
- **CRM Backend API**: `https://crm-api.exora.solutions`
- **n8n Instance**: `https://n8n.exora.solutions`

### Environment Variables:
```env
# Main Exora (.env)
N8N_BASE_URL=https://n8n.exora.solutions
N8N_API_KEY=your-n8n-api-key
JWT_SECRET=your-shared-secret

# CRM Frontend (.env)
VITE_CRM_API_URL=https://crm-api.exora.solutions
VITE_EXORA_URL=https://exora.solutions

# CRM Backend (.env)
JWT_SECRET=your-shared-secret  # MUST match Exora
N8N_BASE_URL=https://n8n.exora.solutions
DB_NAME=exora-crm
```

---

## ✅ Complete!

The integration is fully functional. Each user gets:
- ✅ Their own cloned n8n workflow with their credentials
- ✅ Their own CRM instance with isolated data
- ✅ Seamless authentication via Exora token
- ✅ Full automation powered by their n8n workflow
- ✅ Real-time sync between CRM and n8n via shared database


