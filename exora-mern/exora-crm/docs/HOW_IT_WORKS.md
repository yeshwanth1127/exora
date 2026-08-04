# How Exora CRM Works - Complete Explanation

## Overview

This document explains in simple terms how all the pieces fit together.

## The Three Main Components

### 1. CRM Frontend & Backend (What Users See and Use)
- **Frontend**: React app where users manage contacts, appointments, messages
- **Backend**: FastAPI that stores/retrieves data from PostgreSQL
- **Database**: PostgreSQL tables (contacts, events, activities, etc.)

### 2. n8n Workflows (The Automation Brain)
- Receives WhatsApp messages and generates AI responses
- Sends appointment reminders automatically
- Creates Google Calendar events
- Notifies admin and staff
- All automation happens here

### 3. External Services (Communication Channels)
- **Evolution API**: Sends/receives WhatsApp messages
- **Telegram**: Sends notifications to admin/staff
- **Google Calendar**: Syncs appointments
- **Ollama**: AI for generating smart responses

## How They Talk to Each Other

### Connection 1: CRM Backend ↔ n8n (via Webhooks)

When something happens in CRM, it tells n8n:

```python
# In CRM Backend (FastAPI)
# When user creates appointment:

async def create_event(...):
    # 1. Save to database
    db.execute("INSERT INTO events ...")
    
    # 2. Tell n8n about it
    httpx.post("http://n8n:5678/webhook/event-created", json={
        "event_id": "123",
        "contact_phone": "5511987654321",
        "start_time": "2025-10-16T10:00:00"
    })
```

n8n receives this and does automation (send WhatsApp, create calendar, notify people).

### Connection 2: n8n ↔ PostgreSQL (Shared Database)

n8n reads and writes directly to the same database:

```javascript
// In n8n workflow
// Node: "Get Tomorrow's Appointments"
SELECT * FROM events 
WHERE DATE(start_time) = CURRENT_DATE + 1
AND reminder_sent = false

// Node: "Store WhatsApp Message"
INSERT INTO activities (contact_id, body, channel)
VALUES ('123', 'Patient message here', 'whatsapp')
```

This means n8n and CRM backend share data in real-time!

### Connection 3: n8n ↔ WhatsApp (via Evolution API)

```javascript
// In n8n
// Node: "Send WhatsApp Message"
POST http://evolution-api:8080/message/sendText
{
  "instance": "user-clinic-123",
  "number": "5511987654321",
  "text": "Your appointment is confirmed!"
}
```

Evolution API delivers the message to WhatsApp.

### Connection 4: n8n ↔ Telegram (Direct API)

```javascript
// In n8n
// Node: "Notify Admin via Telegram"
POST https://api.telegram.org/bot{TOKEN}/sendMessage
{
  "chat_id": "123456789",
  "text": "🔔 New appointment: João at 10am"
}
```

Telegram delivers notification instantly.

### Connection 5: n8n ↔ Google Calendar (via MCP)

```javascript
// In n8n
// Node: "Create Calendar Event"
POST {MCP_CALENDAR_URL}/create
{
  "summary": "Consultation - João Silva",
  "start": "2025-10-16T10:00:00",
  "end": "2025-10-16T10:30:00",
  "description": "Phone: 5511987654321"
}
```

Event appears in Google Calendar immediately.

## Complete Scenarios

### Scenario 1: Patient Books Appointment via WhatsApp

**Step-by-Step:**

1. **Patient sends**: "I want to book an appointment for tomorrow"
   
2. **Evolution API** receives message → sends webhook to n8n

3. **n8n Node 1**: Check if patient exists in database
   ```sql
   SELECT * FROM contacts WHERE whatsapp_number = '5511987654321'
   ```
   - If exists: get contact_id
   - If new: create new contact

4. **n8n Node 2**: Store patient's message
   ```sql
   INSERT INTO activities (contact_id, body, channel, direction)
   VALUES ('abc-123', 'I want to book...', 'whatsapp', 'inbound')
   ```

5. **n8n Node 3**: Get conversation history (last 10 messages)
   ```sql
   SELECT * FROM activities 
   WHERE contact_id = 'abc-123'
   ORDER BY created_at DESC LIMIT 10
   ```

6. **n8n Node 4**: Call Ollama AI
   ```
   Input: 
   - System: "You're a clinic assistant"
   - History: [previous messages]
   - Message: "I want to book appointment for tomorrow"
   
   AI Response: "I'd be happy to help! What time works best for you?
                 We have slots at 9am, 2pm, and 5pm."
   ```

7. **n8n Node 5**: Store AI response
   ```sql
   INSERT INTO activities (contact_id, body, direction)
   VALUES ('abc-123', 'I'd be happy to help...', 'outbound')
   ```

8. **n8n Node 6**: Send WhatsApp reply via Evolution API

9. **n8n Node 7**: Log the automation
   ```sql
   INSERT INTO automation_history (automation_type, result)
   VALUES ('ai_response', 'success')
   ```

10. **Patient receives** smart AI reply on WhatsApp

11. **Doctor checks CRM** → sees the whole conversation in Inbox

### Scenario 2: Doctor Creates Appointment in CRM

**Step-by-Step:**

1. **Doctor** opens CRM → Calendar → "New Appointment"

2. **Fills form**:
   - Patient: João Silva
   - Date: Tomorrow 10:00 AM
   - Service: Consultation
   - Clicks "Create"

3. **React Frontend** sends to backend:
   ```javascript
   POST /api/events
   { contact_id: "...", title: "...", start_time: "..." }
   ```

4. **FastAPI Backend**:
   - Saves to database: `INSERT INTO events`
   - Triggers n8n: `POST /webhook/event-created`

5. **n8n receives webhook** → runs "Event Created" workflow

6. **n8n performs 6 actions in parallel**:

   **Action A: Google Calendar**
   ```
   → MCP Calendar API: Create event
   → Returns google_event_id
   → Update database: events.google_event_id = '...'
   ```

   **Action B: WhatsApp to Patient**
   ```
   → Evolution API: Send confirmation
   → Message: "Hi João! Your appointment is confirmed for tomorrow at 10am"
   → Update database: events.confirmation_sent = true
   → Log: INSERT INTO activities (type='confirmation')
   ```

   **Action C: WhatsApp to Admin**
   ```
   → Evolution API to admin number
   → Message: "🔔 New appointment: João Silva tomorrow 10am"
   → Update: events.admin_notified = true
   ```

   **Action D: Email to Admin**
   ```
   → SMTP server
   → Email with appointment details
   ```

   **Action E: Telegram to Staff**
   ```
   → If staff assigned and has Telegram
   → Telegram API: "📅 New assignment: João tomorrow 10am"
   → Update: events.staff_notified = true
   ```

   **Action F: Log Everything**
   ```sql
   INSERT INTO automation_history (
     automation_type, trigger_source, action_taken, result
   ) VALUES (
     'event_created', 'crm_ui', 
     'Created calendar, sent confirmation, notified admin and staff',
     'success'
   )
   ```

7. **5 seconds later**:
   - Event in Google Calendar ✅
   - Patient got WhatsApp ✅
   - Admin got WhatsApp + Email ✅
   - Staff got Telegram ✅
   - All logged in CRM ✅

### Scenario 3: Daily 8am Reminder Job

**Every Day at 8:00 AM:**

1. **n8n Schedule Trigger** fires

2. **n8n queries database**:
   ```sql
   SELECT e.*, c.name, c.whatsapp_number, 
          cu.admin_whatsapp, cu.telegram_chat_id,
          s.telegram_chat_id as staff_telegram
   FROM events e
   JOIN contacts c ON e.contact_id = c.id
   JOIN crm_users cu ON e.crm_user_id = cu.id
   LEFT JOIN staff_members s ON e.assigned_to = s.id
   WHERE DATE(e.start_time) = CURRENT_DATE + 1
   AND e.status IN ('scheduled', 'confirmed')
   AND e.reminder_sent = false
   ```

   Result: 5 appointments for tomorrow

3. **n8n loops through each** (with 2-second delay between):

   **For João's appointment at 10am:**
   
   a) Send reminder to patient
   b) Notify admin
   c) Notify staff
   d) Mark as sent
   e) Log automation

   **For Maria's appointment at 2pm:**
   
   (repeat a-e)
   
   ... and so on for all 5

4. **After all sent**, n8n sends summary to admin:
   ```
   Telegram: "✅ Daily reminders complete:
              - João Silva (10am) ✅
              - Maria Santos (2pm) ✅
              - Pedro Oliveira (5pm) ✅
              - Ana Costa (9am) ✅
              - Carlos Lima (3pm) ✅"
   ```

5. **CRM shows in Automation History**:
   - 08:00:01 - Reminder sent to João Silva - Success
   - 08:00:03 - Reminder sent to Maria Santos - Success
   - 08:00:05 - Reminder sent to Pedro Oliveira - Success
   - etc...

## Why This Architecture?

### ✅ Separation of Concerns
- **CRM**: Handles data storage and user interface
- **n8n**: Handles all automation and integrations
- **External Services**: Handle communication

### ✅ Real-Time Sync
- Both CRM and n8n use same PostgreSQL database
- Changes appear instantly everywhere

### ✅ Transparency
- Every automation is logged in `automation_history`
- Users can see exactly what happened and when

### ✅ Scalability
- Add new automation = add new n8n workflow
- No CRM code changes needed
- Just connect workflow to database

### ✅ Flexibility
- Change AI prompts = edit n8n node
- Change message templates = edit n8n node
- No backend redeployment needed

## Key Tables and Their Purpose

| Table | Used By | Purpose |
|-------|---------|---------|
| `contacts` | CRM + n8n | Store patient/customer info |
| `events` | CRM + n8n | Store appointments |
| `activities` | n8n writes, CRM reads | All messages, reminders, notes |
| `automation_history` | n8n writes, CRM reads | Track what automations ran |
| `crm_users` | Both | Settings, notification preferences |
| `staff_members` | Both | Staff info for assignments and notifications |

## Summary

**User creates appointment in CRM UI** → **Backend stores in DB** → **Backend triggers n8n** → **n8n does 6 things in parallel** (Calendar, WhatsApp to patient, WhatsApp to admin, Email to admin, Telegram to staff, Log everything) → **Everyone notified, everything synchronized!**

That's the power of this architecture!

