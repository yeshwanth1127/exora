/**
 * User Automation Sync Service
 * Syncs user's automation catalog from their cloned n8n workflow
 * 
 * This service:
 * 1. Queries n8n API to get user's workflow
 * 2. Parses workflow to discover modules
 * 3. Stores modules in user_automation_modules table
 */

const axios = require('axios');
const { pool } = require('../config/db');
const { parseWorkflowModules } = require('./n8nWorkflowParser');

const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY;

/**
 * Create axios instance for n8n API
 */
const n8nApi = axios.create({
  baseURL: `${N8N_BASE_URL}/api/v1`,
  headers: {
    'X-N8N-API-KEY': N8N_API_KEY,
    'Accept': 'application/json'
  },
  timeout: 10000
});

/**
 * Sync automation modules for a specific user from their n8n workflow
 * @param {string} crmUserId - User's CRM UUID
 * @returns {Object} Sync result with discovered modules
 */
async function syncUserAutomations(crmUserId) {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔄 [UserAutomationSync] Starting sync for user:', crmUserId);
  console.log('═══════════════════════════════════════════════════════════');
  
  try {
    // Step 1: Get user's workflow ID from database
    const userResult = await pool.query(
      'SELECT id, n8n_workflow_id, business_name FROM crm_users WHERE id = $1',
      [crmUserId]
    );
    
    if (userResult.rows.length === 0) {
      throw new Error(`User ${crmUserId} not found`);
    }
    
    const user = userResult.rows[0];
    const workflowId = user.n8n_workflow_id;
    
    if (!workflowId) {
      throw new Error(`User ${crmUserId} does not have a workflow instance. Please activate CRM first.`);
    }
    
    console.log(`📋 User: ${user.business_name || 'Unknown'}`);
    console.log(`🔧 Workflow ID: ${workflowId}`);
    
    // Step 2: Fetch workflow from n8n API
    console.log(`\n🌐 Fetching workflow from n8n...`);
    const workflow = await fetchWorkflowFromN8N(workflowId);
    
    console.log(`✅ Workflow fetched: ${workflow.name}`);
    console.log(`   Active: ${workflow.active}`);
    console.log(`   Nodes: ${workflow.nodes?.length || 0}`);
    console.log(`   Version: ${workflow.versionId || 'N/A'}`);
    
    // Step 3: Parse workflow to extract modules
    console.log(`\n🔍 Parsing workflow for automation modules...`);
    const modules = parseWorkflowModules(workflow);
    
    console.log(`✅ Discovered ${modules.length} automation modules`);
    
    // Step 4: Store modules in database
    console.log(`\n💾 Updating database...`);
    await storeUserModules(crmUserId, workflowId, modules, workflow.versionId);
    
    console.log('✅ Database updated successfully');
    
    // Step 5: Return summary
    const summary = {
      success: true,
      crm_user_id: crmUserId,
      workflow_id: workflowId,
      workflow_name: workflow.name,
      workflow_version: workflow.versionId,
      modules_discovered: modules.length,
      modules: modules.map(m => ({
        module_key: m.module_key,
        name: m.name,
        category: m.category
      })),
      synced_at: new Date().toISOString()
    };
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ [UserAutomationSync] Sync completed successfully!');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    return summary;
    
  } catch (error) {
    console.error('═══════════════════════════════════════════════════════════');
    console.error('❌ [UserAutomationSync] Sync failed!');
    console.error('═══════════════════════════════════════════════════════════');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('═══════════════════════════════════════════════════════════\n');
    
    throw error;
  }
}

/**
 * Fetch workflow from n8n API
 * @param {string} workflowId - n8n workflow ID
 * @returns {Object} Workflow definition
 */
async function fetchWorkflowFromN8N(workflowId) {
  try {
    const response = await n8nApi.get(`/workflows/${workflowId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`Workflow ${workflowId} not found in n8n. It may have been deleted.`);
    } else if (error.response?.status === 401) {
      throw new Error('n8n API authentication failed. Check N8N_API_KEY environment variable.');
    } else if (error.code === 'ECONNREFUSED') {
      throw new Error(`Cannot connect to n8n at ${N8N_BASE_URL}. Check N8N_BASE_URL and ensure n8n is running.`);
    }
    throw new Error(`Failed to fetch workflow from n8n: ${error.message}`);
  }
}

/**
 * Store discovered modules in user_automation_modules table
 * @param {string} crmUserId - User's CRM UUID
 * @param {string} workflowId - n8n workflow ID
 * @param {Array} modules - Discovered modules
 * @param {string} workflowVersion - Workflow version ID
 */
async function storeUserModules(crmUserId, workflowId, modules, workflowVersion) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Delete existing modules for this user (clean slate)
    await client.query(
      'DELETE FROM user_automation_modules WHERE crm_user_id = $1',
      [crmUserId]
    );
    
    console.log(`   Cleared existing modules for user ${crmUserId}`);
    
    // Insert discovered modules
    for (const module of modules) {
      await client.query(`
        INSERT INTO user_automation_modules (
          crm_user_id, module_key, name, description, icon, category,
          config_schema, required_credentials, workflow_id, node_id, node_name,
          workflow_version, is_active, last_synced_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, NOW())
      `, [
        crmUserId,
        module.module_key,
        module.name,
        module.description,
        module.icon,
        module.category,
        JSON.stringify(module.config_schema),
        JSON.stringify(module.required_credentials),
        workflowId,
        module.node_id,
        module.node_name,
        workflowVersion || '1.0.0'
      ]);
      
      console.log(`   ✅ Stored: ${module.name} (${module.module_key})`);
    }
    
    await client.query('COMMIT');
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Check if user needs sync (has no modules in catalog)
 * @param {string} crmUserId - User's CRM UUID
 * @returns {boolean} True if sync needed
 */
async function needsSync(crmUserId) {
  const result = await pool.query(
    'SELECT COUNT(*) as count FROM user_automation_modules WHERE crm_user_id = $1',
    [crmUserId]
  );
  
  return parseInt(result.rows[0].count) === 0;
}

/**
 * Get user's automation catalog
 * @param {string} crmUserId - User's CRM UUID
 * @returns {Array} User's available modules
 */
async function getUserAutomationCatalog(crmUserId) {
  const result = await pool.query(`
    SELECT 
      module_key, name, description, icon, category,
      config_schema, required_credentials,
      workflow_id, node_id, node_name,
      last_synced_at, workflow_version, is_active
    FROM user_automation_modules 
    WHERE crm_user_id = $1 AND is_active = true
    ORDER BY category, name
  `, [crmUserId]);
  
  return result.rows;
}

/**
 * Sync all users (for cron job)
 * @param {Object} options - Sync options
 * @returns {Object} Sync summary
 */
async function syncAllUsers(options = {}) {
  console.log('🔄 [UserAutomationSync] Starting sync for all users...');
  
  const { onlyActive = true } = options;
  
  // Get all users with workflow IDs
  const whereClause = onlyActive ? "WHERE status = 'active' AND n8n_workflow_id IS NOT NULL" : "WHERE n8n_workflow_id IS NOT NULL";
  const usersResult = await pool.query(`
    SELECT id, business_name, n8n_workflow_id 
    FROM crm_users 
    ${whereClause}
  `);
  
  const users = usersResult.rows;
  console.log(`Found ${users.length} users to sync`);
  
  const results = {
    total: users.length,
    successful: 0,
    failed: 0,
    errors: []
  };
  
  for (const user of users) {
    try {
      await syncUserAutomations(user.id);
      results.successful++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        user_id: user.id,
        business_name: user.business_name,
        error: error.message
      });
    }
  }
  
  console.log(`✅ Sync complete: ${results.successful} successful, ${results.failed} failed`);
  
  return results;
}

module.exports = {
  syncUserAutomations,
  needsSync,
  getUserAutomationCatalog,
  syncAllUsers,
  fetchWorkflowFromN8N
};


