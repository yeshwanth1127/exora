/**
 * Evolution API Service
 * Wrapper for all Evolution API operations
 * Handles instance management, message sending, and status checking
 */

const axios = require('axios');

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '';

/**
 * Create axios instance for Evolution API
 */
const evolutionApi = axios.create({
  baseURL: EVOLUTION_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'apikey': EVOLUTION_API_KEY
  },
  timeout: 30000
});

/**
 * Create a new Evolution API instance for a user
 * @param {string} instanceName - Instance identifier (use crm_user_id)
 * @param {Object} options - Instance configuration
 * @returns {Object} Instance creation result with QR code
 */
async function createInstance(instanceName, options = {}) {
  try {
    console.log(`[Evolution] Creating instance: ${instanceName}`);
    
    const payload = {
      instanceName: instanceName,
      ...options
    };
    
    const response = await evolutionApi.post('/instance/create', payload);
    
    console.log(`[Evolution] Instance created successfully: ${instanceName}`);
    
    return {
      success: true,
      instanceName: instanceName,
      qrcode: response.data?.qrcode,
      hash: response.data?.hash,
      status: response.data?.instance?.state || 'pending_qr'
    };
    
  } catch (error) {
    console.error(`[Evolution] Failed to create instance ${instanceName}:`, error.message);
    throw new Error(`Evolution API instance creation failed: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Get QR code for instance
 * @param {string} instanceName - Instance identifier
 * @returns {Object} QR code data
 */
async function getQRCode(instanceName) {
  try {
    const response = await evolutionApi.get(`/instance/connect/${instanceName}`);
    
    // Check if the response contains an error
    if (response.data?.error === true) {
      throw new Error(`Evolution API error: ${response.data?.message || 'Unknown error'}`);
    }
    
    // Check if QR code is available
    if (!response.data?.qrcode?.base64) {
      throw new Error('QR code not available in response');
    }
    
    return {
      success: true,
      qrcode: response.data.qrcode.base64,
      pairingCode: response.data?.pairingCode,
      code: response.data?.code
    };
    
  } catch (error) {
    console.error(`[Evolution] Failed to get QR for ${instanceName}:`, error.message);
    throw new Error(`Failed to get QR code: ${error.message}`);
  }
}

/**
 * Get instance connection status
 * @param {string} instanceName - Instance identifier
 * @returns {Object} Connection status
 */
async function getInstanceStatus(instanceName) {
  try {
    const response = await evolutionApi.get(`/instance/connectionState/${instanceName}`);
    
    return {
      success: true,
      state: response.data?.state || 'disconnected',
      instanceName: instanceName
    };
    
  } catch (error) {
    console.error(`[Evolution] Failed to get status for ${instanceName}:`, error.message);
    return {
      success: false,
      state: 'error',
      error: error.message
    };
  }
}

/**
 * Get detailed instance information
 * @param {string} instanceName - Instance identifier
 * @returns {Object} Instance details
 */
async function getInstance(instanceName) {
  try {
    const response = await evolutionApi.get(`/instance/fetchInstances?instanceName=${instanceName}`);
    
    const instances = response.data;
    const instance = Array.isArray(instances) ? instances[0] : instances;
    
    if (!instance) {
      throw new Error('Instance not found');
    }
    
    return {
      success: true,
      instanceName: instance.instanceName || instanceName,
      status: instance.state || instance.status,
      phoneNumber: instance.phoneNumber || instance.number,
      owner: instance.owner,
      profilePictureUrl: instance.profilePictureUrl
    };
    
  } catch (error) {
    console.error(`[Evolution] Failed to get instance ${instanceName}:`, error.message);
    throw new Error(`Failed to get instance: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Send text message via Evolution API
 * @param {string} instanceName - Instance identifier
 * @param {string} toNumber - Recipient phone number (with country code)
 * @param {string} text - Message text
 * @returns {Object} Send result
 */
async function sendTextMessage(instanceName, toNumber, text) {
  try {
    console.log(`[Evolution] Sending message from ${instanceName} to ${toNumber}`);
    
    const payload = {
      number: toNumber,
      text: text
    };
    
    const response = await evolutionApi.post(`/message/sendText/${instanceName}`, payload);
    
    console.log(`[Evolution] Message sent successfully`);
    
    return {
      success: true,
      messageId: response.data?.key?.id,
      status: response.data?.status || 'sent'
    };
    
  } catch (error) {
    console.error(`[Evolution] Failed to send message:`, error.message);
    throw new Error(`Failed to send WhatsApp message: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Send media message (image, video, document)
 * @param {string} instanceName - Instance identifier
 * @param {string} toNumber - Recipient phone number
 * @param {string} mediaUrl - URL to media file
 * @param {string} caption - Optional caption
 * @param {string} mediaType - image, video, document, audio
 * @returns {Object} Send result
 */
async function sendMediaMessage(instanceName, toNumber, mediaUrl, caption = '', mediaType = 'image') {
  try {
    console.log(`[Evolution] Sending ${mediaType} from ${instanceName} to ${toNumber}`);
    
    const payload = {
      number: toNumber,
      mediaUrl: mediaUrl,
      caption: caption
    };
    
    const endpoint = `/message/send${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}/${instanceName}`;
    const response = await evolutionApi.post(endpoint, payload);
    
    return {
      success: true,
      messageId: response.data?.key?.id,
      status: response.data?.status || 'sent'
    };
    
  } catch (error) {
    console.error(`[Evolution] Failed to send media:`, error.message);
    throw new Error(`Failed to send media: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Restart an instance (useful for reconnection)
 * @param {string} instanceName - Instance identifier
 * @returns {Object} Restart result
 */
async function restartInstance(instanceName) {
  try {
    console.log(`[Evolution] Restarting instance: ${instanceName}`);
    
    const response = await evolutionApi.put(`/instance/restart/${instanceName}`);
    
    return {
      success: true,
      status: response.data?.state || 'restarting'
    };
    
  } catch (error) {
    console.error(`[Evolution] Failed to restart ${instanceName}:`, error.message);
    throw new Error(`Failed to restart instance: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Logout and delete instance
 * @param {string} instanceName - Instance identifier
 * @returns {Object} Delete result
 */
async function deleteInstance(instanceName) {
  try {
    console.log(`[Evolution] Deleting instance: ${instanceName}`);
    
    const response = await evolutionApi.delete(`/instance/logout/${instanceName}`);
    
    console.log(`[Evolution] Instance deleted: ${instanceName}`);
    
    return {
      success: true,
      status: 'deleted'
    };
    
  } catch (error) {
    console.error(`[Evolution] Failed to delete ${instanceName}:`, error.message);
    throw new Error(`Failed to delete instance: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Set webhook URL for instance
 * @param {string} instanceName - Instance identifier
 * @param {string} webhookUrl - Webhook URL to receive events
 * @returns {Object} Result
 */
async function setWebhook(instanceName, webhookUrl) {
  try {
    console.log(`[Evolution] Setting webhook for ${instanceName}: ${webhookUrl}`);
    
    const payload = {
      url: webhookUrl,
      webhook_by_events: true,
      events: [
        'QRCODE_UPDATED',
        'CONNECTION_UPDATE',
        'MESSAGES_UPSERT',
        'MESSAGES_UPDATE',
        'SEND_MESSAGE'
      ]
    };
    
    const response = await evolutionApi.post(`/webhook/set/${instanceName}`, payload);
    
    return {
      success: true,
      webhook: webhookUrl
    };
    
  } catch (error) {
    console.error(`[Evolution] Failed to set webhook:`, error.message);
    throw new Error(`Failed to set webhook: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Check if Evolution API is reachable
 * @returns {boolean} True if API is healthy
 */
async function checkHealth() {
  try {
    const response = await evolutionApi.get('/instance/fetchInstances');
    return true;
  } catch (error) {
    console.error('[Evolution] Health check failed:', error.message);
    return false;
  }
}

module.exports = {
  createInstance,
  getQRCode,
  getInstanceStatus,
  getInstance,
  sendTextMessage,
  sendMediaMessage,
  restartInstance,
  deleteInstance,
  setWebhook,
  checkHealth
};



