# Database Migration Guide

## Overview
Complete database schema for the Exora platform with all 23 required tables.

## Files

### 1. `complete_schema.sql`
**Main schema file** - Creates all 23 tables in the correct dependency order.

### 2. `verify_schema.sql`
**Verification script** - Checks if all tables, indexes, and constraints were created correctly.

## Table Dependency Order

The tables are created in the following order to respect foreign key dependencies:

```
1.  users                        (Base table - no dependencies)
2.  dashboard_data               → users
3.  oauth_tokens                 → users
4.  user_workflow_instances      → users
5.  business_discovery_sessions  → users
6.  business_profiles            → users, business_discovery_sessions
7.  user_agents                  → users
8.  agent_activities             → user_agents, users
9.  workflow_recommendations     → users, business_discovery_sessions
10. user_notifications           → users
11. user_statistics              → users
12. agent_metrics                → user_agents, users
13. user_dashboard_preferences   → users
14. agent_templates              (No dependencies)
15. activity_logs                → users
16. automation_workflows         → users
17. entity_types                 (No dependencies - must be before entities)
18. entities                     → entity_types, users
19. integrations                 → users
20. organizations                (No dependencies - must be before subdomain_configs)
21. setup_progress               → users
22. subdomain_configs            → organizations
23. workflow_templates           (No dependencies)
```

## Critical Tables for OAuth Flow

These tables are **essential** for the workflow activation feature:

- **`oauth_tokens`** - Stores encrypted user OAuth credentials
- **`user_workflow_instances`** - Tracks which n8n workflow belongs to which user
- **`dashboard_data`** - Stores user's dashboard configuration and workflow list

## Usage

### On Your VPS:

```bash
# 1. Create the database (if not exists)
sudo -u postgres psql
CREATE DATABASE "exora-web";
\q

# 2. Navigate to migrations directory
cd ~/exora/exora/exora-mern/server/migrations

# 3. Run the complete schema
psql -U postgres -d exora-web -f complete_schema.sql

# 4. Verify everything was created correctly
psql -U postgres -d exora-web -f verify_schema.sql

# 5. List all tables
psql -U postgres -d exora-web -c "\dt"
```

### Expected Output:

```
List of relations
 Schema |             Name                | Type  |  Owner
--------+---------------------------------+-------+----------
 public | activity_logs                   | table | postgres
 public | agent_activities                | table | postgres
 public | agent_metrics                   | table | postgres
 public | agent_templates                 | table | postgres
 public | automation_workflows            | table | postgres
 public | business_discovery_sessions     | table | postgres
 public | business_profiles               | table | postgres
 public | dashboard_data                  | table | postgres
 public | entities                        | table | postgres
 public | entity_types                    | table | postgres
 public | integrations                    | table | postgres
 public | organizations                   | table | postgres
 public | oauth_tokens                    | table | postgres
 public | setup_progress                  | table | postgres
 public | subdomain_configs               | table | postgres
 public | user_agents                     | table | postgres
 public | user_dashboard_preferences      | table | postgres
 public | user_notifications              | table | postgres
 public | user_statistics                 | table | postgres
 public | user_workflow_instances         | table | postgres
 public | users                           | table | postgres
 public | workflow_recommendations        | table | postgres
 public | workflow_templates              | table | postgres
(23 rows)
```

## Features

### Automatic Triggers
- `update_dashboard_data_updated_at` - Auto-updates timestamps on dashboard changes
- `update_stats_on_agent_change` - Recalculates user statistics when agents change
- `update_stats_on_activity_change` - Updates stats when activities are logged

### Pre-populated Data
- **Agent Templates**: 6 default product templates are inserted automatically

### Security Features
- OAuth tokens are encrypted using AES-256-GCM (see `OAuthTokens.js` model)
- All sensitive foreign keys have `ON DELETE CASCADE` for data integrity
- Comprehensive indexing for performance

## Troubleshooting

### Error: "relation does not exist"
**Cause**: Tables created in wrong order  
**Solution**: This schema file creates tables in the correct order. Just re-run it.

### Error: "foreign key constraint violation"
**Cause**: Trying to create child records before parent tables exist  
**Solution**: Run `complete_schema.sql` first, then populate data.

### Error: "duplicate key value"
**Cause**: Trying to insert agent templates that already exist  
**Solution**: The schema uses `ON CONFLICT DO NOTHING` - this is safe to ignore.

## Environment Variables Required

Make sure your `.env` file has:

```env
# Database
PGHOST=127.0.0.1
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=exora-web

# OAuth Encryption (must be 32 characters for AES-256)
OAUTH_ENCRYPTION_KEY=your_32_character_encryption_key
```

## Data Models

Each table has a corresponding model in `/server/models/`:

- `User.js`
- `DashboardData.js`
- `OAuthTokens.js`
- `UserWorkflowInstance.js`
- `BusinessDiscoverySession.js`
- `BusinessProfile.js`
- `UserAgent.js`
- `AgentActivity.js`
- `WorkflowRecommendation.js`
- `UserNotification.js`
- `UserStatistics.js`
- `AgentTemplate.js`

## Next Steps After Migration

1. ✅ Run `complete_schema.sql`
2. ✅ Run `verify_schema.sql` to confirm
3. ✅ Start your backend: `pm2 start server.js --name exora-backend`
4. ✅ Test the connection: `curl http://localhost:5000/health`
5. ✅ Test OAuth flow by activating a workflow

## Support

If you encounter any issues:
1. Check the verify script output
2. Review foreign key constraints
3. Ensure PostgreSQL version >= 12 (for JSONB and UUID support)

