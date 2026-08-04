-- =============================================================================
-- Exora: apply all base migrations in order (single entrypoint)
-- =============================================================================
-- Usage (from anywhere):
--   psql -U postgres -d exora-web -f /path/to/migrations/apply_all_migrations.sql
--
-- Or use the shell wrapper (supports DATABASE_URL):
--   ./apply_all_migrations.sh
--
-- Requires: PostgreSQL 14+ (uses EXECUTE FUNCTION in some child scripts)
-- =============================================================================

\set ON_ERROR_STOP on

\echo ''
\echo '>>> 1/5 complete_schema.sql'
\ir complete_schema.sql

\echo ''
\echo '>>> 2/5 add_n8n_credential_ids.sql'
\ir add_n8n_credential_ids.sql

\echo ''
\echo '>>> 3/5 create_activation_sessions.sql'
\ir create_activation_sessions.sql

\echo ''
\echo '>>> 4/5 create_waitlist_table.sql'
\ir create_waitlist_table.sql

\echo ''
\echo '>>> 5/5 create_workflow_executions.sql'
\ir create_workflow_executions.sql

\echo ''
\echo '>>> All migrations applied successfully.'
\echo '>>> Optional: psql -d exora-web -f verify_schema.sql'
\echo ''
