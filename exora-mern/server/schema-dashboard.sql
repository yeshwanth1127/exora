-- Dashboard Dynamic Data Schema
-- This extends the existing users table with user-specific dashboard data

-- User Agents/Deployments Table
CREATE TABLE IF NOT EXISTS user_agents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    agent_type VARCHAR(100) NOT NULL, -- 'customer_service', 'sales', 'operations', 'data_intelligence'
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'paused', 'error'
    configuration JSONB, -- Store agent-specific settings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agent Activities/Events Table
CREATE TABLE IF NOT EXISTS agent_activities (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES user_agents(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL, -- 'task_completed', 'error', 'status_change', 'interaction'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    metadata JSONB, -- Store additional activity data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Statistics Table (for caching and quick access)
CREATE TABLE IF NOT EXISTS user_statistics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    stat_type VARCHAR(100) NOT NULL, -- 'active_agents', 'automated_tasks', 'time_saved', 'success_rate'
    value DECIMAL(15,2) NOT NULL,
    unit VARCHAR(50), -- 'count', 'hours', 'percentage'
    period VARCHAR(50) DEFAULT 'total', -- 'total', 'daily', 'weekly', 'monthly'
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, stat_type, period)
);

-- Agent Performance Metrics
CREATE TABLE IF NOT EXISTS agent_metrics (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES user_agents(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    metric_type VARCHAR(100) NOT NULL, -- 'tasks_completed', 'response_time', 'accuracy', 'uptime'
    value DECIMAL(15,4) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Notifications/Alerts
CREATE TABLE IF NOT EXISTS user_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- 'info', 'warning', 'error', 'success'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500), -- Optional link for user action
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE
);

-- User Dashboard Preferences
CREATE TABLE IF NOT EXISTS user_dashboard_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    widget_config JSONB, -- Store dashboard layout and preferences
    theme_preferences JSONB, -- Store user's theme preferences
    notification_settings JSONB, -- Store notification preferences
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Agent Templates/Products (static catalog)
CREATE TABLE IF NOT EXISTS agent_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'customer_service', 'sales', 'operations', 'data_intelligence'
    icon VARCHAR(50), -- emoji or icon identifier
    features TEXT[], -- Array of feature descriptions
    pricing_tier VARCHAR(50) DEFAULT 'basic', -- 'basic', 'pro', 'enterprise'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default agent templates
INSERT INTO agent_templates (name, description, category, icon, features, pricing_tier) VALUES
('Customer Service Agents', 'Handle complex inquiries, bookings and appointment scheduling autonomously', 'customer_service', '🤖', ARRAY['24/7 Availability', 'Multi-language Support', 'CRM Integration'], 'basic'),
('Sales Process Automation', 'Qualify, nurture, schedule, and negotiate within your parameters', 'sales', '💼', ARRAY['Lead Qualification', 'Follow-up Automation', 'Pipeline Management'], 'pro'),
('Operations Management', 'Predict bottlenecks, allocate resources, and coordinate teams', 'operations', '⚙️', ARRAY['Resource Optimization', 'Predictive Analytics', 'Team Coordination'], 'pro'),
('Data Intelligence Agents', 'Analyze data, spot trends, and surface actionable recommendations', 'data_intelligence', '📊', ARRAY['Real-time Analytics', 'Trend Detection', 'Automated Reporting'], 'enterprise'),
('Automation Consulting', 'Identify high-ROI workflows and ship pilots in weeks, not months', 'consulting', '🔍', ARRAY['Workflow Analysis', 'ROI Assessment', 'Rapid Deployment'], 'pro'),
('Customer Experience', 'Self-serve assistants, knowledge search and proactive support tooling', 'customer_experience', '🎯', ARRAY['Self-Service Portal', 'Knowledge Base', 'Proactive Support'], 'basic');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_agents_user_id ON user_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_agents_status ON user_agents(status);
CREATE INDEX IF NOT EXISTS idx_agent_activities_user_id ON agent_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_activities_created_at ON agent_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON user_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_agent_id ON agent_metrics(agent_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_agent_templates_category ON agent_templates(category);
CREATE INDEX IF NOT EXISTS idx_agent_templates_is_active ON agent_templates(is_active);

-- Create function to update user statistics
CREATE OR REPLACE FUNCTION update_user_statistics(p_user_id INTEGER)
RETURNS VOID AS $$
BEGIN
    -- Update active agents count
    INSERT INTO user_statistics (user_id, stat_type, value, unit, period)
    SELECT p_user_id, 'active_agents', COUNT(*), 'count', 'total'
    FROM user_agents 
    WHERE user_id = p_user_id AND status = 'active'
    ON CONFLICT (user_id, stat_type, period) 
    DO UPDATE SET value = EXCLUDED.value, calculated_at = CURRENT_TIMESTAMP;

    -- Update automated tasks count (from activities)
    INSERT INTO user_statistics (user_id, stat_type, value, unit, period)
    SELECT p_user_id, 'automated_tasks', COUNT(*), 'count', 'total'
    FROM agent_activities 
    WHERE user_id = p_user_id AND activity_type = 'task_completed'
    ON CONFLICT (user_id, stat_type, period) 
    DO UPDATE SET value = EXCLUDED.value, calculated_at = CURRENT_TIMESTAMP;

    -- Update time saved (calculated from agent metrics)
    INSERT INTO user_statistics (user_id, stat_type, value, unit, period)
    SELECT p_user_id, 'time_saved', 
           COALESCE(SUM(CASE WHEN metric_type = 'time_saved' THEN value ELSE 0 END), 0), 
           'hours', 'total'
    FROM agent_metrics 
    WHERE user_id = p_user_id
    ON CONFLICT (user_id, stat_type, period) 
    DO UPDATE SET value = EXCLUDED.value, calculated_at = CURRENT_TIMESTAMP;

    -- Update success rate (calculated from agent metrics)
    INSERT INTO user_statistics (user_id, stat_type, value, unit, period)
    SELECT p_user_id, 'success_rate',
           COALESCE(AVG(CASE WHEN metric_type = 'success_rate' THEN value ELSE NULL END), 0),
           'percentage', 'total'
    FROM agent_metrics 
    WHERE user_id = p_user_id
    ON CONFLICT (user_id, stat_type, period) 
    DO UPDATE SET value = EXCLUDED.value, calculated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update statistics when agents change
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

CREATE TRIGGER update_stats_on_metric_change
    AFTER INSERT OR UPDATE OR DELETE ON agent_metrics
    FOR EACH ROW EXECUTE FUNCTION trigger_update_user_statistics();

