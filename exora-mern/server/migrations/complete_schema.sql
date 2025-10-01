-- ================================================================
-- COMPLETE DATABASE SCHEMA FOR EXORA PROJECT
-- Run this file to create all required tables
-- ================================================================

-- ================================================================
-- 1. USERS TABLE (Authentication)
-- ================================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    usage_type VARCHAR(50) DEFAULT 'business',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

-- ================================================================
-- 2. DASHBOARD DATA TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS dashboard_data (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_info JSONB DEFAULT '{}',
    workflows JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    metrics JSONB DEFAULT '{}',
    is_configured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_data_user_id ON dashboard_data(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_data_updated_at ON dashboard_data(updated_at);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_dashboard_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dashboard_data_updated_at
    BEFORE UPDATE ON dashboard_data
    FOR EACH ROW
    EXECUTE FUNCTION update_dashboard_data_updated_at();

-- ================================================================
-- 3. OAUTH TOKENS TABLE (For Workflow Activation)
-- ================================================================
CREATE TABLE IF NOT EXISTS oauth_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workflow_id VARCHAR(64) NOT NULL,
    provider VARCHAR(32) NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expiry_date TIMESTAMPTZ,
    scope TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, workflow_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user_workflow ON oauth_tokens(user_id, workflow_id);

-- ================================================================
-- 4. USER WORKFLOW INSTANCES TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS user_workflow_instances (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_workflow_id VARCHAR(64) NOT NULL,
    instance_workflow_id VARCHAR(64) NOT NULL,
    status VARCHAR(24) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, source_workflow_id)
);

CREATE INDEX IF NOT EXISTS idx_user_workflow_instances_user ON user_workflow_instances(user_id);

-- ================================================================
-- 5. BUSINESS DISCOVERY SESSIONS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS business_discovery_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) UNIQUE DEFAULT gen_random_uuid()::text,
    session_status VARCHAR(50) DEFAULT 'active',
    discovery_data JSONB DEFAULT '{}',
    conversation_history JSONB DEFAULT '[]',
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discovery_sessions_user_id ON business_discovery_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_discovery_sessions_session_id ON business_discovery_sessions(session_id);

-- ================================================================
-- 6. BUSINESS PROFILES TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS business_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES business_discovery_sessions(id) ON DELETE CASCADE,
    industry VARCHAR(100),
    business_size VARCHAR(50),
    pain_points TEXT[],
    current_tools TEXT[],
    automation_goals TEXT[],
    integration_preferences JSONB DEFAULT '{}',
    workflow_priorities JSONB DEFAULT '{}',
    discovered_workflows JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_session_id ON business_profiles(session_id);

-- ================================================================
-- 7. USER AGENTS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS user_agents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    agent_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_agents_user_id ON user_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_agents_status ON user_agents(status);

-- ================================================================
-- 8. AGENT ACTIVITIES TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS agent_activities (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES user_agents(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_activities_agent_id ON agent_activities(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_activities_user_id ON agent_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_activities_created_at ON agent_activities(created_at);

-- ================================================================
-- 9. WORKFLOW RECOMMENDATIONS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS workflow_recommendations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES business_discovery_sessions(id) ON DELETE CASCADE,
    workflow_type VARCHAR(100) NOT NULL,
    priority_score INTEGER DEFAULT 50,
    recommended_reason TEXT,
    estimated_impact TEXT,
    estimated_setup_time VARCHAR(100),
    setup_complexity INTEGER DEFAULT 3,
    n8n_workflow_json JSONB,
    user_decision VARCHAR(50) DEFAULT 'pending',
    deployed_workflow_id VARCHAR(100),
    webhook_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_recommendations_user_id ON workflow_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_recommendations_session_id ON workflow_recommendations(session_id);
CREATE INDEX IF NOT EXISTS idx_workflow_recommendations_user_decision ON workflow_recommendations(user_decision);

-- ================================================================
-- 10. USER NOTIFICATIONS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS user_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);

-- ================================================================
-- 11. USER STATISTICS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS user_statistics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stat_type VARCHAR(100) NOT NULL,
    value DECIMAL(15,4) NOT NULL DEFAULT 0,
    unit VARCHAR(50),
    period VARCHAR(50) DEFAULT 'total',
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON user_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_statistics_stat_type ON user_statistics(stat_type);
CREATE INDEX IF NOT EXISTS idx_user_statistics_period ON user_statistics(period);
CREATE INDEX IF NOT EXISTS idx_user_statistics_calculated_at ON user_statistics(calculated_at);

-- ================================================================
-- 12. AGENT METRICS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS agent_metrics (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES user_agents(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    metric_type VARCHAR(100) NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_metrics_agent_id ON agent_metrics(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_user_id ON agent_metrics(user_id);

-- ================================================================
-- 13. USER DASHBOARD PREFERENCES TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS user_dashboard_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    widget_config JSONB,
    theme_preferences JSONB,
    notification_settings JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_dashboard_preferences_user_id ON user_dashboard_preferences(user_id);

-- ================================================================
-- 14. AGENT TEMPLATES TABLE (Product Catalog)
-- ================================================================
CREATE TABLE IF NOT EXISTS agent_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    features TEXT[],
    pricing_tier VARCHAR(50) DEFAULT 'basic',
    usage_type VARCHAR(50) DEFAULT 'business',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_templates_category ON agent_templates(category);
CREATE INDEX IF NOT EXISTS idx_agent_templates_is_active ON agent_templates(is_active);

-- Insert default agent templates
INSERT INTO agent_templates (name, description, category, icon, features, pricing_tier) VALUES
('Customer Service Agents', 'Handle complex inquiries, bookings and appointment scheduling autonomously', 'customer_service', '🤖', ARRAY['24/7 Availability', 'Multi-language Support', 'CRM Integration'], 'basic'),
('Sales Process Automation', 'Qualify, nurture, schedule, and negotiate within your parameters', 'sales', '💼', ARRAY['Lead Qualification', 'Follow-up Automation', 'Pipeline Management'], 'pro'),
('Operations Management', 'Predict bottlenecks, allocate resources, and coordinate teams', 'operations', '⚙️', ARRAY['Resource Optimization', 'Predictive Analytics', 'Team Coordination'], 'pro'),
('Data Intelligence Agents', 'Analyze data, spot trends, and surface actionable recommendations', 'data_intelligence', '📊', ARRAY['Real-time Analytics', 'Trend Detection', 'Automated Reporting'], 'enterprise'),
('Automation Consulting', 'Identify high-ROI workflows and ship pilots in weeks, not months', 'consulting', '🔍', ARRAY['Workflow Analysis', 'ROI Assessment', 'Rapid Deployment'], 'pro'),
('Customer Experience', 'Self-serve assistants, knowledge search and proactive support tooling', 'customer_experience', '🎯', ARRAY['Self-Service Portal', 'Knowledge Base', 'Proactive Support'], 'basic')
ON CONFLICT DO NOTHING;

-- ================================================================
-- 15. ACTIVITY LOGS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);

-- ================================================================
-- 16. AUTOMATION WORKFLOWS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS automation_workflows (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    workflow_type VARCHAR(100),
    n8n_workflow_id VARCHAR(100),
    status VARCHAR(50) DEFAULT 'inactive',
    configuration JSONB DEFAULT '{}',
    trigger_config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_workflows_user_id ON automation_workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_status ON automation_workflows(status);

-- ================================================================
-- 17. ENTITY TYPES TABLE (Must be before entities table)
-- ================================================================
CREATE TABLE IF NOT EXISTS entity_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    schema JSONB DEFAULT '{}',
    icon VARCHAR(50),
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entity_types_name ON entity_types(name);

-- ================================================================
-- 18. ENTITIES TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS entities (
    id SERIAL PRIMARY KEY,
    entity_type_id INTEGER REFERENCES entity_types(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    properties JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entities_entity_type_id ON entities(entity_type_id);
CREATE INDEX IF NOT EXISTS idx_entities_user_id ON entities(user_id);
CREATE INDEX IF NOT EXISTS idx_entities_status ON entities(status);

-- ================================================================
-- 19. INTEGRATIONS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS integrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    integration_type VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    credentials JSONB DEFAULT '{}',
    configuration JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(integration_type);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);

-- ================================================================
-- 20. ORGANIZATIONS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    settings JSONB DEFAULT '{}',
    subscription_tier VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- ================================================================
-- 21. SETUP PROGRESS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS setup_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    current_step VARCHAR(100) DEFAULT 'welcome',
    completed_steps JSONB DEFAULT '[]',
    skipped_steps JSONB DEFAULT '[]',
    onboarding_data JSONB DEFAULT '{}',
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_setup_progress_user_id ON setup_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_setup_progress_is_completed ON setup_progress(is_completed);

-- ================================================================
-- 22. SUBDOMAIN CONFIGS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS subdomain_configs (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    custom_domain VARCHAR(255),
    ssl_enabled BOOLEAN DEFAULT FALSE,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subdomain_configs_subdomain ON subdomain_configs(subdomain);
CREATE INDEX IF NOT EXISTS idx_subdomain_configs_org_id ON subdomain_configs(organization_id);

-- ================================================================
-- 23. WORKFLOW TEMPLATES TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS workflow_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    icon VARCHAR(50),
    n8n_template JSONB,
    tags TEXT[],
    difficulty_level VARCHAR(50) DEFAULT 'intermediate',
    estimated_setup_time VARCHAR(50),
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_is_active ON workflow_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_is_featured ON workflow_templates(is_featured);

-- ================================================================
-- FUNCTIONS AND TRIGGERS
-- ================================================================

-- Function to update user statistics automatically
CREATE OR REPLACE FUNCTION update_user_statistics(p_user_id INTEGER)
RETURNS VOID AS $$
DECLARE
    v_active_agents INTEGER;
    v_automated_tasks INTEGER;
BEGIN
    -- Count active agents
    SELECT COUNT(*) INTO v_active_agents
    FROM user_agents 
    WHERE user_id = p_user_id AND status = 'active';

    -- Insert or update active agents statistic
    INSERT INTO user_statistics (user_id, stat_type, value, unit, period, calculated_at)
    VALUES (p_user_id, 'active_agents', v_active_agents, 'count', 'total', NOW())
    ON CONFLICT DO NOTHING;

    -- Count automated tasks
    SELECT COUNT(*) INTO v_automated_tasks
    FROM agent_activities 
    WHERE user_id = p_user_id AND activity_type = 'task_completed';

    -- Insert or update automated tasks statistic
    INSERT INTO user_statistics (user_id, stat_type, value, unit, period, calculated_at)
    VALUES (p_user_id, 'automated_tasks', v_automated_tasks, 'count', 'total', NOW())
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update statistics on agent changes
CREATE OR REPLACE FUNCTION trigger_update_user_statistics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM update_user_statistics(OLD.user_id);
        RETURN OLD;
    ELSE
        PERFORM update_user_statistics(NEW.user_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_on_agent_change
    AFTER INSERT OR UPDATE OR DELETE ON user_agents
    FOR EACH ROW EXECUTE FUNCTION trigger_update_user_statistics();

CREATE TRIGGER update_stats_on_activity_change
    AFTER INSERT OR UPDATE OR DELETE ON agent_activities
    FOR EACH ROW EXECUTE FUNCTION trigger_update_user_statistics();

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================
-- Run these to verify all tables were created:
-- \dt
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Expected 23 tables (matching your existing pgAdmin setup):
-- 1. users
-- 2. dashboard_data
-- 3. oauth_tokens
-- 4. user_workflow_instances
-- 5. business_discovery_sessions
-- 6. business_profiles
-- 7. user_agents
-- 8. agent_activities
-- 9. workflow_recommendations
-- 10. user_notifications
-- 11. user_statistics
-- 12. agent_metrics
-- 13. user_dashboard_preferences
-- 14. agent_templates
-- 15. activity_logs
-- 16. automation_workflows
-- 17. entities
-- 18. entity_types
-- 19. integrations
-- 20. organizations
-- 21. setup_progress
-- 22. subdomain_configs
-- 23. workflow_templates

-- ================================================================
-- END OF SCHEMA
-- ================================================================

-- FIXED: All model-schema mismatches resolved - 2025-10-01
-- - Added usage_type to users and agent_templates
-- - Fixed business_discovery_sessions (session_id auto-generated, session_status, discovery_data, completed_at)
-- - Completely rewrote business_profiles to match model
-- - Added title to agent_activities
-- - Completely rewrote workflow_recommendations to match model
-- - Fixed user_notifications (type, action_url, read_at)
-- - Fixed user_statistics (value, unit, period, calculated_at)
-- - Updated BusinessDiscoverySession.js model to include session_id in all queries

