-- Migration: Create workflow_executions table for execution history
-- Description: Stores execution records for workflow runs with inputs and outputs
-- Created: 2025-10-12

CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL,
  template_workflow_id VARCHAR(255) NOT NULL,
  instance_workflow_id VARCHAR(255) NOT NULL,
  n8n_execution_id VARCHAR(255),
  input_data JSONB NOT NULL,
  output_data JSONB,
  status VARCHAR(50) NOT NULL DEFAULT 'running',
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  execution_time_ms INTEGER,
  trigger_type VARCHAR(50) DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_workflow_executions_user_id 
  ON workflow_executions(user_id);

CREATE INDEX IF NOT EXISTS idx_workflow_executions_template_id 
  ON workflow_executions(template_workflow_id);

CREATE INDEX IF NOT EXISTS idx_workflow_executions_instance_id 
  ON workflow_executions(instance_workflow_id);

CREATE INDEX IF NOT EXISTS idx_workflow_executions_status 
  ON workflow_executions(status);

CREATE INDEX IF NOT EXISTS idx_workflow_executions_created_at 
  ON workflow_executions(created_at DESC);

-- Composite index for user's workflow history
CREATE INDEX IF NOT EXISTS idx_workflow_executions_user_template 
  ON workflow_executions(user_id, template_workflow_id, created_at DESC);

-- Index for n8n execution lookup
CREATE INDEX IF NOT EXISTS idx_workflow_executions_n8n_id 
  ON workflow_executions(n8n_execution_id) 
  WHERE n8n_execution_id IS NOT NULL;

-- Comments
COMMENT ON TABLE workflow_executions IS 
  'Stores execution history for user workflow runs with input/output data';

COMMENT ON COLUMN workflow_executions.template_workflow_id IS 
  'The original template workflow ID from n8n (source)';

COMMENT ON COLUMN workflow_executions.instance_workflow_id IS 
  'The user-specific cloned workflow ID in n8n';

COMMENT ON COLUMN workflow_executions.input_data IS 
  'User-provided inputs for this execution';

COMMENT ON COLUMN workflow_executions.output_data IS 
  'Workflow execution results and output data';

COMMENT ON COLUMN workflow_executions.status IS 
  'Execution status: running, success, error, timeout';

COMMENT ON COLUMN workflow_executions.trigger_type IS 
  'How execution was triggered: manual, api, webhook, scheduled';

