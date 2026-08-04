-- Step 2: Create link between exora-web and exora-crm databases
-- This allows CRM to reference users from the main Exora database
--
-- Run this in exora-crm database:
-- psql -U postgres -d exora-crm -f exora-crm/database/02-create-link-to-exora.sql

-- Option 1: Foreign Data Wrapper (if you need live data sync)
-- This allows CRM to query users table from exora-web database

-- Enable postgres_fdw extension
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

-- Create foreign server pointing to exora-web database
CREATE SERVER IF NOT EXISTS exora_web_server
    FOREIGN DATA WRAPPER postgres_fdw
    OPTIONS (host 'localhost', port '5432', dbname 'exora-web');

-- Create user mapping (update with your actual credentials)
CREATE USER MAPPING IF NOT EXISTS FOR postgres
    SERVER exora_web_server
    OPTIONS (user 'postgres', password 'your_postgres_password');

-- Import users table from exora-web
IMPORT FOREIGN SCHEMA public LIMIT TO (users)
    FROM SERVER exora_web_server
    INTO public;

-- Now you can query: SELECT * FROM users
-- This will query the users table from exora-web database

-- Test the connection
SELECT 'Foreign data wrapper configured successfully!' as status;
SELECT COUNT(*) as total_exora_users FROM users;

