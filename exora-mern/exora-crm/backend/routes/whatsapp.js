/**
 * WhatsApp Management Routes
 * Handles user WhatsApp connection, status, and disconnection
 */

const express = require('express');
const { validateExoraToken, requireCRMActivation } = require('../middleware/auth');
const {
  initializeUserWhatsApp,
  getUserWhatsAppStatus,
  refreshQRCode,
  reconnectUserWhatsApp,
  disconnectUserWhatsApp
} = require('../services/whatsappIntegrationService');

const router = express.Router();

router.use(validateExoraToken);
router.use(requireCRMActivation);

/**
 * POST /api/whatsapp/connect
 * Initialize WhatsApp connection for current user
 */
router.post('/connect', async (req, res) => {
  try {
    const crmUserId = req.user.crm_user_id;
    
    console.log(`[WhatsApp Route] Connect request from user: ${crmUserId}`);
    
    const result = await initializeUserWhatsApp(crmUserId);
    
    res.json(result);
    
  } catch (error) {
    console.error('[WhatsApp Route] Connect error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/whatsapp/status
 * Get WhatsApp connection status for current user
 */
router.get('/status', async (req, res) => {
  try {
    const crmUserId = req.user.crm_user_id;
    
    const status = await getUserWhatsAppStatus(crmUserId);
    
    res.json(status);
    
  } catch (error) {
    console.error('[WhatsApp Route] Status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/whatsapp/refresh-qr
 * Generate new QR code if expired
 */
router.post('/refresh-qr', async (req, res) => {
  try {
    const crmUserId = req.user.crm_user_id;
    
    console.log(`[WhatsApp Route] Refresh QR request from user: ${crmUserId}`);
    
    const result = await refreshQRCode(crmUserId);
    
    res.json(result);
    
  } catch (error) {
    console.error('[WhatsApp Route] Refresh QR error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/whatsapp/reconnect
 * Reconnect WhatsApp (restart instance and generate new QR)
 */
router.post('/reconnect', async (req, res) => {
  try {
    const crmUserId = req.user.crm_user_id;
    
    console.log(`[WhatsApp Route] Reconnect request from user: ${crmUserId}`);
    
    const result = await reconnectUserWhatsApp(crmUserId);
    
    res.json(result);
    
  } catch (error) {
    console.error('[WhatsApp Route] Reconnect error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/whatsapp/disconnect
 * Disconnect WhatsApp for current user
 */
router.delete('/disconnect', async (req, res) => {
  try {
    const crmUserId = req.user.crm_user_id;
    
    console.log(`[WhatsApp Route] Disconnect request from user: ${crmUserId}`);
    
    const result = await disconnectUserWhatsApp(crmUserId);
    
    res.json(result);
    
  } catch (error) {
    console.error('[WhatsApp Route] Disconnect error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;


