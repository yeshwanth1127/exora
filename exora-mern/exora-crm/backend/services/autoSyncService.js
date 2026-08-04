/**
 * Auto-Sync Service
 * Ensures all users have their automation catalogs populated
 * Runs automatically in background
 */

const { pool } = require('../config/db');
const { syncUserAutomations } = require('./userAutomationSyncService');

/**
 * Sync users who have workflows but no automation catalog
 * Runs automatically to ensure no user is left without catalog
 */
async function syncUsersWithMissingCatalog() {
  try {
    console.log('\n🔄 [AutoSync] Checking for users with missing catalogs...');
    
    // Find users who have workflow ID but no modules in catalog
    const result = await pool.query(`
      SELECT cu.id, cu.business_name, cu.n8n_workflow_id
      FROM crm_users cu
      WHERE cu.n8n_workflow_id IS NOT NULL
      AND cu.status = 'active'
      AND NOT EXISTS (
        SELECT 1 FROM user_automation_modules uam 
        WHERE uam.crm_user_id = cu.id
      )
    `);
    
    const usersNeedingSync = result.rows;
    
    if (usersNeedingSync.length === 0) {
      console.log('✅ [AutoSync] All users have catalogs');
      return { synced: 0, message: 'No users need sync' };
    }
    
    console.log(`📋 [AutoSync] Found ${usersNeedingSync.length} users needing sync:`);
    usersNeedingSync.forEach(u => {
      console.log(`   • ${u.business_name || 'Unknown'} (${u.id.substring(0, 8)}...)`);
    });
    
    const results = {
      total: usersNeedingSync.length,
      successful: 0,
      failed: 0,
      errors: []
    };
    
    // Sync each user
    for (const user of usersNeedingSync) {
      try {
        console.log(`\n   Syncing: ${user.business_name || user.id}...`);
        await syncUserAutomations(user.id);
        results.successful++;
        console.log(`   ✅ Success`);
      } catch (error) {
        results.failed++;
        results.errors.push({
          user_id: user.id,
          business_name: user.business_name,
          error: error.message
        });
        console.error(`   ❌ Failed: ${error.message}`);
      }
    }
    
    console.log(`\n✅ [AutoSync] Complete: ${results.successful}/${results.total} synced`);
    if (results.failed > 0) {
      console.log(`⚠️  [AutoSync] ${results.failed} failed - check errors`);
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ [AutoSync] Auto-sync failed:', error);
    throw error;
  }
}

/**
 * Start background sync job
 * Checks every 5 minutes for users needing sync
 */
function startAutoSyncJob() {
  const INTERVAL = 5 * 60 * 1000; // 5 minutes
  
  console.log('🔄 [AutoSync] Starting background sync job (every 5 minutes)');
  
  // Run immediately on start
  setTimeout(() => {
    syncUsersWithMissingCatalog().catch(err => {
      console.error('[AutoSync] Background sync error:', err);
    });
  }, 5000); // Wait 5 seconds after server start
  
  // Then run periodically
  setInterval(() => {
    syncUsersWithMissingCatalog().catch(err => {
      console.error('[AutoSync] Background sync error:', err);
    });
  }, INTERVAL);
}

module.exports = {
  syncUsersWithMissingCatalog,
  startAutoSyncJob
};



