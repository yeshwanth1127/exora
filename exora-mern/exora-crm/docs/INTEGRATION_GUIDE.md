# Exora CRM Integration Guide

## How Everything Connects

This document explains how n8n, CRM backend, WhatsApp, Telegram, and Google Calendar all work together.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│              User Interface (React Frontend)                 │
│  - View contacts, events, messages                          │
│  - Create appointments manually                             │
│  - See automation history                                   │
└─────────────────────────────────────────────────────────────┘
                         ↓ HTTP API calls
┌─────────────────────────────────────────────────────────────┐
│              CRM Backend (FastAPI)                           │
│  - CRUD operations                                          │
│  - Triggers n8n webhooks                                    │
│  - Validates auth (JWT from Exora)                          │
└─────────────────────────────────────────────────────────────┘
         ↓                         ↓                   ↓
    PostgreSQL              n8n Webhooks        Notification Service
    (Shared DB)            (Automation)          (Email/Telegram)
         ↑                         ↓                   
         │                    ┌────────────────────────────┐
         │                    │   n8n Workflows            │
         │                    │  ┌──────────────────────┐ │
         │                    │  │ WhatsApp Messages    │ │
         │                    │  │ ↓ Store in DB        │ │
         │                    │  │ ↓ AI Response        │ │
         │                    │  │ ↓ Send Reply         │ │
         │                    │  └──────────────────────┘ │
         │                    │  ┌──────────────────────┐ │
         │                    │  │ Daily Reminders      │ │
         │                    │  │ ↓ Query DB           │ │
         │                    │  │ ↓ Send WhatsApp      │ │
         │                    │  │ ↓ Notify Admin       │ │
         │                    │  └──────────────────────┘ │
         │                    │  ┌──────────────────────┐ │
         │                    │  │ Event Created        │ │
         │                    │  │ ↓ Google Calendar    │ │
         │                    │  │ ↓ Send Confirmation  │ │
         │                    │  │ ↓ Notify All         │ │
         │                    │  └──────────────────────┘ │
         └────────────────────┴────────────────────────────┘
                                   ↓ ↓ ↓
              ┌────────────────────────────────────────┐
              │  External Services                      │
              │  - Evolution API (WhatsApp)            │
              │  - Google Calendar (MCP)               │
              │  - Telegram Bot API                     │
              │  - Ollama (AI)                         │
              └────────────────────────────────────────┘
```

## Data Flow Examples

### Flow 1: Patient Sends WhatsApp Message

```
1. Patient → WhatsApp: "I need to reschedule"
   ↓
2. Evolution API → Webhook → n8n: POST /webhook/whatsapp-incoming
   Data: { phone: "5511987654321", message: "I need to reschedule", name: "João" }
   ↓
3. n8n → PostgreSQL: SELECT * FROM contacts WHERE whatsapp_number = '5511987654321'
   - If found: use existing contact_id
   - If not found: INSERT new contact
   ↓
4. n8n → PostgreSQL: INSERT INTO activities (message, direction=inbound)
   Stores: "Patient João said: I need to reschedule"
   ↓
5. n8n → PostgreSQL: SELECT last 10 messages for context
   ↓
6. n8n → Ollama AI: Generate response with context
   AI: "I can help you reschedule. What day and time works better?"
   ↓
7. n8n → PostgreSQL: INSERT INTO activities (AI response, direction=outbound)
   ↓
8. n8n → Evolution API: Send WhatsApp reply
   ↓
9. n8n → PostgreSQL: INSERT INTO automation_history
   Logs: "AI response sent successfully"
   ↓
10. Patient receives reply on WhatsApp
11. CRM dashboard shows the conversation in real-time
```

### Flow 2: Doctor Creates Appointment in CRM UI

```
1. Doctor opens CRM → Clicks "New Appointment"
   Form: Patient=João, Date=Tomorrow 10am, Service=Consultation
   ↓
2. React Frontend → CRM Backend: POST /api/events
   {
     "contact_id": "uuid-123",
     "title": "Consultation - João Silva",
     "start_time": "2025-10-16T10:00:00",
     "end_time": "2025-10-16T10:30:00"
   }
   ↓
3. CRM Backend → PostgreSQL: INSERT INTO events (...)
   Returns: event_id = "uuid-456"
   ↓
4. CRM Backend → n8n Webhook: POST /webhook/event-created
   {
     "event_id": "uuid-456",
     "contact_name": "João Silva",
     "contact_whatsapp": "5511987654321",
     "start_time": "2025-10-16T10:00:00",
     "admin_whatsapp": "5511999999999",
     "staff_telegram": "123456789"
   }
   ↓
5. n8n Workflow "Event Created":
   
   a) Create Google Calendar Event
      → MCP Calendar API
      → Returns google_event_id
      → n8n → PostgreSQL: UPDATE events SET google_event_id = '...'
   
   b) Send WhatsApp Confirmation to Patient
      → Evolution API: "Hi João! Your appointment is confirmed for..."
      → n8n → PostgreSQL: UPDATE events SET confirmation_sent = true
      → n8n → PostgreSQL: INSERT INTO activities (type='confirmation')
   
   c) Notify Admin via WhatsApp
      → Evolution API to admin: "🔔 New appointment: João Silva tomorrow 10am"
      → n8n → PostgreSQL: UPDATE events SET admin_notified = true
   
   d) Notify Admin via Email
      → SMTP: Send email to admin
   
   e) Notify Staff via Telegram
      → Telegram API: "📅 You have a new appointment: João tomorrow 10am"
      → n8n → PostgreSQL: UPDATE events SET staff_notified = true
   
   f) Log Automation
      → n8n → PostgreSQL: INSERT INTO automation_history
         (type='event_created', action='Calendar synced, all notified', result='success')
   ↓
6. Everyone is notified:
   - Patient gets WhatsApp confirmation
   - Admin gets WhatsApp + Email notification
   - Assigned staff gets Telegram notification
   - Event appears in Google Calendar
   - Everything logged in CRM database
```

### Flow 3: Automated Daily Reminders (Runs Every Day at 8am)

```
1. n8n Schedule Trigger: Runs at 8:00 AM daily
   ↓
2. n8n → PostgreSQL: Query tomorrow's appointments
   SELECT e.*, c.name, c.whatsapp_number, cu.admin_whatsapp, cu.telegram_chat_id
   FROM events e
   JOIN contacts c ON e.contact_id = c.id
   JOIN crm_users cu ON e.crm_user_id = cu.id
   LEFT JOIN staff_members s ON e.assigned_to = s.id
   WHERE DATE(e.start_time) = CURRENT_DATE + 1
   AND e.status IN ('scheduled', 'confirmed')
   AND e.reminder_sent = false
   
   Results: 5 appointments tomorrow
   ↓
3. n8n → Loop through each appointment:
   
   For Appointment 1 (João at 10am):
   
   a) Send Reminder to Patient
      → Evolution API: "Hi João! Reminder: You have an appointment tomorrow at 10am"
      → PostgreSQL: INSERT INTO activities (type='reminder', direction='outbound')
   
   b) Notify Admin
      → Evolution API to admin WhatsApp: "📋 Reminder sent to João for tomorrow 10am"
      → PostgreSQL: INSERT INTO activities (type='admin_notification')
   
   c) Notify Assigned Staff
      → Telegram API to staff: "📋 Tomorrow 10am: João Silva - Consultation"
      → PostgreSQL: INSERT INTO activities (type='staff_notification')
   
   d) Update Event
      → PostgreSQL: UPDATE events SET reminder_sent = true, reminder_sent_at = NOW()
   
   e) Log Automation
      → PostgreSQL: INSERT INTO automation_history
         (type='daily_reminder', contact='João', result='success')
   
   Repeat for all 5 appointments...
   ↓
4. Summary Notification to Admin
   → Telegram: "✅ Daily reminders complete: 5 sent, 5 successful"
   ↓
5. CRM Dashboard "Automation History" shows:
   - 08:00 AM: Reminder sent to João Silva
   - 08:00 AM: Reminder sent to Maria Santos
   - 08:00 AM: Reminder sent to Pedro Oliveira
   - etc...
```

## Database Tables Used by n8n

### Tables n8n READS from:
- `contacts` - Get patient/customer info
- `events` - Get appointments for reminders
- `activities` - Get conversation history
- `crm_users` - Get admin/staff notification settings
- `staff_members` - Get staff notification preferences

### Tables n8n WRITES to:
- `contacts` - Auto-create from WhatsApp
- `activities` - Store all messages, reminders, confirmations
- `events` - Update reminder_sent, confirmation_sent status
- `automation_history` - Log every automation execution

## n8n Workflow Triggers

### Webhooks (called by CRM backend):
- `/webhook/event-created` - When appointment created in UI
- `/webhook/event-updated` - When appointment rescheduled
- `/webhook/event-cancelled` - When appointment cancelled
- `/webhook/send-message` - When user manually sends message

### External Webhooks (called by services):
- `/webhook/whatsapp-incoming-{user_id}` - Evolution API sends here
- `/webhook/telegram-incoming` - Telegram bot sends here

### Schedule Triggers:
- Daily at 8:00 AM - Send next day reminders
- Every hour - Check for upcoming events (within 1 hour)

## Notification Matrix

| Event | Patient WhatsApp | Admin WhatsApp | Admin Email | Staff Telegram |
|-------|-----------------|----------------|-------------|----------------|
| Appointment Created | ✅ Confirmation | ✅ Alert | ✅ Alert | ✅ Assignment |
| Appointment Confirmed | ✅ Thank you | ✅ Notification | ❌ | ✅ Update |
| Appointment Rescheduled | ✅ New time | ✅ Alert | ✅ Alert | ✅ Update |
| Appointment Cancelled | ✅ Cancellation | ✅ Alert | ❌ | ✅ Update |
| Daily Reminder (24h before) | ✅ Reminder | ✅ Summary | ❌ | ✅ List |
| Hourly Check (1h before) | ✅ Final reminder | ❌ | ❌ | ❌ |

## Setup Checklist

### 1. PostgreSQL Configuration
- [ ] Run schema.sql to create all tables
- [ ] Create n8n PostgreSQL credential
- [ ] Test connection from n8n

### 2. Evolution API Configuration
- [ ] Get Evolution API URL and key
- [ ] Create n8n Evolution API credential
- [ ] Test sending message

### 3. Telegram Configuration
- [ ] Create bot via @BotFather
- [ ] Get bot token
- [ ] Create n8n Telegram credential
- [ ] Test sending message

### 4. Google Calendar Configuration
- [ ] Set up MCP server (already done)
- [ ] Configure OAuth credentials
- [ ] Test calendar creation

### 5. Ollama Configuration
- [ ] Ensure Ollama is running
- [ ] Download models: llama3:8b
- [ ] Create n8n Ollama credential
- [ ] Test AI generation

### 6. n8n Workflow Import
- [ ] Import base template
- [ ] Configure all credentials
- [ ] Test each workflow manually
- [ ] Activate workflows

## Testing

### Test 1: WhatsApp Message Flow
1. Send message from WhatsApp to your number
2. Check CRM database: SELECT * FROM activities ORDER BY created_at DESC LIMIT 1
3. Verify AI response was sent
4. Check automation_history table

### Test 2: Appointment Creation
1. Create appointment in CRM UI
2. Check Google Calendar - event should appear
3. Check WhatsApp - patient should get confirmation
4. Check Telegram - admin should get notification
5. Check automation_history

### Test 3: Daily Reminders
1. Create appointment for tomorrow
2. Wait for 8am (or manually trigger n8n workflow)
3. Verify reminder sent to patient
4. Verify admin and staff notified
5. Check automation_history

## Troubleshooting

### n8n can't connect to PostgreSQL
- Check DATABASE_URL in n8n environment
- Verify PostgreSQL is accessible from n8n container
- Test: `docker exec n8n-crm pg_isready -h postgres -p 5432`

### WhatsApp messages not sending
- Verify Evolution API is running
- Check WhatsApp instance is connected (scan QR)
- Test Evolution API directly: `curl http://localhost:8080/instance/fetchInstances`

### AI not responding
- Check Ollama is running: `curl http://localhost:11434/api/tags`
- Verify model is downloaded: `docker exec ollama ollama list`
- Check n8n can reach Ollama: test with simple prompt

### Notifications not received
- Telegram: Verify bot token and chat ID
- Email: Check SMTP credentials
- WhatsApp: Verify admin WhatsApp number in crm_users table

## Performance Considerations

### Database Queries
- Add indexes for frequently queried fields (already done in schema)
- Use connection pooling
- Monitor slow queries

### n8n Workflows
- Use batch processing for multiple items
- Set timeouts appropriately
- Handle errors gracefully
- Log failures to automation_history

### Message Rate Limits
- WhatsApp: ~80 messages/second (Evolution API limit)
- Telegram: 30 messages/second per bot
- Respect rate limits in n8n loops

