-- Exora CRM Database Schema
-- Universal CRM with industry templates
-- 
-- IMPORTANT: This creates a NEW database 'exora-crm' in your existing PostgreSQL server
-- The CRM has its own database but shares the same PostgreSQL instance as exora-web
--
-- Step 1: Create database (run as postgres user):
--   psql -U postgres -c "CREATE DATABASE \"exora-crm\";"
--
-- Step 2: Run this schema:
--   psql -U postgres -d exora-crm -f exora-crm/database/schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== CRM USERS ====================
-- Links to users in exora-web database via exora_user_id
-- exora_user_id comes from JWT token (no foreign key needed since different DB)
CREATE TABLE IF NOT EXISTS crm_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exora_user_id INTEGER NOT NULL UNIQUE,  -- References users.id in exora-web DB
    
    -- Business configuration
    business_name VARCHAR(255),
    industry VARCHAR(50) DEFAULT 'general',
    industry_config JSONB DEFAULT '{}',
    
    -- n8n integration
    n8n_workflow_id VARCHAR(64),
    
    -- WhatsApp
    whatsapp_connected BOOLEAN DEFAULT false,
    whatsapp_instance_name VARCHAR(100),
    whatsapp_phone VARCHAR(50),
    
    -- Telegram
    telegram_connected BOOLEAN DEFAULT false,
    telegram_chat_id VARCHAR(100),
    
    -- Admin notifications
    admin_email VARCHAR(255),
    admin_whatsapp VARCHAR(50),
    notify_admin_email BOOLEAN DEFAULT true,
    notify_admin_whatsapp BOOLEAN DEFAULT true,
    notify_admin_telegram BOOLEAN DEFAULT true,
    
    -- Google Calendar
    google_calendar_id VARCHAR(255),
    
    -- Status
    status VARCHAR(24) DEFAULT 'pending_setup',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crm_users_exora ON crm_users(exora_user_id);
CREATE INDEX idx_crm_users_industry ON crm_users(industry);

-- ==================== CONTACTS ====================
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crm_user_id UUID NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
    
    -- Basic info
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    whatsapp_number VARCHAR(50),
    telegram_id VARCHAR(100),
    
    -- Additional info
    birth_date DATE,
    address TEXT,
    notes TEXT,
    
    -- Custom fields (industry-specific)
    custom_fields JSONB DEFAULT '{}',
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    source VARCHAR(50) DEFAULT 'manual',
    external_id VARCHAR(255),
    
    -- Status
    status VARCHAR(50) DEFAULT 'active',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_contact_at TIMESTAMPTZ
);

CREATE INDEX idx_contacts_crm_user ON contacts(crm_user_id);
CREATE INDEX idx_contacts_phone ON contacts(phone);
CREATE INDEX idx_contacts_whatsapp ON contacts(whatsapp_number);
CREATE INDEX idx_contacts_email ON contacts(email);

-- ==================== STAFF MEMBERS ====================
-- Create this BEFORE opportunities (which references it)
CREATE TABLE IF NOT EXISTS staff_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crm_user_id UUID NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
    
    -- Basic info
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    
    -- Role
    role VARCHAR(50) DEFAULT 'staff',
    
    -- Notifications
    telegram_chat_id VARCHAR(100),
    whatsapp_number VARCHAR(50),
    notify_telegram BOOLEAN DEFAULT true,
    notify_whatsapp BOOLEAN DEFAULT false,
    notify_email BOOLEAN DEFAULT true,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_staff_crm_user ON staff_members(crm_user_id);

-- ==================== OPPORTUNITIES ====================
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crm_user_id UUID NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    
    -- Basic info
    title VARCHAR(500) NOT NULL,
    description TEXT,
    
    -- Value (optional for non-sales)
    value NUMERIC(12,2),
    currency VARCHAR(3) DEFAULT 'BRL',
    
    -- Pipeline
    stage VARCHAR(50) NOT NULL DEFAULT 'new',
    probability INTEGER CHECK (probability BETWEEN 0 AND 100),
    
    -- Staff assignment
    assigned_to UUID REFERENCES staff_members(id) ON DELETE SET NULL,
    
    -- Dates
    expected_date DATE,
    actual_date DATE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    lost_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_opportunities_crm_user ON opportunities(crm_user_id);
CREATE INDEX idx_opportunities_contact ON opportunities(contact_id);
CREATE INDEX idx_opportunities_stage ON opportunities(stage);

-- ==================== EVENTS ====================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crm_user_id UUID NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    
    -- Event details
    title VARCHAR(500) NOT NULL,
    description TEXT,
    location VARCHAR(500),
    
    -- Time
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    
    -- Staff assignment
    assigned_to UUID REFERENCES staff_members(id) ON DELETE SET NULL,
    
    -- Status
    status VARCHAR(50) DEFAULT 'scheduled',
    
    -- Google Calendar sync
    google_event_id VARCHAR(255),
    google_calendar_synced BOOLEAN DEFAULT false,
    
    -- Notifications tracking
    reminder_sent BOOLEAN DEFAULT false,
    reminder_sent_at TIMESTAMPTZ,
    confirmation_sent BOOLEAN DEFAULT false,
    confirmation_sent_at TIMESTAMPTZ,
    admin_notified BOOLEAN DEFAULT false,
    admin_notified_at TIMESTAMPTZ,
    staff_notified BOOLEAN DEFAULT false,
    staff_notified_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_crm_user ON events(crm_user_id);
CREATE INDEX idx_events_contact ON events(contact_id);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_status ON events(status);

-- ==================== ACTIVITIES ====================
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crm_user_id UUID NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    
    -- Activity type
    activity_type VARCHAR(50) NOT NULL,
    direction VARCHAR(20),
    channel VARCHAR(50),
    
    -- Content
    subject VARCHAR(500),
    body TEXT,
    
    -- External references
    external_message_id VARCHAR(255),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Status
    status VARCHAR(50) DEFAULT 'completed',
    
    -- Timestamps
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_crm_user ON activities(crm_user_id);
CREATE INDEX idx_activities_contact ON activities(contact_id);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_activities_created ON activities(created_at DESC);

-- ==================== STAFF MEMBERS ====================
CREATE TABLE IF NOT EXISTS staff_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crm_user_id UUID NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
    
    -- Basic info
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    
    -- Role
    role VARCHAR(50) DEFAULT 'staff',
    
    -- Notifications
    telegram_chat_id VARCHAR(100),
    whatsapp_number VARCHAR(50),
    notify_telegram BOOLEAN DEFAULT true,
    notify_whatsapp BOOLEAN DEFAULT false,
    notify_email BOOLEAN DEFAULT true,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_staff_crm_user ON staff_members(crm_user_id);

-- ==================== AUTOMATION HISTORY ====================
CREATE TABLE IF NOT EXISTS automation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crm_user_id UUID NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
    
    -- Automation details
    automation_type VARCHAR(100) NOT NULL,
    trigger_source VARCHAR(100),
    
    -- Related entities
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
    
    -- Details
    action_taken TEXT,
    result VARCHAR(50),
    error_message TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamp
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_automation_history_crm_user ON automation_history(crm_user_id);
CREATE INDEX idx_automation_history_executed ON automation_history(executed_at DESC);
CREATE INDEX idx_automation_history_type ON automation_history(automation_type);

-- ==================== TRIGGERS ====================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_crm_users_updated_at 
    BEFORE UPDATE ON crm_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON contacts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at 
    BEFORE UPDATE ON opportunities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_members_updated_at 
    BEFORE UPDATE ON staff_members 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at 
    BEFORE UPDATE ON opportunities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

