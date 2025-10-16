# CRM Workflow Template for n8n

Based on your existing healthcare workflow, here's the CRM version:

## How to Set It Up

1. **Go to n8n.exora.solutions**
2. **Import this workflow** (I'll create the JSON below)
3. **Configure the MCP Calendar** with CRM calendar
4. **Save and get the workflow ID**
5. **Add to .env**: `CRM_TEMPLATE_WORKFLOW_ID=<workflow-id>`

## CRM Workflow Structure

```
Webhook (Contact Created) → PostgreSQL → WhatsApp Welcome
Webhook (Event Created) → PostgreSQL → Google Calendar → WhatsApp Confirmation
Webhook (Event Reminder) → Check 24h before → WhatsApp Reminder
Webhook (WhatsApp Incoming) → AI Agent → PostgreSQL → Response
```

## Key Differences from Your Healthcare Workflow

| Healthcare | CRM |
|------------|-----|
| Patient-focused | Universal (any business) |
| Telegram for staff | Admin notifications via webhook |
| Hardcoded clinic info | Dynamic per user |
| Single calendar | Per-user calendar |

## What Needs to Happen

Since CRM uses **the same n8n activation flow**, I'll:

1. Remove the separate crm.js route
2. Add CRM handling directly in activation.js (same as other workflows)
3. Create CRM workflow JSON based on your healthcare template
4. Make it production-ready

Ready to proceed?


