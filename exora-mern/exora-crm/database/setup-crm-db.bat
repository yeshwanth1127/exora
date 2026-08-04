@echo off
echo ==========================================
echo Exora CRM Database Setup (Windows)
echo ==========================================
echo.

echo [1/4] Creating exora-crm database...
psql -U postgres -c "CREATE DATABASE \"exora-crm\";"
if %ERRORLEVEL% NEQ 0 (
    echo Note: Database might already exist, continuing...
)
echo.

echo [2/4] Enabling UUID extension...
psql -U postgres -d exora-crm -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
echo.

echo [3/4] Running schema (creating tables)...
psql -U postgres -d exora-crm -f schema.sql
echo.

echo [4/4] Verifying tables created...
psql -U postgres -d exora-crm -c "\dt"
echo.

echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo Your CRM database is ready at:
echo   Database: exora-crm
echo   Server: localhost:5432
echo.
echo Connection string:
echo   postgresql://postgres:YOUR_PASSWORD@localhost:5432/exora-crm
echo.
echo Next step: Update exora-crm/backend/.env with this connection string
pause

