/**
 * WhatsApp Integration Service
 * Business logic layer for Evolution API integration
 * Handles user WhatsApp connection lifecycle
 */

const { pool } = require('../config/db');
const evolutionApi = require('./evolutionApiService');

const WEBHOOK_BASE_URL = process.env.EVOLUTION_WEBHOOK_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://crm-api.exora.solutions/api/webhooks/evolution'
    : 'http://localhost:8000/api/webhooks/evolution');

/**
 * Initialize WhatsApp connection for user
 * Creates Evolution instance and generates QR code
 * @param {string} crmUserId - CRM user UUID
 * @returns {Object} QR code and status
 */
async function initializeUserWhatsApp(crmUserId) {
  try {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📱 [WhatsApp] Initializing connection for user:', crmUserId);
    console.log('═══════════════════════════════════════════════════════════');
    
    // Check if user already has an instance
    const userResult = await pool.query(
      'SELECT evolution_instance_id, evolution_instance_status FROM crm_users WHERE id = $1',
      [crmUserId]
    );
    
    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const existingInstance = userResult.rows[0].evolution_instance_id;
    const existingStatus = userResult.rows[0].evolution_instance_status;
    
    // If already connected, just return status
    if (existingInstance && existingStatus === 'connected') {
      console.log('[WhatsApp] User already has connected instance:', existingInstance);
      const status = await evolutionApi.getInstanceStatus(existingInstance);
      
      if (status.state === 'open') {
        return {
          success: true,
          status: 'already_connected',
          instance_id: existingInstance,
          message: 'WhatsApp is already connected'
        };
      }
    }
    
    // Use crm_user_id as instance name for consistency
    const instanceName = crmUserId;
    
    // Create new instance in Evolution API
    console.log('[WhatsApp] Creating Evolution instance...');
    const instanceResult = await evolutionApi.createInstance(instanceName, {
      reject_call: false,
      msg_call: '',
      groups_ignore: true,
      always_online: true
    });
    
    // Set webhook for this instance
    console.log('[WhatsApp] Setting webhook URL...');
    await evolutionApi.setWebhook(instanceName, WEBHOOK_BASE_URL);
    
    // Store instance info in database
    const qrExpiresAt = new Date(Date.now() + 40000); // QR expires in 40 seconds
    
    await pool.query(`
      UPDATE crm_users 
      SET evolution_instance_id = $1,
          evolution_instance_status = 'pending_qr',
          evolution_qr_code = $2,
          evolution_qr_expires_at = $3,
          evolution_webhook_url = $4
      WHERE id = $5
    `, [instanceName, instanceResult.qrcode, qrExpiresAt, WEBHOOK_BASE_URL, crmUserId]);
    
    console.log('✅ [WhatsApp] Initialization complete');
    console.log('   Instance ID:', instanceName);
    console.log('   Status: pending_qr');
    console.log('   QR expires at:', qrExpiresAt.toISOString());
    console.log('═══════════════════════════════════════════════════════════\n');
    
    return {
      success: true,
      instance_id: instanceName,
      qr_code: instanceResult.qrcode,
      qr_expires_at: qrExpiresAt.toISOString(),
      status: 'pending_qr',
      message: 'Scan QR code with WhatsApp to connect'
    };
    
  } catch (error) {
    console.error('❌ [WhatsApp] Initialization failed:', error);
    
    // Update status to error
    await pool.query(
      `UPDATE crm_users SET evolution_instance_status = 'error' WHERE id = $1`,
      [crmUserId]
    );
    
    throw error;
  }
}

/**
 * Get user's WhatsApp connection status
 * @param {string} crmUserId - CRM user UUID
 * @returns {Object} Connection status
 */
async function getUserWhatsAppStatus(crmUserId) {
  try {
    const result = await pool.query(`
      SELECT 
        evolution_instance_id,
        evolution_instance_status,
        evolution_qr_code,
        evolution_qr_expires_at,
        evolution_phone_number,
        evolution_last_connected_at
      FROM crm_users 
      WHERE id = $1
    `, [crmUserId]);
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const user = result.rows[0];
    
    // If no instance, return disconnected
    if (!user.evolution_instance_id) {
      return {
        connected: false,
        status: 'disconnected',
        instance_id: null,
        message: 'WhatsApp not connected'
      };
    }
    
    // Check live status from Evolution API
    const liveStatus = await evolutionApi.getInstanceStatus(user.evolution_instance_id);
    
    // Update database if status changed
    if (liveStatus.state !== user.evolution_instance_status) {
      await updateInstanceStatus(crmUserId, liveStatus.state);
    }
    
    const isConnected = liveStatus.state === 'open';
    const needsQR = liveStatus.state === 'close' || user.evolution_instance_status === 'pending_qr';
    
    // Check if QR expired
    const qrExpired = user.evolution_qr_expires_at && new Date(user.evolution_qr_expires_at) < new Date();
    
    return {
      connected: isConnected,
      status: liveStatus.state,
      instance_id: user.evolution_instance_id,
      phone_number: user.evolution_phone_number,
      last_connected: user.evolution_last_connected_at,
      qr_code: (!isConnected && !qrExpired) ? user.evolution_qr_code : null,
      qr_expired: qrExpired,
      needs_reconnect: needsQR
    };
    
  } catch (error) {
    console.error('[WhatsApp] Failed to get status:', error);
    throw error;
  }
}

/**
 * Refresh QR code for instance
 * @param {string} crmUserId - CRM user UUID
 * @returns {Object} New QR code
 */
async function refreshQRCode(crmUserId) {
  try {
    const userResult = await pool.query(
      'SELECT evolution_instance_id FROM crm_users WHERE id = $1',
      [crmUserId]
    );
    
    if (userResult.rows.length === 0 || !userResult.rows[0].evolution_instance_id) {
      throw new Error('No WhatsApp instance found. Please connect first.');
    }
    
    const instanceName = userResult.rows[0].evolution_instance_id;
    
    console.log('[WhatsApp] Refreshing QR code for instance:', instanceName);
    
    // Get fresh QR from Evolution API
    const qrResult = await evolutionApi.getQRCode(instanceName);
    const qrExpiresAt = new Date(Date.now() + 40000);
    
    // Update database
    await pool.query(`
      UPDATE crm_users 
      SET evolution_qr_code = $1,
          evolution_qr_expires_at = $2,
          evolution_instance_status = 'pending_qr'
      WHERE id = $3
    `, [qrResult.qrcode, qrExpiresAt, crmUserId]);
    
    return {
      success: true,
      qr_code: qrResult.qrcode,
      qr_expires_at: qrExpiresAt.toISOString()
    };
    
  } catch (error) {
    console.error('[WhatsApp] Failed to refresh QR:', error);
    throw error;
  }
}

/**
 * Reconnect user's WhatsApp (restart instance)
 * @param {string} crmUserId - CRM user UUID
 * @returns {Object} Reconnection result
 */
async function reconnectUserWhatsApp(crmUserId) {
  try {
    const userResult = await pool.query(
      'SELECT evolution_instance_id FROM crm_users WHERE id = $1',
      [crmUserId]
    );
    
    if (userResult.rows.length === 0 || !userResult.rows[0].evolution_instance_id) {
      // No instance exists, create new one
      return await initializeUserWhatsApp(crmUserId);
    }
    
    const instanceName = userResult.rows[0].evolution_instance_id;
    
    console.log('[WhatsApp] Attempting to reconnect instance:', instanceName);
    
    // Try to restart instance
    await evolutionApi.restartInstance(instanceName);
    
    // Get new QR
    const qrResult = await evolutionApi.getQRCode(instanceName);
    const qrExpiresAt = new Date(Date.now() + 40000);
    
    // Update database
    await pool.query(`
      UPDATE crm_users 
      SET evolution_qr_code = $1,
          evolution_qr_expires_at = $2,
          evolution_instance_status = 'pending_qr'
      WHERE id = $3
    `, [qrResult.qrcode, qrExpiresAt, crmUserId]);
    
    return {
      success: true,
      qr_code: qrResult.qrcode,
      qr_expires_at: qrExpiresAt.toISOString(),
      message: 'Scan QR code to reconnect'
    };
    
  } catch (error) {
    console.error('[WhatsApp] Reconnection failed:', error);
    throw error;
  }
}

/**
 * Disconnect user's WhatsApp
 * @param {string} crmUserId - CRM user UUID
 * @returns {Object} Disconnect result
 */
async function disconnectUserWhatsApp(crmUserId) {
  try {
    const userResult = await pool.query(
      'SELECT evolution_instance_id FROM crm_users WHERE id = $1',
      [crmUserId]
    );
    
    if (userResult.rows.length === 0 || !userResult.rows[0].evolution_instance_id) {
      return {
        success: true,
        message: 'No instance to disconnect'
      };
    }
    
    const instanceName = userResult.rows[0].evolution_instance_id;
    
    console.log('[WhatsApp] Disconnecting instance:', instanceName);
    
    // Logout from Evolution API
    await evolutionApi.deleteInstance(instanceName);
    
    // Update database
    await pool.query(`
      UPDATE crm_users 
      SET evolution_instance_status = 'disconnected',
          evolution_qr_code = NULL,
          evolution_qr_expires_at = NULL
      WHERE id = $1
    `, [crmUserId]);
    
    console.log('✅ [WhatsApp] Disconnected successfully');
    
    return {
      success: true,
      message: 'WhatsApp disconnected successfully'
    };
    
  } catch (error) {
    console.error('[WhatsApp] Disconnect failed:', error);
    throw error;
  }
}

/**
 * Update instance status in database
 * @param {string} crmUserId - CRM user UUID
 * @param {string} status - New status
 * @param {Object} additionalData - Additional fields to update
 */
async function updateInstanceStatus(crmUserId, status, additionalData = {}) {
  try {
    const updates = {
      evolution_instance_status: status,
      ...additionalData
    };
    
    if (status === 'open' || status === 'connected') {
      updates.evolution_last_connected_at = new Date();
      updates.evolution_instance_status = 'connected';
    } else if (status === 'close') {
      updates.evolution_instance_status = 'disconnected';
    }
    
    const setClause = Object.keys(updates).map((key, i) => `${key} = $${i + 2}`).join(', ');
    const values = [crmUserId, ...Object.values(updates)];
    
    await pool.query(
      `UPDATE crm_users SET ${setClause} WHERE id = $1`,
      values
    );
    
    console.log(`[WhatsApp] Updated status for user ${crmUserId}: ${status}`);
    
  } catch (error) {
    console.error('[WhatsApp] Failed to update status:', error);
  }
}

/**
 * Send WhatsApp message for user
 * @param {string} crmUserId - CRM user UUID
 * @param {string} toNumber - Recipient phone number
 * @param {string} message - Message text
 * @returns {Object} Send result
 */
async function sendUserMessage(crmUserId, toNumber, message) {
  try {
    // Get user's instance
    const userResult = await pool.query(
      'SELECT evolution_instance_id, evolution_instance_status FROM crm_users WHERE id = $1',
      [crmUserId]
    );
    
    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const instanceId = userResult.rows[0].evolution_instance_id;
    const status = userResult.rows[0].evolution_instance_status;
    
    if (!instanceId) {
      throw new Error('WhatsApp not connected. Please connect first.');
    }
    
    if (status !== 'connected') {
      throw new Error(`WhatsApp is ${status}. Please reconnect.`);
    }
    
    // Send message via Evolution API
    const result = await evolutionApi.sendTextMessage(instanceId, toNumber, message);
    
    return result;
    
  } catch (error) {
    console.error('[WhatsApp] Failed to send message:', error);
    throw error;
  }
}

module.exports = {
  initializeUserWhatsApp,
  getUserWhatsAppStatus,
  refreshQRCode,
  reconnectUserWhatsApp,
  disconnectUserWhatsApp,
  updateInstanceStatus,
  sendUserMessage
};


