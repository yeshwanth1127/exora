-- Migration: Create user_workflow_instances table or update it with n8n_credential_ids
-- This migration handles both scenarios:
-- 1. Table doesn't exist - creates it with all columns
-- 2. Table exists - adds n8n_credential_ids column if missing

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_workflow_instances (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  source_workflow_id VARCHAR(64) NOT NULL,
  instance_workflow_id VARCHAR(64) NOT NULL,
  status VARCHAR(24) DEFAULT 'active',
  activated_at TIMESTAMPTZ,
  services_used TEXT[] DEFAULT '{}',
  credential_id VARCHAR(128),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, source_workflow_id)
);

-- Add n8n_credential_ids column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'user_workflow_instances' 
    AND column_name = 'n8n_credential_ids'
  ) THEN
    ALTER TABLE user_workflow_instances 
    ADD COLUMN n8n_credential_ids JSONB;
    
    RAISE NOTICE 'Added n8n_credential_ids column to user_workflow_instances';
  ELSE
    RAISE NOTICE 'Column n8n_credential_ids already exists';
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN user_workflow_instances.n8n_credential_ids IS 
'JSON mapping of credential type (e.g., gmailOAuth2) to n8n credential ID created for this user';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_workflow_instances_user_id 
ON user_workflow_instances(user_id);

CREATE INDEX IF NOT EXISTS idx_user_workflow_instances_source_workflow_id 
ON user_workflow_instances(source_workflow_id);

-- Display success message
DO $$ 
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE 'Table: user_workflow_instances';
  RAISE NOTICE 'Column n8n_credential_ids: Ready';
END $$;

