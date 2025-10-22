/**
 * Admin Routes for CRM Management
 * Requires admin privileges
 */

const express = require('express');
const { validateExoraToken, requireCRMActivation } = require('../middleware/auth');
const { syncUserAutomations, syncAllUsers } = require('../services/userAutomationSyncService');

const router = express.Router();

router.use(validateExoraToken);
router.use(requireCRMActivation);

// TODO: Add admin check middleware
// For now, any authenticated user can trigger sync
// In production, add: router.use(requireAdminRole);

/**
 * POST /api/admin/sync-automations
 * Manually sync current user's automation catalog from n8n
 */
router.post('/sync-automations', async (req, res) => {
  try {
    const crmUserId = req.user.crm_user_id;
    
    console.log(`[Admin] Manual sync triggered by user: ${crmUserId}`);
    
    const result = await syncUserAutomations(crmUserId);
    
    res.json({
      success: true,
      message: 'Automation catalog synced successfully',
      ...result
    });
    
  } catch (error) {
    console.error('[Admin] Sync error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /api/admin/sync-all-users
 * Sync automation catalogs for all users
 * WARNING: This can take a long time with many users
 */
router.post('/sync-all-users', async (req, res) => {
  try {
    // TODO: Check if user is admin
    
    console.log(`[Admin] Sync all users triggered`);
    
    const result = await syncAllUsers({ onlyActive: true });
    
    res.json({
      success: true,
      message: `Synced ${result.successful}/${result.total} users`,
      ...result
    });
    
  } catch (error) {
    console.error('[Admin] Sync all error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/admin/sync-status
 * Check sync status for current user
 */
router.get('/sync-status', async (req, res) => {
  try {
    const { pool } = require('../config/db');
    const crmUserId = req.user.crm_user_id;
    
    const result = await pool.query(`
      SELECT 
        COUNT(*) as module_count,
        MAX(last_synced_at) as last_sync,
        workflow_id,
        workflow_version
      FROM user_automation_modules
      WHERE crm_user_id = $1
      GROUP BY workflow_id, workflow_version
    `, [crmUserId]);
    
    if (result.rows.length === 0) {
      return res.json({
        synced: false,
        message: 'No automations discovered yet. Click "Refresh" to sync.'
      });
    }
    
    const status = result.rows[0];
    
    res.json({
      synced: true,
      module_count: parseInt(status.module_count),
      last_sync: status.last_sync,
      workflow_id: status.workflow_id,
      workflow_version: status.workflow_version
    });
    
  } catch (error) {
    console.error('[Admin] Status error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


