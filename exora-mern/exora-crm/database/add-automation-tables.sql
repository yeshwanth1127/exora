-- Universal Automation CRM - New Tables
-- Run this migration to add automation module support

-- Metadata about available automation modules
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

-- User's enabled modules and their configurations
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

-- Execution logs for analytics
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

CREATE INDEX IF NOT EXISTS idx_automation_configs_user ON automation_configs(crm_user_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_user ON automation_execution_logs(crm_user_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_module ON automation_execution_logs(module_key);
CREATE INDEX IF NOT EXISTS idx_automation_logs_executed ON automation_execution_logs(executed_at DESC);

-- Seed data for available modules
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

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_automation_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_automation_configs_timestamp
    BEFORE UPDATE ON automation_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_automation_configs_updated_at();

