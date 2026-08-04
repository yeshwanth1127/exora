@echo off
REM Database Integration Script for Business Discovery Tables
REM This script integrates the new discovery tables into your existing exora-web database

echo 🚀 Starting Business Discovery Tables Integration...
echo ==================================================

REM Check if psql is available
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ psql command not found. Please install PostgreSQL client tools.
    pause
    exit /b 1
)

REM Check if database exists
echo 🔍 Checking database connection...
psql -U postgres -d exora-web -c "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Cannot connect to exora-web database.
    echo 💡 Make sure PostgreSQL is running and the database exists.
    pause
    exit /b 1
)

echo ✅ Database connection successful

REM Check if users table exists
echo 🔍 Checking for users table...
psql -U postgres -d exora-web -c "SELECT 1 FROM users LIMIT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Users table not found in exora-web database.
    echo 💡 Please run the main schema.sql first to create the users table.
    pause
    exit /b 1
)

echo ✅ Users table found

REM Run the integration script
echo 📊 Running table integration...
psql -U postgres -d exora-web -f integrate_discovery_tables.sql
if %errorlevel% neq 0 (
    echo ❌ Table integration failed
    pause
    exit /b 1
)

echo ✅ Table integration completed successfully

REM Run verification
echo 🔍 Running verification...
psql -U postgres -d exora-web -f verify_integration.sql
if %errorlevel% neq 0 (
    echo ❌ Verification failed
    pause
    exit /b 1
)

echo ✅ Verification completed successfully

echo.
echo 🎉 Integration Complete!
echo =======================
echo ✅ New tables added to exora-web database
echo ✅ Foreign key relationships established
echo ✅ Indexes created for performance
echo ✅ All tests passed
echo.
echo 📋 Next steps:
echo 1. Update your .env file with database credentials
echo 2. Install dependencies: npm install
echo 3. Test Ollama integration: npm run test:ollama
echo 4. Start the application: npm run dev
echo.
echo 🔗 New tables created:
echo    - business_discovery_sessions
echo    - business_profiles
echo    - workflow_recommendations
echo.
echo 🚀 Ready to test the Business Discovery feature!
echo.
pause

