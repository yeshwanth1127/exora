-- User-Specific Automation Modules Table
-- Each user has their own automation catalog based on THEIR cloned workflow
-- This allows different users to have different features/modules

-- Drop existing global table (we'll keep it for now but won't use it)
-- ALTER TABLE automation_modules RENAME TO automation_modules_legacy;

-- Create per-user automation catalog
CREATE TABLE IF NOT EXISTS user_automation_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crm_user_id UUID NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
    
    -- Module definition (parsed from user's workflow)
    module_key VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    category VARCHAR(50),
    
    -- Configuration schema (from their workflow's handler code)
    config_schema JSONB DEFAULT '{}',
    required_credentials JSONB DEFAULT '[]',
    
    -- Workflow tracking
    workflow_id VARCHAR(64),  -- Their cloned workflow ID (e.g., wf-clone-001)
    node_id VARCHAR(100),     -- Handler node ID in their workflow
    node_name VARCHAR(255),   -- Handler node name (e.g., "WhatsApp Handler")
    
    -- Sync metadata
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    workflow_version VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    
    -- Unique constraint: one module per user
    UNIQUE(crm_user_id, module_key),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_automation_modules_user 
ON user_automation_modules(crm_user_id);

CREATE INDEX IF NOT EXISTS idx_user_automation_modules_active 
ON user_automation_modules(crm_user_id, is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_user_automation_modules_workflow 
ON user_automation_modules(workflow_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_automation_modules_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_automation_modules_updated_at
    BEFORE UPDATE ON user_automation_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_user_automation_modules_timestamp();

-- Comments
COMMENT ON TABLE user_automation_modules IS 'Per-user automation catalog discovered from their cloned n8n workflow';
COMMENT ON COLUMN user_automation_modules.crm_user_id IS 'Links to crm_users - each user has their own catalog';
COMMENT ON COLUMN user_automation_modules.workflow_id IS 'n8n workflow ID this module was discovered from';
COMMENT ON COLUMN user_automation_modules.config_schema IS 'JSON Schema for dynamic configuration form generation';


