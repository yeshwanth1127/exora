-- Migration: Create activation_sessions table for multi-provider activation flow
-- Description: Stores temporary session data during multi-step OAuth activation
-- Created: 2025-10-12

CREATE TABLE IF NOT EXISTS activation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL,
  workflow_id VARCHAR(255) NOT NULL,
  providers_required JSONB NOT NULL,
  providers_completed JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'pending',
  session_data JSONB,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 minutes',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_activation_sessions_user_id 
  ON activation_sessions(user_id);

-- Index for faster lookups by workflow_id
CREATE INDEX IF NOT EXISTS idx_activation_sessions_workflow_id 
  ON activation_sessions(workflow_id);

-- Index for cleanup of expired sessions
CREATE INDEX IF NOT EXISTS idx_activation_sessions_expires_at 
  ON activation_sessions(expires_at);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_activation_sessions_status 
  ON activation_sessions(status);

-- Composite index for active user sessions
CREATE INDEX IF NOT EXISTS idx_activation_sessions_user_status 
  ON activation_sessions(user_id, status) 
  WHERE status IN ('pending', 'in_progress');

-- Add comment to document table purpose
COMMENT ON TABLE activation_sessions IS 
  'Stores temporary session state during multi-provider workflow activation. Sessions expire after 30 minutes.';

COMMENT ON COLUMN activation_sessions.providers_required IS 
  'JSON array of provider objects with { credentialType, provider, type, scopes, required }';

COMMENT ON COLUMN activation_sessions.providers_completed IS 
  'JSON array of completed provider credential types';

COMMENT ON COLUMN activation_sessions.session_data IS 
  'Additional session metadata like OAuth tokens, original activation context, etc.';

COMMENT ON COLUMN activation_sessions.status IS 
  'Session status: pending, in_progress, completed, failed, expired';

