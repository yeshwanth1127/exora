-- Migration: Add n8n_credential_ids column to user_workflow_instances
-- This column stores the mapping of credential types to n8n credential IDs
-- Run this migration if you're upgrading an existing installation

-- Add the new column if it doesn't exist
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

-- Add a comment for documentation
COMMENT ON COLUMN user_workflow_instances.n8n_credential_ids IS 
'JSON mapping of credential type (e.g., gmailOAuth2Api) to n8n credential ID created for this user';

-- Example of what gets stored:
-- {"gmailOAuth2Api": "123", "googleDriveOAuth2Api": "124", "googleCalendarOAuth2Api": "125"}

