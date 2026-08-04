/**
 * Test Script for Dynamic Automation System
 * 
 * Usage:
 * node test-automation-sync.js [crm_user_id]
 * 
 * If no user ID provided, uses first active user
 */

require('dotenv').config();
const { pool } = require('./config/db');
const { syncUserAutomations, getUserAutomationCatalog } = require('./services/userAutomationSyncService');

async function testSync() {
  try {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🧪 Dynamic Automation System - Test Script');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Get user ID from command line or use first active user
    let crmUserId = process.argv[2];
    
    if (!crmUserId) {
      console.log('No user ID provided, using first active user...\n');
      
      const userResult = await pool.query(`
        SELECT id, business_name, industry, n8n_workflow_id 
        FROM crm_users 
        WHERE status = 'active' AND n8n_workflow_id IS NOT NULL
        LIMIT 1
      `);
      
      if (userResult.rows.length === 0) {
        console.error('❌ No active users with workflow found');
        console.log('\nTo test:');
        console.log('1. Activate CRM from Exora dashboard');
        console.log('2. Run: node test-automation-sync.js [crm_user_id]');
        process.exit(1);
      }
      
      const user = userResult.rows[0];
      crmUserId = user.id;
      
      console.log('Selected user:');
      console.log(`  CRM User ID: ${user.id}`);
      console.log(`  Business: ${user.business_name || 'Not set'}`);
      console.log(`  Industry: ${user.industry || 'Not set'}`);
      console.log(`  Workflow ID: ${user.n8n_workflow_id}\n`);
    }
    
    // Test 1: Check environment variables
    console.log('📋 Test 1: Environment Configuration');
    console.log('─'.repeat(60));
    console.log(`N8N_BASE_URL: ${process.env.N8N_BASE_URL || '❌ NOT SET'}`);
    console.log(`N8N_API_KEY: ${process.env.N8N_API_KEY ? '✅ SET' : '❌ NOT SET'}`);
    console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ SET' : '❌ NOT SET'}`);
    
    if (!process.env.N8N_BASE_URL || !process.env.N8N_API_KEY) {
      console.error('\n❌ Required environment variables missing!');
      console.log('Please set N8N_BASE_URL and N8N_API_KEY in .env file');
      process.exit(1);
    }
    console.log('✅ Environment configured correctly\n');
    
    // Test 2: Database connectivity
    console.log('📋 Test 2: Database Connection');
    console.log('─'.repeat(60));
    await pool.query('SELECT 1');
    console.log('✅ Database connected\n');
    
    // Test 3: Check if table exists
    console.log('📋 Test 3: Database Schema');
    console.log('─'.repeat(60));
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_automation_modules'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.error('❌ Table user_automation_modules does not exist!');
      console.log('\nRun migration:');
      console.log('psql -U postgres -d exora-crm -f database/create-user-automation-modules.sql');
      process.exit(1);
    }
    console.log('✅ Table user_automation_modules exists\n');
    
    // Test 4: Check user's current catalog
    console.log('📋 Test 4: Current Automation Catalog');
    console.log('─'.repeat(60));
    const currentCatalog = await getUserAutomationCatalog(crmUserId);
    console.log(`Current modules in catalog: ${currentCatalog.length}`);
    
    if (currentCatalog.length > 0) {
      console.log('\nDiscovered modules:');
      currentCatalog.forEach(mod => {
        console.log(`  • ${mod.icon} ${mod.name} (${mod.module_key})`);
      });
    } else {
      console.log('  (No modules in catalog yet)');
    }
    console.log('');
    
    // Test 5: Run sync
    console.log('📋 Test 5: Sync from n8n Workflow');
    console.log('─'.repeat(60));
    console.log('Starting sync...\n');
    
    const syncResult = await syncUserAutomations(crmUserId);
    
    console.log('\n✅ Sync completed successfully!');
    console.log(`   Modules discovered: ${syncResult.modules_discovered}`);
    console.log(`   Workflow ID: ${syncResult.workflow_id}`);
    console.log(`   Workflow version: ${syncResult.workflow_version || 'N/A'}\n`);
    
    // Test 6: Verify catalog updated
    console.log('📋 Test 6: Verify Catalog Updated');
    console.log('─'.repeat(60));
    const updatedCatalog = await getUserAutomationCatalog(crmUserId);
    console.log(`Modules in catalog: ${updatedCatalog.length}\n`);
    
    if (updatedCatalog.length > 0) {
      console.log('Discovered automation modules:');
      updatedCatalog.forEach(mod => {
        const configFields = Object.keys(mod.config_schema?.properties || {});
        console.log(`\n  ${mod.icon} ${mod.name}`);
        console.log(`     Key: ${mod.module_key}`);
        console.log(`     Category: ${mod.category}`);
        console.log(`     Config fields: ${configFields.join(', ') || 'None'}`);
        console.log(`     Required: ${mod.required_credentials?.join(', ') || 'None'}`);
      });
    }
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\nNext steps:');
    console.log('1. Open CRM: https://crm.exora.solutions/automations');
    console.log('2. Verify modules appear in UI');
    console.log('3. Try enabling an automation');
    console.log('4. Check config modal shows correct fields\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n═══════════════════════════════════════════════════════════');
    console.error('❌ TEST FAILED');
    console.error('═══════════════════════════════════════════════════════════');
    console.error('Error:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    console.error('═══════════════════════════════════════════════════════════\n');
    
    process.exit(1);
  }
}

testSync();




