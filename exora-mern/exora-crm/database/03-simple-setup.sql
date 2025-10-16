-- SIMPLE SETUP (Alternative to Foreign Data Wrapper)
-- If you don't want to use FDW, just create a local users reference table
--
-- Run this in exora-crm database:
-- psql -U postgres -d exora-crm -f exora-crm/database/03-simple-setup.sql

-- Create a simple reference table for Exora users
-- This stores minimal info, main data stays in exora-web
CREATE TABLE IF NOT EXISTS exora_users_ref (
    id INTEGER PRIMARY KEY,  -- Same as users.id in exora-web
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: When CRM backend validates JWT, it extracts user_id and email
-- We store that info here for quick lookups
-- This avoids needing direct database connection to exora-web

-- Modify crm_users to use this reference
-- (Already handled in schema.sql - uses exora_user_id as INTEGER)

SELECT 'Simple setup complete! CRM will store exora_user_id from JWT.' as status;

