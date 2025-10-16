-- Step 1: Create exora-crm database
-- Run this as PostgreSQL superuser (postgres)
-- Command: psql -U postgres -f exora-crm/database/01-create-database.sql

-- Create database
CREATE DATABASE "exora-crm"
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Connect to the new database
\c exora-crm

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search

-- Grant privileges to your user (change 'your_user' to your actual user)
-- GRANT ALL PRIVILEGES ON DATABASE "exora-crm" TO your_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;

-- Success message
SELECT 'Database exora-crm created successfully!' as status;

