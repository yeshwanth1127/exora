#!/bin/bash

# ===============================================================================
# CRM DATABASE CHECK AND RECOVERY SCRIPT
# Checks if critical tables exist and recreates schema if needed
# ===============================================================================

echo "==============================================================================="
echo "CRM DATABASE RECOVERY SCRIPT"
echo "==============================================================================="
echo ""

# Database name
DB_NAME="exora-crm"

# Function to check if table exists
check_table() {
    local table_name=$1
    sudo -u postgres psql -d $DB_NAME -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '$table_name');"
}

# Function to count rows in table
count_rows() {
    local table_name=$1
    sudo -u postgres psql -d $DB_NAME -tAc "SELECT COUNT(*) FROM $table_name;" 2>/dev/null || echo "0"
}

echo "Step 1: Checking critical CRM tables..."
echo "───────────────────────────────────────────────────────────────────────────"

# Check critical tables
CRM_USERS_EXISTS=$(check_table "crm_users")
CONTACTS_EXISTS=$(check_table "contacts")
EVENTS_EXISTS=$(check_table "events")
ACTIVITIES_EXISTS=$(check_table "activities")
AUTOMATION_MODULES_EXISTS=$(check_table "automation_modules")
USER_AUTOMATION_MODULES_EXISTS=$(check_table "user_automation_modules")

echo "crm_users: $CRM_USERS_EXISTS"
echo "contacts: $CONTACTS_EXISTS"
echo "events: $EVENTS_EXISTS"
echo "activities: $ACTIVITIES_EXISTS"
echo "automation_modules: $AUTOMATION_MODULES_EXISTS"
echo "user_automation_modules: $USER_AUTOMATION_MODULES_EXISTS"
echo ""

# If any critical table is missing, run recovery
if [ "$CRM_USERS_EXISTS" = "f" ] || [ "$CONTACTS_EXISTS" = "f" ] || [ "$AUTOMATION_MODULES_EXISTS" = "f" ]; then
    echo "⚠️  CRITICAL TABLES MISSING!"
    echo ""
    echo "Step 2: Running database recovery..."
    echo "───────────────────────────────────────────────────────────────────────────"
    
    # Run recovery script
    sudo -u postgres psql -d $DB_NAME -f recover-crm-database.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ Database schema recreated successfully"
    else
        echo "❌ Recovery failed! Check errors above"
        exit 1
    fi
else
    echo "✅ All critical tables exist"
    
    # Count rows to verify data
    echo ""
    echo "Step 2: Checking data integrity..."
    echo "───────────────────────────────────────────────────────────────────────────"
    
    CRM_USERS_COUNT=$(count_rows "crm_users")
    CONTACTS_COUNT=$(count_rows "contacts")
    AUTOMATION_MODULES_COUNT=$(count_rows "automation_modules")
    USER_AUTOMATION_MODULES_COUNT=$(count_rows "user_automation_modules")
    
    echo "crm_users: $CRM_USERS_COUNT rows"
    echo "contacts: $CONTACTS_COUNT rows"
    echo "automation_modules: $AUTOMATION_MODULES_COUNT rows"
    echo "user_automation_modules: $USER_AUTOMATION_MODULES_COUNT rows"
    
    if [ "$CRM_USERS_COUNT" = "0" ]; then
        echo ""
        echo "⚠️  WARNING: crm_users table is EMPTY!"
        echo "   Your user data was lost. You need to re-activate CRM from Exora dashboard."
    fi
fi

echo ""
echo "Step 3: Final verification..."
echo "───────────────────────────────────────────────────────────────────────────"

# List all CRM tables
echo "CRM tables in database:"
sudo -u postgres psql -d $DB_NAME -c "\dt" | grep -E "(crm_users|contacts|events|activities|automation|evolution)"

echo ""
echo "==============================================================================="
echo "RECOVERY COMPLETE"
echo "==============================================================================="
echo ""
echo "Next steps:"
echo "1. If crm_users is empty, you lost your user data"
echo "2. You need to re-activate CRM from Exora dashboard to recreate user"
echo "3. Evolution API should use SEPARATE database (evolution)"
echo ""
echo "To prevent this in future:"
echo "  - NEVER use 'prisma db push' on a database with existing data"
echo "  - ALWAYS backup before testing new integrations"
echo "  - Use separate databases for separate services"
echo ""


