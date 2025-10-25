-- Evolution API Integration - Add fields to crm_users table
-- Tracks per-user Evolution API instances and connection status

ALTER TABLE crm_users 
ADD COLUMN IF NOT EXISTS evolution_instance_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS evolution_instance_status VARCHAR(50) DEFAULT 'disconnected',
ADD COLUMN IF NOT EXISTS evolution_qr_code TEXT,
ADD COLUMN IF NOT EXISTS evolution_qr_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS evolution_phone_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS evolution_last_connected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS evolution_webhook_url VARCHAR(500);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_crm_users_evolution_instance 
ON crm_users(evolution_instance_id) 
WHERE evolution_instance_id IS NOT NULL;

-- Comments
COMMENT ON COLUMN crm_users.evolution_instance_id IS 'Evolution API instance identifier (usually same as crm_user_id)';
COMMENT ON COLUMN crm_users.evolution_instance_status IS 'Status: disconnected, pending_qr, connecting, connected, error';
COMMENT ON COLUMN crm_users.evolution_qr_code IS 'Base64 QR code for WhatsApp connection';
COMMENT ON COLUMN crm_users.evolution_qr_expires_at IS 'When the QR code expires (typically 40 seconds)';
COMMENT ON COLUMN crm_users.evolution_phone_number IS 'Connected WhatsApp phone number (set after successful connection)';
COMMENT ON COLUMN crm_users.evolution_last_connected_at IS 'Last successful connection timestamp for health monitoring';



