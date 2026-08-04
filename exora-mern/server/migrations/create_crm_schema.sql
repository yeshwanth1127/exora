-- AI-First CRM Database Schema
-- This migration creates all tables needed for the CRM system

-- CRM Users (links Exora users to CRM workspaces)
CREATE TABLE IF NOT EXISTS crm_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exora_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_name VARCHAR(255),
    n8n_workflow_id VARCHAR(64),
    whatsapp_connected BOOLEAN DEFAULT false,
    whatsapp_phone VARCHAR(50),
    whatsapp_instance_name VARCHAR(100),
    telegram_connected BOOLEAN DEFAULT false,
    telegram_chat_id VARCHAR(100),
    business_info JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    status VARCHAR(24) DEFAULT 'pending_setup',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exora_user_id)
);

-- CRM Contacts
CREATE TABLE IF NOT EXISTS crm_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crm_user_id UUID NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
    external_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    whatsapp_number VARCHAR(50),
    telegram_id VARCHAR(100),
    birth_date DATE,
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    source VARCHAR(50) DEFAULT 'manual',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_user ON crm_contacts(crm_user_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_phone ON crm_contacts(phone);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_whatsapp ON crm_contacts(whatsapp_number);

-- CRM Deals
CREATE TABLE IF NOT EXISTS crm_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crm_user_id UUID NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    value NUMERIC(12,2),
    currency VARCHAR(3) DEFAULT 'BRL',
    stage VARCHAR(50) NOT NULL DEFAULT 'lead',
    pipeline_order INTEGER DEFAULT 0,
    probability INTEGER CHECK (probability BETWEEN 0 AND 100),
    expected_close_date DATE,
    actual_close_date DATE,
    lost_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_deals_user ON crm_deals(crm_user_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_stage ON crm_deals(stage);
CREATE INDEX IF NOT EXISTS idx_crm_deals_contact ON crm_deals(contact_id);

-- CRM Activities
CREATE TABLE IF NOT EXISTS crm_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crm_user_id UUID NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES crm_contacts(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES crm_deals(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL,
    direction VARCHAR(20),
    channel VARCHAR(50),
    subject VARCHAR(500),
    body TEXT,
    external_message_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'completed',
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_activities_user ON crm_activities(crm_user_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_contact ON crm_activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_created ON crm_activities(created_at DESC);

-- CRM Events
CREATE TABLE IF NOT EXISTS crm_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crm_user_id UUID NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES crm_deals(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    location VARCHAR(500),
    google_event_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'scheduled',
    reminder_sent BOOLEAN DEFAULT false,
    confirmation_sent BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_events_user ON crm_events(crm_user_id);
CREATE INDEX IF NOT EXISTS idx_crm_events_time ON crm_events(start_time);

-- CRM Chat Memory
CREATE TABLE IF NOT EXISTS crm_chat_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crm_user_id UUID NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_chat_session ON crm_chat_memory(crm_user_id, session_id, created_at);

-- CRM Documents (for RAG)
CREATE TABLE IF NOT EXISTS crm_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crm_user_id UUID NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
    title VARCHAR(500),
    content TEXT NOT NULL,
    document_type VARCHAR(50),
    source VARCHAR(255),
    vector_id VARCHAR(255),
    embedding_model VARCHAR(100) DEFAULT 'ollama:nomic-embed-text',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_documents_user ON crm_documents(crm_user_id);

-- CRM Automations
CREATE TABLE IF NOT EXISTS crm_automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crm_user_id UUID NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
    automation_type VARCHAR(100),
    n8n_workflow_id VARCHAR(64),
    is_active BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}',
    last_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRM Migration Jobs
CREATE TABLE IF NOT EXISTS crm_migration_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crm_user_id UUID NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
    source VARCHAR(50),
    file_url VARCHAR(1000),
    status VARCHAR(50) DEFAULT 'pending',
    mapping JSONB,
    stats JSONB DEFAULT '{}',
    error_log TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for tables with updated_at
CREATE TRIGGER update_crm_users_updated_at BEFORE UPDATE ON crm_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_contacts_updated_at BEFORE UPDATE ON crm_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_deals_updated_at BEFORE UPDATE ON crm_deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_events_updated_at BEFORE UPDATE ON crm_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_documents_updated_at BEFORE UPDATE ON crm_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

