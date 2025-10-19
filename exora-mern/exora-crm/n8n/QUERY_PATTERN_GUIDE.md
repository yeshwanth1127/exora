# Database Query Pattern Guide - User Isolation

## 🔐 Critical Pattern: ALL Queries MUST Filter by crm_user_id

Every database query in the n8n workflow MUST include:
```sql
WHERE crm_user_id = $1::uuid
```

The `crm_user_id` comes from the webhook payload (`{{ $json.crm_user_id }}`).

---

## ✅ Correct Query Patterns

### **Pattern 1: SELECT with User Filter**

```javascript
// Node: Get User Configs
{
  "type": "n8n-nodes-base.postgres",
  "credentials": {
    "postgres": {
      "name": "PostgreSQL - CRM Production"  // ← SHARED credential
    }
  },
  "parameters": {
    "operation": "executeQuery",
    "query": "SELECT module_key, config_data FROM automation_configs WHERE crm_user_id = $1::uuid AND enabled = true",
    "options": {
      "queryReplacement": "={{ $json.crm_user_id }}"  // ← From webhook payload
    }
  }
}
```

**What Happens:**
- User A triggers webhook with `crm_user_id: "user-a-uuid"`
- Query executes: `WHERE crm_user_id = 'user-a-uuid'`
- Returns: Only User A's configs

---

### **Pattern 2: SELECT with Multiple Parameters**

```javascript
// Node: Find Contact
{
  "parameters": {
    "operation": "executeQuery",
    "query": "SELECT id, name, whatsapp_number, phone FROM contacts WHERE crm_user_id = $1::uuid AND (whatsapp_number = $2 OR phone = $2) LIMIT 1",
    "options": {
      "queryReplacement": "={{ $json.crm_user_id }},={{ $json.from_phone }}"
    }
  }
}
```

**Parameters:**
- `$1` = `crm_user_id` (from webhook: `{{ $json.crm_user_id }}`)
- `$2` = `from_phone` (from webhook: `{{ $json.from_phone }}`)

---

### **Pattern 3: INSERT with User Reference**

```javascript
// Node: Create Contact
{
  "parameters": {
    "operation": "insert",
    "schema": "public",
    "table": "contacts",
    "columns": "id,crm_user_id,name,whatsapp_number,source,status",
    "options": {
      "queryReplacement": "uuid_generate_v4(),={{ $json.crm_user_id }}::uuid,={{ $json.from_name || 'Unknown' }},={{ $json.from_phone }},whatsapp,active"
    }
  }
}
```

**Column 2 (crm_user_id):** Always set to `{{ $json.crm_user_id }}`

---

### **Pattern 4: INSERT Activity with User & Contact**

```javascript
// Node: Store Inbound Message
{
  "parameters": {
    "operation": "insert",
    "table": "activities",
    "columns": "id,crm_user_id,contact_id,activity_type,direction,channel,body,external_message_id,status,completed_at",
    "options": {
      "queryReplacement": "uuid_generate_v4(),={{ $json.crm_user_id }}::uuid,={{ $json.contact_id }}::uuid,message,inbound,whatsapp,={{ $json.message }},={{ $json.message_id }},completed,NOW()"
    }
  }
}
```

**Always includes:** `crm_user_id = {{ $json.crm_user_id }}`

---

### **Pattern 5: UPDATE with User Filter**

```javascript
// Node: Update Event with Google ID
{
  "parameters": {
    "operation": "update",
    "table": "events",
    "updateKey": "id",
    "columns": "google_event_id,google_calendar_synced",
    "options": {
      "queryReplacement": "={{ $json.event_id }},={{ $json.google_event_id }},true"
    }
  }
}
```

**SQL Generated:**
```sql
UPDATE events 
SET google_event_id = $2, google_calendar_synced = $3
WHERE id = $1
-- Should also filter by crm_user_id for security!
```

**Better version:**
```sql
UPDATE events 
SET google_event_id = $2, google_calendar_synced = $3
WHERE id = $1 AND crm_user_id = $4::uuid
```

---

### **Pattern 6: INSERT Log Entry**

```javascript
// Node: Log Execution
{
  "parameters": {
    "operation": "insert",
    "table": "automation_execution_logs",
    "columns": "id,crm_user_id,module_key,trigger_source,input_data,output_data,status,error_message,execution_time_ms,executed_at",
    "options": {
      "queryReplacement": "uuid_generate_v4(),={{ $json.crm_user_id }}::uuid,={{ $json.module_key }},={{ $json.trigger_source }},={{ JSON.stringify($json.input_data) }},={{ JSON.stringify($json.output_data) }},={{ $json.status }},={{ $json.error_message }},={{ $json.execution_time_ms }},NOW()"
    }
  }
}
```

**Always logs with:** `crm_user_id` from webhook payload

---

## 🎯 Where crm_user_id Comes From

### **Webhook Entry Point:**

```json
{
  "type": "n8n-nodes-base.webhook",
  "parameters": {
    "path": "{{ $env.CRM_USER_ID }}/automation",
    "responseMode": "onReceived"
  }
}
```

**Receives POST from CRM Backend:**
```json
{
  "module": "whatsapp",
  "crm_user_id": "abc-def-123-456-789",  ← THIS VALUE
  "message": "Hello",
  "from_phone": "+5511987654321",
  "trigger_source": "whatsapp_incoming"
}
```

### **Available Throughout Workflow:**

```javascript
// In any node, you can access:
{{ $json.crm_user_id }}

// This will be: "abc-def-123-456-789"
```

---

## 🚨 Common Mistakes to Avoid

### **❌ WRONG: Missing User Filter**

```sql
-- BAD: Returns ALL users' contacts
SELECT * FROM contacts WHERE phone = $1
```

### **✅ CORRECT: With User Filter**

```sql
-- GOOD: Returns only THIS user's contacts
SELECT * FROM contacts 
WHERE crm_user_id = $1::uuid 
AND phone = $2
```

---

### **❌ WRONG: Hardcoded User ID**

```sql
-- BAD: Always uses same user
SELECT * FROM contacts WHERE crm_user_id = '12345'
```

### **✅ CORRECT: Dynamic User ID**

```sql
-- GOOD: Uses ID from webhook payload
SELECT * FROM contacts WHERE crm_user_id = $1::uuid
-- Parameter: {{ $json.crm_user_id }}
```

---

### **❌ WRONG: Per-User Credentials**

```javascript
// BAD: Trying to use different credentials per user
{
  "credentials": {
    "postgres": {
      "name": "PostgreSQL - User A"  // Don't do this!
    }
  }
}
```

### **✅ CORRECT: Shared Credentials**

```javascript
// GOOD: All users use same credential
{
  "credentials": {
    "postgres": {
      "name": "PostgreSQL - CRM Production"  // Shared
    }
  }
}
```

---

## 📊 Data Flow Example

### **User A Creates Event:**

```
CRM Backend:
  crm_user_id = "user-a-uuid"
  ↓
POST /webhook/user-a-uuid/automation
{
  "module": "calendar",
  "crm_user_id": "user-a-uuid",  ← Sent to n8n
  "event_id": "event-123",
  "start_time": "..."
}
  ↓
n8n Workflow Executes:
  ↓
Node: Get User Configs
  Query: WHERE crm_user_id = $1::uuid
  Parameter: $1 = "user-a-uuid"  ← From payload
  Credential: PostgreSQL - CRM Production (SHARED)
  Result: User A's configs only
  ↓
Node: Create Calendar Event  
  Uses: Google Calendar OAuth (SHARED credential)
  But: Only creates for User A's calendar (based on their config)
  ↓
Node: Update Event
  Query: WHERE id = $1 AND crm_user_id = $2::uuid
  Parameter: $2 = "user-a-uuid"  ← From payload
  Credential: PostgreSQL - CRM Production (SHARED)
  Result: Updates only User A's event
  ↓
Node: Log Execution
  Query: INSERT INTO automation_execution_logs (crm_user_id, ...)
  Parameter: crm_user_id = "user-a-uuid"  ← From payload
  Credential: PostgreSQL - CRM Production (SHARED)
  Result: Log entry tagged with User A's ID
```

**Same credentials, different data based on crm_user_id filter!**

---

## 🎯 Checklist for Every Database Node

For EVERY PostgreSQL node in your workflow, verify:

- [ ] Uses credential: "PostgreSQL - CRM Production" (or your shared credential name)
- [ ] Query includes: `WHERE crm_user_id = $1::uuid` (or similar filter)
- [ ] Parameter uses: `{{ $json.crm_user_id }}` from webhook payload
- [ ] INSERT statements include: `crm_user_id` column with value `{{ $json.crm_user_id }}`

---

## 🔧 Production Values

### **Database Connection (Shared):**
```
Host: your-production-db-server
Database: exora-crm
User: postgres
Password: your-secure-password
```

**Used by:** ALL user workflows

### **Ollama API (Shared):**
```
URL: http://localhost:11434/api/chat
(or http://ollama:11434/api/chat in Docker)
```

**Used by:** All users when `ai_model = "llama3"`

### **OpenAI API (Shared):**
```
API Key: sk-your-production-api-key
```

**Used by:** All users when `ai_model = "gpt-4"` or `"gpt-3.5"`

---

## ✅ Summary

### **Shared (Configure ONCE):**
- ✅ PostgreSQL connection
- ✅ OpenAI API key
- ✅ Evolution API credentials
- ✅ Ollama API URL
- ✅ Gmail OAuth
- ✅ Twilio credentials
- ✅ Google Calendar OAuth

### **Per-User (Via Data Filtering):**
- ✅ Contacts (WHERE crm_user_id = ...)
- ✅ Events (WHERE crm_user_id = ...)
- ✅ Activities (WHERE crm_user_id = ...)
- ✅ Automation configs (WHERE crm_user_id = ...)
- ✅ Execution logs (INSERT with crm_user_id)

### **Per-User (Via Config Data):**
- ✅ WhatsApp instance name (from automation_configs)
- ✅ AI system prompts (from automation_configs)
- ✅ Email signatures (from automation_configs)
- ✅ Calendar IDs (from automation_configs)

**Credentials are shared. Data is isolated. Configuration is per-user.** 🎯

