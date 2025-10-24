-- ===============================================================================
-- CRM DATABASE RECOVERY SCRIPT
-- Checks if tables were dropped and recreates the complete CRM schema
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ===============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== CRM USERS ====================
CREATE TABLE IF NOT EXISTS crm_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exora_user_id INTEGER NOT NULL UNIQUE,
    
    -- Business configuration
    business_name VARCHAR(255),
    industry VARCHAR(50) DEFAULT 'general',
    industry_config JSONB DEFAULT '{}',
    
    -- n8n integration
    n8n_workflow_id VARCHAR(64),
    
    -- WhatsApp (old fields)
    whatsapp_connected BOOLEAN DEFAULT false,
    whatsapp_instance_name VARCHAR(100),
    whatsapp_phone VARCHAR(50),
    
    -- Evolution API (new fields)
    evolution_instance_id VARCHAR(255),
    evolution_instance_status VARCHAR(50) DEFAULT 'disconnected',
    evolution_qr_code TEXT,
    evolution_qr_expires_at TIMESTAMPTZ,
    evolution_phone_number VARCHAR(50),
    evolution_last_connected_at TIMESTAMPTZ,
    evolution_webhook_url VARCHAR(500),
    
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

CREATE INDEX IF NOT EXISTS idx_crm_users_exora ON crm_users(exora_user_id);
CREATE INDEX IF NOT EXISTS idx_crm_users_industry ON crm_users(industry);
CREATE INDEX IF NOT EXISTS idx_crm_users_evolution_instance ON crm_users(evolution_instance_id) WHERE evolution_instance_id IS NOT NULL;

-- ==================== CONTACTS ====================
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crm_user_id UUID NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    whatsapp_number VARCHAR(50),
    telegram_id VARCHAR(100),
    
    birth_date DATE,
    address TEXT,
    notes TEXT,
    
    custom_fields JSONB DEFAULT '{}',
    
    tags TEXT[] DEFAULT '{}',
    source VARCHAR(50) DEFAULT 'manual',
    external_id VARCHAR(255),
    
    status VARCHAR(50) DEFAULT 'active',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_contact_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_contacts_crm_user ON contacts(crm_user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);
CREATE INDEX IF NOT EXISTS idx_contacts_whatsapp ON contacts(whatsapp_number);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

-- ==================== STAFF MEMBERS ====================
CREATE TABLE IF NOT EXISTS staff_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crm_user_id UUID NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    
    role VARCHAR(50) DEFAULT 'staff',
    
    telegram_chat_id VARCHAR(100),
    whatsapp_number VARCHAR(50),
    notify_telegram BOOLEAN DEFAULT true,
    notify_whatsapp BOOLEAN DEFAULT false,
    notify_email BOOLEAN DEFAULT true,
    
    status VARCHAR(50) DEFAULT 'active',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_crm_user ON staff_members(crm_user_id);

-- ==================== OPPORTUNITIES ====================
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crm_user_id UUID NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    
    title VARCHAR(500) NOT NULL,
    description TEXT,
    
    value NUMERIC(12,2),
    currency VARCHAR(3) DEFAULT 'BRL',
    
    stage VARCHAR(50) NOT NULL DEFAULT 'new',
    probability INTEGER CHECK (probability BETWEEN 0 AND 100),
    
    assigned_to UUID REFERENCES staff_members(id) ON DELETE SET NULL,
    
    expected_date DATE,
    actual_date DATE,
    
    metadata JSONB DEFAULT '{}',
    lost_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_crm_user ON opportunities(crm_user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_contact ON opportunities(contact_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);

-- ==================== EVENTS ====================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crm_user_id UUID NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    
    title VARCHAR(500) NOT NULL,
    description TEXT,
    location VARCHAR(500),
    
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    
    assigned_to UUID REFERENCES staff_members(id) ON DELETE SET NULL,
    
    status VARCHAR(50) DEFAULT 'scheduled',
    
    google_event_id VARCHAR(255),
    google_calendar_synced BOOLEAN DEFAULT false,
    
    reminder_sent BOOLEAN DEFAULT false,
    reminder_sent_at TIMESTAMPTZ,
    confirmation_sent BOOLEAN DEFAULT false,
    confirmation_sent_at TIMESTAMPTZ,
    admin_notified BOOLEAN DEFAULT false,
    admin_notified_at TIMESTAMPTZ,
    staff_notified BOOLEAN DEFAULT false,
    staff_notified_at TIMESTAMPTZ,
    
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_crm_user ON events(crm_user_id);
CREATE INDEX IF NOT EXISTS idx_events_contact ON events(contact_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- ==================== ACTIVITIES ====================
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crm_user_id UUID NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    
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

CREATE INDEX IF NOT EXISTS idx_activities_crm_user ON activities(crm_user_id);
CREATE INDEX IF NOT EXISTS idx_activities_contact ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC);

-- ==================== AUTOMATION HISTORY ====================
CREATE TABLE IF NOT EXISTS automation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crm_user_id UUID NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
    
    automation_type VARCHAR(100) NOT NULL,
    trigger_source VARCHAR(100),
    
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
    
    action_taken TEXT,
    result VARCHAR(50),
    error_message TEXT,
    
    metadata JSONB DEFAULT '{}',
    
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_history_crm_user ON automation_history(crm_user_id);
CREATE INDEX IF NOT EXISTS idx_automation_history_executed ON automation_history(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_history_type ON automation_history(automation_type);

-- ==================== AUTOMATION MODULES ====================
CREATE TABLE IF NOT EXISTS automation_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    category VARCHAR(50),
    required_credentials JSONB DEFAULT '[]',
    config_schema JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_modules_active ON automation_modules(is_active) WHERE is_active = true;

-- ==================== AUTOMATION CONFIGS ====================
CREATE TABLE IF NOT EXISTS automation_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crm_user_id UUID NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
    module_key VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    config_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(crm_user_id, module_key)
);

CREATE INDEX IF NOT EXISTS idx_automation_configs_user ON automation_configs(crm_user_id);

-- ==================== AUTOMATION EXECUTION LOGS ====================
CREATE TABLE IF NOT EXISTS automation_execution_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crm_user_id UUID NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
    module_key VARCHAR(50),
    trigger_source VARCHAR(100),
    input_data JSONB,
    output_data JSONB,
    status VARCHAR(50),
    error_message TEXT,
    execution_time_ms INTEGER,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_logs_user ON automation_execution_logs(crm_user_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_module ON automation_execution_logs(module_key);
CREATE INDEX IF NOT EXISTS idx_automation_logs_executed ON automation_execution_logs(executed_at DESC);

-- ==================== USER AUTOMATION MODULES ====================
CREATE TABLE IF NOT EXISTS user_automation_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crm_user_id UUID NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
    
    module_key VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    category VARCHAR(50),
    
    config_schema JSONB DEFAULT '{}',
    required_credentials JSONB DEFAULT '[]',
    
    workflow_id VARCHAR(64),
    node_id VARCHAR(100),
    node_name VARCHAR(255),
    
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    workflow_version VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    
    UNIQUE(crm_user_id, module_key),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_automation_modules_user ON user_automation_modules(crm_user_id);
CREATE INDEX IF NOT EXISTS idx_user_automation_modules_active ON user_automation_modules(crm_user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_automation_modules_workflow ON user_automation_modules(workflow_id);

-- ==================== EVOLUTION WEBHOOK EVENTS ====================
CREATE TABLE IF NOT EXISTS evolution_webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crm_user_id UUID REFERENCES crm_users(id) ON DELETE CASCADE,
    
    instance_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    
    payload JSONB NOT NULL,
    
    from_phone VARCHAR(50),
    to_phone VARCHAR(50),
    message_body TEXT,
    message_id VARCHAR(255),
    
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evolution_webhooks_instance ON evolution_webhook_events(instance_id);
CREATE INDEX IF NOT EXISTS idx_evolution_webhooks_user ON evolution_webhook_events(crm_user_id);
CREATE INDEX IF NOT EXISTS idx_evolution_webhooks_event_type ON evolution_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_evolution_webhooks_created ON evolution_webhook_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_evolution_webhooks_unprocessed ON evolution_webhook_events(processed, created_at) WHERE processed = false;

-- ==================== TRIGGERS ====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_crm_users_updated_at ON crm_users;
CREATE TRIGGER update_crm_users_updated_at 
    BEFORE UPDATE ON crm_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON contacts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_opportunities_updated_at ON opportunities;
CREATE TRIGGER update_opportunities_updated_at 
    BEFORE UPDATE ON opportunities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_staff_members_updated_at ON staff_members;
CREATE TRIGGER update_staff_members_updated_at 
    BEFORE UPDATE ON staff_members 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION update_automation_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_automation_configs_timestamp ON automation_configs;
CREATE TRIGGER update_automation_configs_timestamp
    BEFORE UPDATE ON automation_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_automation_configs_updated_at();

CREATE OR REPLACE FUNCTION update_user_automation_modules_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_automation_modules_updated_at ON user_automation_modules;
CREATE TRIGGER update_user_automation_modules_updated_at
    BEFORE UPDATE ON user_automation_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_user_automation_modules_timestamp();

-- ==================== SEED DATA ====================
INSERT INTO automation_modules (module_key, name, description, icon, category, required_credentials, config_schema) VALUES
('whatsapp', 'WhatsApp Integration', 'Send and receive WhatsApp messages with AI responses', '💬', 'messaging', '["evolution_api"]', '{
    "properties": {
        "instance_name": {"type": "string", "title": "Instance Name"},
        "auto_reply": {"type": "boolean", "title": "Auto Reply"},
        "ai_model": {"type": "string", "enum": ["gpt-4", "gpt-3.5", "llama3"], "title": "AI Model"}
    }
}'),
('ai_agent', 'AI Assistant', 'Intelligent AI agent for customer interactions', '🤖', 'ai', '["openai"]', '{
    "properties": {
        "system_prompt": {"type": "string", "title": "System Prompt"},
        "temperature": {"type": "number", "minimum": 0, "maximum": 1, "title": "Creativity"},
        "max_tokens": {"type": "integer", "title": "Max Response Length"}
    }
}'),
('rag_agent', 'Knowledge Base (RAG)', 'Context-aware responses using your documents', '📚', 'ai', '["openai", "pinecone"]', '{
    "properties": {
        "index_name": {"type": "string", "title": "Vector Index"},
        "top_k": {"type": "integer", "default": 3, "title": "Context Documents"}
    }
}'),
('email', 'Email Automation', 'Send automated emails and follow-ups', '📧', 'messaging', '["gmail"]', '{
    "properties": {
        "from_email": {"type": "string", "format": "email", "title": "From Email"},
        "signature": {"type": "string", "title": "Email Signature"}
    }
}'),
('sms', 'SMS Notifications', 'Send SMS messages via Twilio', '📱', 'messaging', '["twilio"]', '{
    "properties": {
        "from_number": {"type": "string", "title": "Twilio Phone Number"}
    }
}'),
('calendar', 'Calendar Sync', 'Google Calendar integration with smart scheduling', '📅', 'productivity', '["google_calendar"]', '{
    "properties": {
        "calendar_id": {"type": "string", "title": "Calendar ID"},
        "default_duration": {"type": "integer", "default": 30, "title": "Default Event Duration (min)"}
    }
}'),
('chatbot', 'Website Chatbot', 'Embeddable chat widget for your website', '💭', 'messaging', '[]', '{
    "properties": {
        "widget_color": {"type": "string", "title": "Widget Color"},
        "greeting_message": {"type": "string", "title": "Greeting Message"}
    }
}')
ON CONFLICT (module_key) DO NOTHING;

-- ==================== COMMENTS ====================
COMMENT ON TABLE crm_users IS 'CRM users linked to main Exora platform users';
COMMENT ON TABLE contacts IS 'Customer/patient/client contacts';
COMMENT ON TABLE events IS 'Appointments, meetings, reservations';
COMMENT ON TABLE activities IS 'All communications and interactions';
COMMENT ON TABLE user_automation_modules IS 'Per-user automation catalog discovered from their cloned n8n workflow';
COMMENT ON TABLE evolution_webhook_events IS 'Log of all webhook events received from Evolution API';

