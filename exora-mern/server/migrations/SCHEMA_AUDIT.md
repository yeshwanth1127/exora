# SCHEMA AUDIT - MODEL vs DATABASE

## CRITICAL MISMATCHES FOUND

### ❌ AGENT_ACTIVITIES TABLE
**Model expects:**
- `title` (VARCHAR) - **MISSING IN SCHEMA**

**Schema has:**
- `description` (TEXT)
- `metadata` (JSONB)

**Fix Required:** Add `title` column

---

### ❌ BUSINESS_PROFILES TABLE
**Model expects:**
- `session_id` (INTEGER REFERENCES business_discovery_sessions)
- `business_size` (VARCHAR)
- `pain_points` (TEXT[]) - Array type
- `current_tools` (TEXT[]) - Array type
- `automation_goals` (TEXT[]) - Array type
- `integration_preferences` (JSONB)
- `workflow_priorities` (JSONB)
- `discovered_workflows` (JSONB)

**Schema has:**
- `business_name` (VARCHAR)
- `industry` (VARCHAR)
- `business_type` (VARCHAR)
- `employee_count` (VARCHAR)
- `business_description` (TEXT)
- `pain_points` (JSONB) - Wrong type
- `goals` (JSONB)

**Fix Required:** Complete table rewrite

---

### ❌ WORKFLOW_RECOMMENDATIONS TABLE
**Model expects:**
- `session_id` (VARCHAR or INTEGER REFERENCES business_discovery_sessions)
- `workflow_type` (VARCHAR)
- `priority_score` (INTEGER)
- `recommended_reason` (TEXT)
- `estimated_impact` (TEXT)
- `estimated_setup_time` (VARCHAR)
- `setup_complexity` (INTEGER)
- `n8n_workflow_json` (JSONB)
- `user_decision` (VARCHAR)
- `deployed_workflow_id` (VARCHAR)
- `webhook_url` (VARCHAR)

**Schema has:**
- `workflow_id` (VARCHAR)
- `workflow_name` (VARCHAR)
- `recommendation_reason` (TEXT)
- `priority` (VARCHAR)
- `status` (VARCHAR)

**Fix Required:** Complete table rewrite

---

### ❌ USER_NOTIFICATIONS TABLE
**Model expects:**
- `type` (VARCHAR)
- `action_url` (VARCHAR)
- `read_at` (TIMESTAMPTZ)

**Schema has:**
- `notification_type` (VARCHAR)
- `metadata` (JSONB) - Not used by model
- No `action_url`
- No `read_at`

**Fix Required:** Rename column, add missing columns

---

### ❌ USER_STATISTICS TABLE
**Model expects:**
- `value` (DECIMAL) - Single numeric value
- `unit` (VARCHAR)
- `period` (VARCHAR)
- `calculated_at` (TIMESTAMPTZ)

**Schema has:**
- `stat_value` (JSONB) - Wrong type
- `recorded_at` (TIMESTAMPTZ)

**Fix Required:** Change column types

---

## ✅ TABLES THAT MATCH (No changes needed)
1. users ✅
2. dashboard_data ✅
3. oauth_tokens ✅
4. user_workflow_instances ✅
5. business_discovery_sessions ✅
6. user_agents ✅
7. agent_metrics ✅
8. user_dashboard_preferences ✅
9. agent_templates ✅

## 🔵 TABLES NOT USED BY MODELS (But in schema - OK to keep)
- activity_logs (utility table)
- automation_workflows (utility table)
- entity_types (utility table)
- entities (utility table)
- integrations (utility table)
- organizations (utility table)
- setup_progress (utility table)
- subdomain_configs (utility table)
- workflow_templates (utility table)

---

## TOTAL FIXES REQUIRED: 5 TABLES

