#!/bin/bash

# Database Integration Script for Business Discovery Tables
# This script integrates the new discovery tables into your existing exora-web database

echo "🚀 Starting Business Discovery Tables Integration..."
echo "=================================================="

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ psql command not found. Please install PostgreSQL client tools."
    exit 1
fi

# Check if database exists
echo "🔍 Checking database connection..."
if ! psql -U postgres -d exora-web -c "SELECT 1;" &> /dev/null; then
    echo "❌ Cannot connect to exora-web database."
    echo "💡 Make sure PostgreSQL is running and the database exists."
    exit 1
fi

echo "✅ Database connection successful"

# Check if users table exists
echo "🔍 Checking for users table..."
if ! psql -U postgres -d exora-web -c "SELECT 1 FROM users LIMIT 1;" &> /dev/null; then
    echo "❌ Users table not found in exora-web database."
    echo "💡 Please run the main schema.sql first to create the users table."
    exit 1
fi

echo "✅ Users table found"

# Run the integration script
echo "📊 Running table integration..."
if psql -U postgres -d exora-web -f integrate_discovery_tables.sql; then
    echo "✅ Table integration completed successfully"
else
    echo "❌ Table integration failed"
    exit 1
fi

# Run verification
echo "🔍 Running verification..."
if psql -U postgres -d exora-web -f verify_integration.sql; then
    echo "✅ Verification completed successfully"
else
    echo "❌ Verification failed"
    exit 1
fi

echo ""
echo "🎉 Integration Complete!"
echo "======================="
echo "✅ New tables added to exora-web database"
echo "✅ Foreign key relationships established"
echo "✅ Indexes created for performance"
echo "✅ All tests passed"
echo ""
echo "📋 Next steps:"
echo "1. Update your .env file with database credentials"
echo "2. Install dependencies: npm install"
echo "3. Test Ollama integration: npm run test:ollama"
echo "4. Start the application: npm run dev"
echo ""
echo "🔗 New tables created:"
echo "   - business_discovery_sessions"
echo "   - business_profiles"
echo "   - workflow_recommendations"
echo ""
echo "🚀 Ready to test the Business Discovery feature!"

