-- Fix for schema errors
-- Run this if you got errors during initial setup
-- Command: psql -U postgres -d exora-crm -f fix-schema.sql

-- Drop existing triggers that failed
DROP TRIGGER IF EXISTS update_opportunities_updated_at ON opportunities;
DROP TRIGGER IF EXISTS update_events_updated_at ON events;

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

CREATE INDEX IF NOT EXISTS idx_opportunities_crm_user ON opportunities(crm_user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_contact ON opportunities(contact_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);

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

CREATE INDEX IF NOT EXISTS idx_activities_crm_user ON activities(crm_user_id);
CREATE INDEX IF NOT EXISTS idx_activities_contact ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC);

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

CREATE INDEX IF NOT EXISTS idx_automation_history_crm_user ON automation_history(crm_user_id);
CREATE INDEX IF NOT EXISTS idx_automation_history_executed ON automation_history(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_history_type ON automation_history(automation_type);

-- ==================== TRIGGERS ====================
CREATE TRIGGER update_opportunities_updated_at 
    BEFORE UPDATE ON opportunities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'All tables created successfully!' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

