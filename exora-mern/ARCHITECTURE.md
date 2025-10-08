# 🏗️ System Architecture - n8n Automated Activation

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                            │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │          BusinessDashboard.jsx                              │    │
│  │  • Lists workflow templates                                 │    │
│  │  • "Activate" button triggers flow                          │    │
│  │  • Handles OAuth callback success/error                     │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ HTTP/HTTPS
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                        │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │            routes/activation.js                             │    │
│  │  • /workflow-required-creds (analyze workflow)              │    │
│  │  • /activate-workflow (build OAuth URL)                     │    │
│  │  • /oauth2/callback (handle OAuth, create creds)            │    │
│  └──────────────────────┬──────────────────────────────────────┘    │
│                         │                                            │
│  ┌──────────────────────▼─────────────────────────────────────┐    │
│  │       services/credentialMap.js                             │    │
│  │  Maps: credType → OAuth scopes                              │    │
│  │  {gmailOAuth2Api: [...scopes]}                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │       models/UserWorkflowInstance.js                         │   │
│  │  Persistence layer for workflow mappings                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
           │                          │                         │
           │                          │                         │
           ▼                          ▼                         ▼
┌──────────────────┐      ┌─────────────────────┐    ┌──────────────────┐
│  Google OAuth    │      │   n8n API           │    │  PostgreSQL DB   │
│  • Token exchange│      │   • Create creds    │    │  • user_workflow_│
│  • Consent screen│      │   • Clone workflow  │    │    instances     │
│  • Refresh tokens│      │   • Activate flow   │    │  • oauth_tokens  │
└──────────────────┘      └─────────────────────┘    └──────────────────┘
```

---

## 🔄 Data Flow Sequence

```
┌─────────┐                ┌─────────┐                ┌─────────┐
│         │                │         │                │         │
│ Browser │                │ Backend │                │   n8n   │
│         │                │         │                │         │
└────┬────┘                └────┬────┘                └────┬────┘
     │                          │                          │
     │ 1. Click "Activate"      │                          │
     ├─────────────────────────►│                          │
     │                          │                          │
     │                          │ 2. GET /workflows/:id    │
     │                          ├─────────────────────────►│
     │                          │                          │
     │                          │ 3. Workflow JSON         │
     │                          │◄─────────────────────────┤
     │                          │                          │
     │  4. Credential types +   │                          │
     │     OAuth URL            │                          │
     │◄─────────────────────────┤                          │
     │                          │                          │
     │ 5. Redirect to Google    │                          │
     ├──────────────────────────┼──────────────┐           │
     │                          │              │           │
     │                     ┌────▼────┐         │           │
     │                     │ Google  │         │           │
     │  6. Grant consent   │  OAuth  │         │           │
     ├────────────────────►│         │         │           │
     │                     └────┬────┘         │           │
     │  7. Redirect + code      │              │           │
     │◄─────────────────────────┘              │           │
     │                          │               │          │
     │ 8. GET /callback?code=...│               │          │
     ├─────────────────────────►│               │          │
     │                          │               │          │
     │                          │ 9. Exchange code for tokens
     │                          ├───────────────┘          │
     │                          │                          │
     │                          │ 10. POST /credentials    │
     │                          ├─────────────────────────►│
     │                          │     (gmailOAuth2Api)     │
     │                          │                          │
     │                          │ 11. Credential ID: 123   │
     │                          │◄─────────────────────────┤
     │                          │                          │
     │                          │ 12. POST /credentials    │
     │                          ├─────────────────────────►│
     │                          │  (googleDriveOAuth2Api)  │
     │                          │                          │
     │                          │ 13. Credential ID: 124   │
     │                          │◄─────────────────────────┤
     │                          │                          │
     │                          │ 14. POST /workflows      │
     │                          │   (cloned w/ cred IDs)   │
     │                          ├─────────────────────────►│
     │                          │                          │
     │                          │ 15. Workflow ID: 456     │
     │                          │◄─────────────────────────┤
     │                          │                          │
     │                          │ 16. PATCH /workflows/456 │
     │                          │     {active: true}       │
     │                          ├─────────────────────────►│
     │                          │                          │
     │                          │ 17. Success              │
     │                          │◄─────────────────────────┤
     │                          │                          │
     │       ┌──────────────────┤                          │
     │       │   PostgreSQL     │                          │
     │       │  18. Save mapping│                          │
     │       │◄─────────────────┤                          │
     │       │                  │                          │
     │       │  19. Saved       │                          │
     │       ├─────────────────►│                          │
     │       └──────────────────┤                          │
     │                          │                          │
     │ 20. Redirect to frontend │                          │
     │     ?success=true        │                          │
     │◄─────────────────────────┤                          │
     │                          │                          │
     │ 21. Show success message │                          │
     │                          │                          │
```

---

## 📦 Component Breakdown

### Frontend Layer

```
BusinessDashboard.jsx
├── State Management
│   ├── dashboardData (workflows list)
│   ├── loading (UI state)
│   └── error (error state)
│
├── Functions
│   ├── toggleWorkflowStatus()
│   │   ├── Check credentials via API
│   │   ├── Show confirmation dialog
│   │   └── Redirect to OAuth
│   │
│   └── useEffect() - OAuth callback handler
│       ├── Parse query params
│       ├── Show success/error
│       └── Refresh dashboard
│
└── UI Components
    ├── Workflow cards
    ├── "Activate" buttons
    └── Success/error modals
```

### Backend Layer

```
routes/activation.js
├── POST /workflow-required-creds
│   ├── Fetch workflow from n8n
│   ├── Extract credential types
│   ├── Look up scopes in credentialMap
│   └── Return credential requirements
│
├── POST /activate-workflow
│   ├── Validate userId + workflowId
│   ├── Compute union of scopes
│   ├── Build OAuth URL
│   └── Return authorization URL
│
└── GET /oauth2/callback
    ├── Validate code + state
    ├── Exchange code for tokens
    ├── Create credentials in n8n
    │   └── Loop: for each credential type
    │       ├── POST /api/v1/credentials
    │       └── Store credential ID
    ├── Clone workflow
    │   ├── Deep copy template
    │   ├── Inject credential IDs
    │   └── POST /api/v1/workflows
    ├── Activate workflow
    │   └── PATCH /api/v1/workflows/:id
    ├── Persist to database
    │   ├── user_workflow_instances
    │   └── oauth_tokens
    └── Redirect to frontend

services/credentialMap.js
└── Credential Type → Scopes Mapping
    ├── gmailOAuth2Api → [gmail.send, gmail.modify, ...]
    ├── googleDriveOAuth2Api → [drive.file, ...]
    └── googleCalendarOAuth2Api → [calendar, ...]
```

### Database Layer

```
PostgreSQL Tables

user_workflow_instances
├── id (PK)
├── user_id (FK)
├── source_workflow_id (template)
├── instance_workflow_id (clone)
├── n8n_credential_ids (JSONB)
│   └── {credType: credId, ...}
├── activated_at
└── services_used[]

oauth_tokens
├── id (PK)
├── user_id (FK)
├── provider (google)
├── access_token
├── refresh_token
├── expires_in
└── created_at
```

### External Services

```
Google OAuth 2.0
├── Authorization Endpoint
│   └── https://accounts.google.com/o/oauth2/v2/auth
│       ├── Query params
│       │   ├── client_id
│       │   ├── redirect_uri
│       │   ├── scope
│       │   └── state
│       └── Returns: authorization code
│
└── Token Endpoint
    └── https://oauth2.googleapis.com/token
        ├── Request: code + client_secret
        └── Response: access_token, refresh_token

n8n API
├── GET /api/v1/workflows/:id
│   └── Fetch template workflow JSON
│
├── POST /api/v1/credentials
│   ├── Request: {name, type, data: {...tokens}}
│   └── Response: {id, ...}
│
├── POST /api/v1/workflows
│   ├── Request: workflow JSON with credentials
│   └── Response: {id, ...}
│
└── PATCH /api/v1/workflows/:id
    ├── Request: {active: true}
    └── Response: {success}
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Security Layers                         │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: Transport                                         │
│  ✓ HTTPS/TLS for all communications                        │
│  ✓ Secure cookie flags (httpOnly, secure)                  │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Authentication                                    │
│  ✓ JWT token for user authentication                       │
│  ✓ OAuth state parameter validation                        │
│  ✓ n8n API key authentication                              │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: Authorization                                     │
│  ✓ User can only activate own workflows                    │
│  ✓ OAuth scopes limited to required permissions            │
├─────────────────────────────────────────────────────────────┤
│  Layer 4: Data Protection                                  │
│  ✓ Credentials stored in n8n (encrypted at rest)           │
│  ✓ Tokens never logged or exposed                          │
│  ✓ Refresh tokens for long-term access                     │
├─────────────────────────────────────────────────────────────┤
│  Layer 5: Input Validation                                 │
│  ✓ Validate all user inputs                                │
│  ✓ Sanitize workflow JSON before cloning                   │
│  ✓ Validate OAuth callback parameters                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Design Patterns Used

### 1. Factory Pattern
**Where:** `createN8nCredential()` function
**Why:** Standardized credential creation for different types

### 2. Strategy Pattern
**Where:** `credentialMap.js`
**Why:** Different OAuth scope strategies per credential type

### 3. Template Method Pattern
**Where:** Workflow cloning (`injectCredentialsIntoWorkflow`)
**Why:** Define skeleton, customize credential injection

### 4. Repository Pattern
**Where:** `UserWorkflowInstance` model
**Why:** Abstract database operations

### 5. Facade Pattern
**Where:** Activation routes
**Why:** Simplify complex OAuth + n8n interaction

---

## 📊 Error Handling Strategy

```
Frontend
   ├── Network errors → Show retry option
   ├── OAuth denied → Show explanation
   └── Unexpected → Log to console, show generic error

Backend
   ├── Validation errors → 400 with details
   ├── OAuth errors → Redirect with error param
   ├── n8n API errors → Log + redirect with error
   └── Database errors → 500, log stack trace

Graceful Degradation
   ├── If n8n_credential_ids column missing → Use fallback
   ├── If some credentials fail → Continue with others
   └── If activation fails → Clean up partial state
```

---

## 🔄 State Machine

```
Workflow Activation State Machine

                    ┌─────────────┐
                    │  INACTIVE   │
                    └──────┬──────┘
                           │
              User clicks "Activate"
                           │
                           ▼
                    ┌─────────────┐
              ┌─────┤  CHECKING   │
              │     └─────────────┘
              │            │
    No OAuth  │            │ OAuth required
    required  │            ▼
              │     ┌─────────────┐
              │     │  AWAITING_  │
              │     │   CONSENT   │
              │     └─────────────┘
              │            │
              │    User grants/denies
              │            │
              │            ▼
              │     ┌─────────────┐
              │     │  CREATING_  │
              │     │  CREDS      │
              │     └─────────────┘
              │            │
              │            │
              └────────────┼─────────┐
                           │         │
                           ▼         │
                    ┌─────────────┐  │
                    │  CLONING    │  │
                    └─────────────┘  │
                           │         │
                           ▼         │
                    ┌─────────────┐  │
                    │ ACTIVATING  │  │
                    └─────────────┘  │
                           │         │
                           ▼         │
                    ┌─────────────┐  │
                    │   ACTIVE    │  │
                    └─────────────┘  │
                                     │
                                     ▼
                              ┌─────────────┐
                              │   ERROR     │
                              └─────────────┘
```

---

## 📈 Scalability Considerations

### Current Capacity
- **Concurrent activations:** Limited by Node.js event loop
- **n8n API rate limit:** Unknown (check n8n docs)
- **Database connections:** PostgreSQL pool size

### Scaling Options

```
Horizontal Scaling
├── Load balancer
├── Multiple backend instances
└── Shared PostgreSQL + Redis session store

Vertical Scaling
├── Increase server resources
├── Optimize database queries
└── Cache template workflows

Queue-Based Processing
├── Bull/BullMQ for activation jobs
├── Redis for queue storage
└── Worker processes for parallel execution
```

---

## 🏁 Deployment Architecture

```
Production Environment

             ┌─────────────────┐
             │   CloudFlare    │ (CDN + DDoS)
             └────────┬────────┘
                      │
             ┌────────▼────────┐
             │   Nginx/LB      │ (Load Balancer)
             └────────┬────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
┌───────▼────────┐         ┌────────▼───────┐
│  Backend (1)   │         │  Backend (2)   │
│  PM2 cluster   │         │  PM2 cluster   │
└───────┬────────┘         └────────┬───────┘
        │                           │
        └─────────────┬─────────────┘
                      │
              ┌───────▼────────┐
              │  PostgreSQL    │ (Primary + Replica)
              └────────────────┘

External Services:
├── Google OAuth (managed)
├── n8n (self-hosted)
└── Sentry (error tracking)
```

---

This architecture is designed for **reliability, security, and scalability** while maintaining simplicity and clarity in code organization.

