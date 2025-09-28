-- Verification script for Business Discovery tables integration
-- Run this after integrate_discovery_tables.sql to verify everything is working
-- Run with: psql -U postgres -d exora-web -f verify_integration.sql

-- Check if all required tables exist
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') 
        THEN '✅ users table exists'
        ELSE '❌ users table missing'
    END as users_table_status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_discovery_sessions') 
        THEN '✅ business_discovery_sessions table exists'
        ELSE '❌ business_discovery_sessions table missing'
    END as discovery_sessions_status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_profiles') 
        THEN '✅ business_profiles table exists'
        ELSE '❌ business_profiles table missing'
    END as business_profiles_status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflow_recommendations') 
        THEN '✅ workflow_recommendations table exists'
        ELSE '❌ workflow_recommendations table missing'
    END as workflow_recommendations_status;

-- Check foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('business_discovery_sessions', 'business_profiles', 'workflow_recommendations')
ORDER BY tc.table_name, kcu.column_name;

-- Check indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('business_discovery_sessions', 'business_profiles', 'workflow_recommendations')
ORDER BY tablename, indexname;

-- Check table structures
\d business_discovery_sessions;
\d business_profiles;
\d workflow_recommendations;

-- Test data insertion (optional - creates test data)
DO $$
DECLARE
    test_user_id INTEGER;
    test_session_id UUID;
    test_profile_id UUID;
    test_recommendation_id UUID;
BEGIN
    -- Check if we have any users
    SELECT id INTO test_user_id FROM users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE '🧪 Testing data insertion with user ID: %', test_user_id;
        
        -- Test session creation
        INSERT INTO business_discovery_sessions (user_id, session_status, discovery_data, conversation_history)
        VALUES (test_user_id, 'active', '{"test": "data"}', '[]')
        RETURNING id INTO test_session_id;
        
        RAISE NOTICE '✅ Test session created: %', test_session_id;
        
        -- Test profile creation
        INSERT INTO business_profiles (user_id, session_id, industry, business_size, pain_points, current_tools, automation_goals)
        VALUES (test_user_id, test_session_id, 'retail', 'small', ARRAY['manual processes'], ARRAY['email'], ARRAY['automate emails'])
        RETURNING id INTO test_profile_id;
        
        RAISE NOTICE '✅ Test profile created: %', test_profile_id;
        
        -- Test recommendation creation
        INSERT INTO workflow_recommendations (user_id, session_id, workflow_type, priority_score, recommended_reason, estimated_impact, estimated_setup_time, setup_complexity, n8n_workflow_json)
        VALUES (test_user_id, test_session_id, 'Email Automation', 85, 'Test recommendation', 'Save 2 hours daily', '30 minutes', 3, '{"test": "workflow"}')
        RETURNING id INTO test_recommendation_id;
        
        RAISE NOTICE '✅ Test recommendation created: %', test_recommendation_id;
        
        -- Clean up test data
        DELETE FROM workflow_recommendations WHERE id = test_recommendation_id;
        DELETE FROM business_profiles WHERE id = test_profile_id;
        DELETE FROM business_discovery_sessions WHERE id = test_session_id;
        
        RAISE NOTICE '🧹 Test data cleaned up';
        RAISE NOTICE '🎉 All tests passed! Integration is working correctly.';
        
    ELSE
        RAISE NOTICE '⚠️  No users found in database. Skipping data insertion tests.';
        RAISE NOTICE '💡 Create a user first to test data insertion.';
    END IF;
END $$;

-- Final status
SELECT '🎯 Integration verification complete!' as status;

