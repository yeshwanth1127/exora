-- ================================================================
-- SCHEMA VERIFICATION SCRIPT
-- Run this AFTER running complete_schema.sql
-- ================================================================

-- Check if all 23 tables exist
DO $$
DECLARE
    table_count INTEGER;
    expected_tables TEXT[] := ARRAY[
        'users', 'dashboard_data', 'oauth_tokens', 'user_workflow_instances',
        'business_discovery_sessions', 'business_profiles', 'user_agents',
        'agent_activities', 'workflow_recommendations', 'user_notifications',
        'user_statistics', 'agent_metrics', 'user_dashboard_preferences',
        'agent_templates', 'activity_logs', 'automation_workflows',
        'entity_types', 'entities', 'integrations', 'organizations',
        'setup_progress', 'subdomain_configs', 'workflow_templates'
    ];
    missing_tables TEXT[];
BEGIN
    -- Count actual tables
    SELECT COUNT(*)
    INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';

    RAISE NOTICE 'Found % tables in database', table_count;

    -- Check for missing tables
    SELECT ARRAY_AGG(expected)
    INTO missing_tables
    FROM UNNEST(expected_tables) AS expected
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = expected
    );

    IF missing_tables IS NOT NULL THEN
        RAISE WARNING 'Missing tables: %', missing_tables;
    ELSE
        RAISE NOTICE '✓ All 23 expected tables exist!';
    END IF;
END $$;

-- Verify foreign key constraints exist
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- Verify critical indexes exist for OAuth flow
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_oauth_tokens_user_workflow') THEN
        RAISE NOTICE '✓ OAuth tokens index exists';
    ELSE
        RAISE WARNING 'Missing: idx_oauth_tokens_user_workflow';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_workflow_instances_user') THEN
        RAISE NOTICE '✓ User workflow instances index exists';
    ELSE
        RAISE WARNING 'Missing: idx_user_workflow_instances_user';
    END IF;
END $$;

-- List all tables with row counts
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verify triggers exist
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;

RAISE NOTICE '
================================================================
VERIFICATION COMPLETE
================================================================
';

