# n8n CRM Workflows

## Overview

This directory contains n8n workflow templates for the Exora CRM system.

## Workflows

### 1. WhatsApp Automation (`whatsapp-automation.json`)
- Receives incoming WhatsApp messages
- Auto-creates contacts if new
- Stores messages in CRM database
- Generates AI responses
- Sends replies
- Logs all automation

### 2. Appointment Reminders (`appointment-reminders.json`)
- Runs daily at configured time
- Queries next day's appointments from CRM database
- Sends WhatsApp reminders to contacts
- Sends notifications to admin and staff
- Updates reminder status in database

### 3. Event Created Webhook (`event-created-webhook.json`)
- Triggered when CRM creates new event
- Creates Google Calendar event
- Sends confirmation to contact
- Notifies admin via WhatsApp/Email/Telegram
- Notifies assigned staff via Telegram

### 4. Event Cancelled Webhook (`event-cancelled-webhook.json`)
- Triggered when event is cancelled
- Deletes from Google Calendar
- Sends cancellation message to contact
- Notifies admin via Telegram

## Setup

1. Import workflows to n8n-crm instance
2. Configure PostgreSQL credentials
3. Configure Evolution API credentials
4. Configure Google Calendar credentials (via MCP)
5. Configure Telegram bot credentials
6. Activate workflows

## Per-User Cloning

When a user activates CRM:
- Base template is cloned
- User-specific credentials are injected
- Workflow is activated
- User's crm_user_id is embedded in all database operations

