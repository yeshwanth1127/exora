@echo off
echo ==========================================
echo Exora CRM Database Setup (Windows)
echo ==========================================
echo.
echo This will create a fresh exora-crm database
echo.

:: Drop existing database if it exists (start fresh)
echo [1/5] Dropping old database (if exists)...
psql -U postgres -c "DROP DATABASE IF EXISTS \"exora-crm\";" 2>nul
echo.

:: Create new database
echo [2/5] Creating exora-crm database...
psql -U postgres -c "CREATE DATABASE \"exora-crm\";"
if %ERRORLEVEL% NEQ 0 (
    echo Error creating database!
    pause
    exit /b 1
)
echo ✓ Database created
echo.

:: Enable UUID extension
echo [3/5] Enabling UUID extension...
psql -U postgres -d exora-crm -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
echo ✓ Extension enabled
echo.

:: Run schema
echo [4/5] Creating all tables...
psql -U postgres -d exora-crm -f schema.sql
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠ Some errors occurred during schema creation
    echo Trying to fix with fix-schema.sql...
    psql -U postgres -d exora-crm -f fix-schema.sql
)
echo.

:: Verify
echo [5/5] Verifying tables...
psql -U postgres -d exora-crm -c "\dt"
echo.

:: Count tables
echo Counting tables...
psql -U postgres -d exora-crm -c "SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema='public';"
echo.

echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo Your CRM database is ready at:
echo   Database: exora-crm
echo   Server: localhost:5432
echo.
echo You should have 7 tables:
echo   - crm_users
echo   - contacts
echo   - staff_members
echo   - opportunities
echo   - events
echo   - activities
echo   - automation_history
echo.
echo Connection string for backend/.env:
echo   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/exora-crm
echo.
echo Next: Update exora-crm/backend/.env with your settings
pause

