/**
 * Evolution API Health Check Job
 * Monitors all WhatsApp sessions and handles reconnection
 * Runs periodically to ensure sessions stay connected
 */

const { pool } = require('../config/db');
const { getInstanceStatus, restartInstance } = require('../services/evolutionApiService');
const { updateInstanceStatus } = require('../services/whatsappIntegrationService');

/**
 * Check health of all active WhatsApp sessions
 * @returns {Object} Health check results
 */
async function checkAllSessions() {
  try {
    console.log('\n🏥 [HealthCheck] Starting Evolution API session health check...');
    
    // Get all users with Evolution instances
    const result = await pool.query(`
      SELECT 
        id, 
        business_name,
        evolution_instance_id, 
        evolution_instance_status,
        evolution_last_connected_at
      FROM crm_users 
      WHERE evolution_instance_id IS NOT NULL
      AND status = 'active'
    `);
    
    const users = result.rows;
    
    if (users.length === 0) {
      console.log('✅ [HealthCheck] No users with WhatsApp instances');
      return { total: 0, healthy: 0, unhealthy: 0 };
    }
    
    console.log(`📋 [HealthCheck] Checking ${users.length} WhatsApp sessions...`);
    
    const results = {
      total: users.length,
      healthy: 0,
      unhealthy: 0,
      errors: []
    };
    
    for (const user of users) {
      try {
        // Check instance status from Evolution API
        const status = await getInstanceStatus(user.evolution_instance_id);
        
        const isHealthy = status.state === 'open';
        
        if (isHealthy) {
          results.healthy++;
          
          // Update if status changed
          if (user.evolution_instance_status !== 'connected') {
            console.log(`   ✅ ${user.business_name || user.id.substring(0, 8)}: Reconnected`);
            await updateInstanceStatus(user.id, 'open');
          }
        } else {
          results.unhealthy++;
          
          console.log(`   ⚠️  ${user.business_name || user.id.substring(0, 8)}: ${status.state}`);
          
          // Update status if changed
          if (user.evolution_instance_status !== status.state) {
            await updateInstanceStatus(user.id, status.state);
          }
          
          // Try auto-reconnect for 'close' state
          if (status.state === 'close') {
            console.log(`      🔄 Attempting auto-restart...`);
            try {
              await restartInstance(user.evolution_instance_id);
              console.log(`      ✅ Restart initiated`);
            } catch (restartError) {
              console.log(`      ❌ Auto-restart failed: ${restartError.message}`);
            }
          }
        }
        
      } catch (error) {
        results.unhealthy++;
        results.errors.push({
          user_id: user.id,
          business_name: user.business_name,
          instance_id: user.evolution_instance_id,
          error: error.message
        });
        
        console.error(`   ❌ ${user.business_name || user.id.substring(0, 8)}: ${error.message}`);
      }
    }
    
    console.log('\n✅ [HealthCheck] Complete');
    console.log(`   Healthy: ${results.healthy}/${results.total}`);
    console.log(`   Unhealthy: ${results.unhealthy}/${results.total}\n`);
    
    return results;
    
  } catch (error) {
    console.error('❌ [HealthCheck] Health check failed:', error);
    throw error;
  }
}

/**
 * Start health check interval
 * Checks every 5 minutes
 */
function startHealthCheckJob() {
  const INTERVAL = 5 * 60 * 1000; // 5 minutes
  
  console.log('🏥 [HealthCheck] Starting Evolution API health monitoring (every 5 minutes)');
  
  // Run after 30 seconds (give server time to fully start)
  setTimeout(() => {
    checkAllSessions().catch(err => {
      console.error('[HealthCheck] Initial check error:', err);
    });
  }, 30000);
  
  // Then run periodically
  setInterval(() => {
    checkAllSessions().catch(err => {
      console.error('[HealthCheck] Periodic check error:', err);
    });
  }, INTERVAL);
}

module.exports = {
  checkAllSessions,
  startHealthCheckJob
};


