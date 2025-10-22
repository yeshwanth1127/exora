/**
 * Internal API Routes
 * For server-to-server communication (not exposed to public)
 */

const express = require('express');
const { syncUserAutomations } = require('../services/userAutomationSyncService');

const router = express.Router();

/**
 * POST /api/internal/sync-user-automations
 * Triggered by main Exora backend after workflow cloning
 * No auth required - internal request only
 */
router.post('/sync-user-automations', async (req, res) => {
  try {
    const { crm_user_id, workflow_id } = req.body;
    
    // Validate internal request header (optional security)
    const isInternal = req.headers['x-internal-request'] === 'true';
    if (!isInternal) {
      console.warn('[Internal] Sync request without internal header');
      // Still allow for now - can add strict checking later
    }
    
    if (!crm_user_id) {
      return res.status(400).json({
        success: false,
        error: 'crm_user_id is required'
      });
    }
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔧 [Internal] Sync request received');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('CRM User ID:', crm_user_id);
    console.log('Workflow ID:', workflow_id);
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Trigger sync
    const result = await syncUserAutomations(crm_user_id);
    
    res.json({
      success: true,
      message: 'User automations synced successfully',
      ...result
    });
    
  } catch (error) {
    console.error('[Internal] Sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;


