-- Evolution API Webhook Events Log
-- Stores all webhook events from Evolution API for debugging and audit

CREATE TABLE IF NOT EXISTS evolution_webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crm_user_id UUID REFERENCES crm_users(id) ON DELETE CASCADE,
    
    -- Event details
    instance_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    
    -- Payload data
    payload JSONB NOT NULL,
    
    -- Message details (if message event)
    from_phone VARCHAR(50),
    to_phone VARCHAR(50),
    message_body TEXT,
    message_id VARCHAR(255),
    
    -- Processing status
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_evolution_webhooks_instance 
ON evolution_webhook_events(instance_id);

CREATE INDEX IF NOT EXISTS idx_evolution_webhooks_user 
ON evolution_webhook_events(crm_user_id);

CREATE INDEX IF NOT EXISTS idx_evolution_webhooks_event_type 
ON evolution_webhook_events(event_type);

CREATE INDEX IF NOT EXISTS idx_evolution_webhooks_created 
ON evolution_webhook_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_evolution_webhooks_unprocessed 
ON evolution_webhook_events(processed, created_at) 
WHERE processed = false;

-- Comments
COMMENT ON TABLE evolution_webhook_events IS 'Log of all webhook events received from Evolution API';
COMMENT ON COLUMN evolution_webhook_events.event_type IS 'Event types: messages.upsert, connection.update, qr.updated, etc.';
COMMENT ON COLUMN evolution_webhook_events.processed IS 'Whether the event was successfully processed and routed to n8n';



