# Universal Automation System - Implementation Guide

## Overview

The Exora CRM now features a **Universal Automation System** that allows users to enable and configure various automation modules directly from the CRM UI without touching n8n.

## Architecture

### Core Components

1. **Database Tables** (PostgreSQL)
   - `automation_modules` - Available automation types
   - `automation_configs` - User's enabled modules and configs
   - `automation_execution_logs` - Execution history and analytics

2. **Backend API** (`/api/automations`)
   - `GET /modules` - List all available modules
   - `GET /configs` - Get user's enabled automations
   - `POST /enable` - Enable an automation module
   - `PUT /:module_key/config` - Update configuration
   - `DELETE /:module_key` - Disable an automation
   - `GET /logs` - Get execution logs
   - `GET /stats` - Get aggregated statistics

3. **Frontend UI** (`/automations`)
   - Automation Marketplace interface
   - Configuration modals with dynamic forms
   - Real-time status tracking

4. **n8n Master Workflow**
   - Single workflow template with all automation modules
   - Routes by module type
   - Dynamically injects user configurations
   - Logs all executions

## Available Automation Modules

### 1. WhatsApp Integration (💬)
- Send and receive WhatsApp messages
- AI-powered auto-replies
- Message history tracking

**Configuration:**
- `instance_name` (string) - Evolution API instance
- `auto_reply` (boolean) - Enable/disable auto-replies
- `ai_model` (enum) - Choose AI model (gpt-4, gpt-3.5, llama3)

### 2. AI Assistant (🤖)
- Intelligent AI agent for customer interactions
- Customizable prompts and behavior
- Context-aware responses

**Configuration:**
- `system_prompt` (string) - AI personality and instructions
- `temperature` (number, 0-1) - Creativity level
- `max_tokens` (integer) - Max response length

### 3. Knowledge Base RAG (📚)
- Context-aware responses using your documents
- Vector database integration
- Semantic search

**Configuration:**
- `index_name` (string) - Vector index name
- `top_k` (integer) - Number of context documents to retrieve

### 4. Email Automation (📧)
- Automated emails and follow-ups
- Gmail/SMTP integration
- Email templates

**Configuration:**
- `from_email` (string) - Sender email address
- `signature` (string) - Email signature

### 5. SMS Notifications (📱)
- Send SMS messages via Twilio
- Appointment reminders
- Bulk messaging

**Configuration:**
- `from_number` (string) - Twilio phone number

### 6. Calendar Sync (📅)
- Google Calendar integration
- Smart scheduling
- Automatic event creation

**Configuration:**
- `calendar_id` (string) - Google Calendar ID
- `default_duration` (integer) - Default event duration in minutes

### 7. Website Chatbot (💭)
- Embeddable chat widget
- Multi-channel support
- Customizable appearance

**Configuration:**
- `widget_color` (string) - Widget color
- `greeting_message` (string) - Welcome message

## Industry Templates

When a user completes CRM setup, recommended automations are automatically enabled based on their industry:

### Healthcare & Clinics
- **Recommended:** WhatsApp, AI Agent, Calendar, SMS
- **AI Prompt:** "You are a medical clinic assistant. Be professional, empathetic, and HIPAA-compliant."
- **Default Duration:** 30 minutes

### Restaurant & Hospitality
- **Recommended:** WhatsApp, SMS, Calendar, Chatbot
- **AI Prompt:** Standard conversational
- **Default Duration:** 120 minutes (2 hours)

### Salon & Beauty
- **Recommended:** WhatsApp, SMS, Calendar, Email
- **Default Duration:** 60 minutes

### Sales & B2B
- **Recommended:** Email, AI Agent, Calendar, WhatsApp
- **AI Prompt:** "You are a professional sales assistant. Be persuasive yet respectful."
- **Default Duration:** 45 minutes

### Consulting & Professional Services
- **Recommended:** Email, Calendar, AI Agent
- **AI Prompt:** "You are a professional consultant assistant. Provide expert advice."
- **Default Duration:** 60 minutes

### General Business
- **Recommended:** WhatsApp, Email, Calendar
- **Default Duration:** 30 minutes

## Database Migration

To enable the automation system, run the migration:

```bash
cd exora/exora-mern/exora-crm/database
psql -U postgres -d exora-crm -f add-automation-tables.sql
```

This will:
1. Create `automation_modules` table
2. Create `automation_configs` table
3. Create `automation_execution_logs` table
4. Seed 7 automation modules
5. Create necessary indexes

## Usage Flow

### For Users

1. **Complete Setup** - Select industry during CRM setup
2. **Recommended Automations** - Industry-specific automations are auto-enabled
3. **Customize** - Go to `/automations` to configure or add more modules
4. **Monitor** - View execution logs and analytics

### For Developers

1. **Add New Module** - Insert row into `automation_modules` table
2. **Define Schema** - Use JSON Schema for configuration UI
3. **Update n8n Workflow** - Add handler for new module
4. **Test** - Enable module and trigger automation

## Configuration Schema

All configurations use JSON Schema format:

```json
{
  "properties": {
    "field_name": {
      "type": "string|boolean|number|integer",
      "title": "Display Label",
      "enum": ["option1", "option2"],
      "minimum": 0,
      "maximum": 1,
      "default": "default_value"
    }
  }
}
```

The frontend automatically generates forms based on this schema.

## n8n Integration

### Webhook Entry Point

```
POST https://n8n.exora.solutions/webhook/crm-automation
```

### Request Format

```json
{
  "module": "whatsapp|ai_agent|rag_agent|email|sms|calendar|chatbot",
  "crm_user_id": "uuid",
  "trigger_source": "manual|event_created|whatsapp_incoming",
  "enabled_modules": {
    "whatsapp": { "auto_reply": true, "ai_model": "gpt-4" },
    "ai_agent": { "system_prompt": "...", "temperature": 0.7 }
  },
  "data": { ... }
}
```

The `enabled_modules` object is automatically injected by the backend middleware.

### Workflow Structure

```
Webhook Entry
  ↓
Get User Configs (PostgreSQL)
  ↓
Module Router (Switch Node)
  ↓
┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐
│ WA   │ AI   │ RAG  │Email │ SMS  │ Cal  │ Chat │
│Handler│Agent│Agent│Handler│Handler│Handler│Handler│
└──────┴──────┴──────┴──────┴──────┴──────┴──────┘
  ↓
Merge Results
  ↓
Log Execution (PostgreSQL)
```

## API Examples

### Enable WhatsApp Automation

```bash
curl -X POST https://crm-api.exora.solutions/api/automations/enable \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "module_key": "whatsapp",
    "config_data": {
      "instance_name": "my-clinic",
      "auto_reply": true,
      "ai_model": "gpt-4"
    }
  }'
```

### Update AI Agent Configuration

```bash
curl -X PUT https://crm-api.exora.solutions/api/automations/ai_agent/config \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "config_data": {
      "system_prompt": "You are a helpful assistant for a law firm.",
      "temperature": 0.3,
      "max_tokens": 500
    }
  }'
```

### Get Execution Logs

```bash
curl -X GET "https://crm-api.exora.solutions/api/automations/logs?module_key=whatsapp&limit=50" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Statistics

```bash
curl -X GET "https://crm-api.exora.solutions/api/automations/stats?days=30" \
  -H "Authorization: Bearer $TOKEN"
```

## Frontend Integration

### Navigate to Automations Page

```jsx
import { Link } from 'react-router-dom';

<Link to="/automations">Automations</Link>
```

### Fetch Available Modules

```javascript
import { useQuery } from '@tanstack/react-query';
import api from './services/api';

const { data } = useQuery({
  queryKey: ['automation-modules'],
  queryFn: async () => {
    const res = await api.get('/automations/modules');
    return res.data;
  }
});
```

## Extending the System

### Adding a New Automation Module

1. **Database Insert:**

```sql
INSERT INTO automation_modules (module_key, name, description, icon, category, required_credentials, config_schema) 
VALUES (
  'voice_calls',
  'Voice Calls',
  'Make and receive voice calls',
  '📞',
  'communication',
  '["twilio_voice"]',
  '{
    "properties": {
      "caller_id": {"type": "string", "title": "Caller ID Number"}
    }
  }'
);
```

2. **Update n8n Workflow:**
   - Add handler node
   - Add route in Module Router
   - Connect to Merge Results

3. **Optional: Update Industry Templates:**

```javascript
healthcare: {
  recommended_automations: ['whatsapp', 'ai_agent', 'calendar', 'sms', 'voice_calls'],
  default_configs: {
    voice_calls: { caller_id: '+1234567890' }
  }
}
```

## Monitoring & Analytics

### Execution Logs Table

```sql
SELECT 
  module_key,
  COUNT(*) as total_executions,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
  AVG(execution_time_ms) as avg_execution_time
FROM automation_execution_logs
WHERE crm_user_id = $1
AND executed_at >= NOW() - INTERVAL '30 days'
GROUP BY module_key;
```

### Real-time Monitoring

Future enhancement: WebSocket notifications for real-time execution updates.

## Security Considerations

1. **Authentication** - All API endpoints require valid JWT token
2. **Authorization** - Users can only access their own configurations
3. **Validation** - Input validation on all configuration fields
4. **Rate Limiting** - Prevent automation abuse (to be implemented)
5. **Credential Storage** - Sensitive credentials stored in n8n, not in database

## Troubleshooting

### Automation Not Running

1. Check if module is enabled: `GET /api/automations/configs`
2. Verify n8n workflow is active
3. Check execution logs: `GET /api/automations/logs`
4. Verify credentials in n8n

### Configuration Not Saving

1. Check JWT token validity
2. Verify JSON format in config_data
3. Check browser console for errors
4. Verify database connection

### n8n Webhook Not Triggering

1. Test webhook URL directly
2. Check n8n API credentials
3. Verify enrichWithConfigs middleware is working
4. Check backend logs

## Future Enhancements

- [ ] Visual workflow builder in CRM UI
- [ ] A/B testing for automation variations
- [ ] Cost tracking per module
- [ ] Performance analytics dashboard
- [ ] Automation marketplace (community templates)
- [ ] Multi-language support for AI prompts
- [ ] Custom module creation from UI
- [ ] Workflow versioning and rollback

## Support

For issues or questions:
- Check execution logs first
- Review database records
- Test individual modules in n8n
- Enable debug logging in backend

---

**Version:** 1.0.0  
**Last Updated:** October 2025  
**Status:** ✅ Production Ready

