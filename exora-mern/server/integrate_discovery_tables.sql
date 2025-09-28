-- Integration script for Business Discovery tables
-- This script adds the new discovery tables to your existing exora-web database
-- Run with: psql -U postgres -d exora-web -f integrate_discovery_tables.sql

-- Check if users table exists (required for foreign keys)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE EXCEPTION 'Users table does not exist. Please run the main schema.sql first.';
    END IF;
END $$;

-- Business Discovery Sessions
CREATE TABLE IF NOT EXISTS business_discovery_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    session_status VARCHAR(50) DEFAULT 'active', -- active, completed, abandoned
    discovery_data JSONB DEFAULT '{}', -- All discovered business info
    conversation_history JSONB DEFAULT '[]', -- Chat messages
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Discovered Business Profile
CREATE TABLE IF NOT EXISTS business_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES business_discovery_sessions(id) ON DELETE CASCADE,
    industry VARCHAR(100) NOT NULL,
    business_size VARCHAR(50), -- small, medium, large
    pain_points TEXT[],
    current_tools TEXT[],
    automation_goals TEXT[],
    integration_preferences JSONB DEFAULT '{}',
    workflow_priorities JSONB DEFAULT '{}',
    discovered_workflows JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Generated Recommendations
CREATE TABLE IF NOT EXISTS workflow_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES business_discovery_sessions(id) ON DELETE CASCADE,
    workflow_type VARCHAR(100) NOT NULL,
    priority_score INTEGER DEFAULT 50, -- 1-100
    recommended_reason TEXT,
    estimated_impact VARCHAR(100),
    estimated_setup_time VARCHAR(50),
    setup_complexity INTEGER DEFAULT 3, -- 1-5
    n8n_workflow_json JSONB,
    user_decision VARCHAR(50), -- approved, rejected, deferred
    deployed_workflow_id VARCHAR(100), -- N8N workflow ID if deployed
    webhook_url VARCHAR(500), -- N8N webhook URL if applicable
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_business_discovery_sessions_user_id ON business_discovery_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_business_discovery_sessions_status ON business_discovery_sessions(session_status);
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_session_id ON business_profiles(session_id);
CREATE INDEX IF NOT EXISTS idx_workflow_recommendations_user_id ON workflow_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_recommendations_session_id ON workflow_recommendations(session_id);
CREATE INDEX IF NOT EXISTS idx_workflow_recommendations_decision ON workflow_recommendations(user_decision);

-- Add comments for documentation
COMMENT ON TABLE business_discovery_sessions IS 'Tracks user discovery conversations with AI consultant';
COMMENT ON TABLE business_profiles IS 'Stores discovered business information from AI sessions';
COMMENT ON TABLE workflow_recommendations IS 'AI-generated workflow recommendations for N8N deployment';

COMMENT ON COLUMN business_discovery_sessions.session_status IS 'active, completed, or abandoned';
COMMENT ON COLUMN business_discovery_sessions.discovery_data IS 'JSON object containing all discovered business info';
COMMENT ON COLUMN business_discovery_sessions.conversation_history IS 'Array of chat messages between user and AI';

COMMENT ON COLUMN business_profiles.industry IS 'Business industry (e.g., retail, healthcare, consulting)';
COMMENT ON COLUMN business_profiles.business_size IS 'small, medium, or large';
COMMENT ON COLUMN business_profiles.pain_points IS 'Array of identified business pain points';
COMMENT ON COLUMN business_profiles.current_tools IS 'Array of tools currently used by the business';
COMMENT ON COLUMN business_profiles.automation_goals IS 'Array of automation goals identified';

COMMENT ON COLUMN workflow_recommendations.priority_score IS 'Priority score from 1-100';
COMMENT ON COLUMN workflow_recommendations.setup_complexity IS 'Setup complexity from 1-5 stars';
COMMENT ON COLUMN workflow_recommendations.n8n_workflow_json IS 'Complete N8N workflow JSON for deployment';
COMMENT ON COLUMN workflow_recommendations.user_decision IS 'approved, rejected, or deferred';
COMMENT ON COLUMN workflow_recommendations.deployed_workflow_id IS 'N8N workflow ID if successfully deployed';
COMMENT ON COLUMN workflow_recommendations.webhook_url IS 'Generated webhook URL for the deployed workflow';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Business Discovery tables integrated successfully!';
    RAISE NOTICE '📊 Tables created: business_discovery_sessions, business_profiles, workflow_recommendations';
    RAISE NOTICE '🔍 Indexes created for optimal performance';
    RAISE NOTICE '🔗 Foreign key relationships established with users table';
END $$;

