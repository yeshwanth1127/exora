/**
 * Evolution API Webhook Handler
 * Receives and processes all webhook events from Evolution API
 * Routes messages to user's n8n workflows
 */

const express = require('express');
const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { triggerUserWorkflow } = require('../services/workflowInstanceService');
const { updateInstanceStatus } = require('../services/whatsappIntegrationService');

const router = express.Router();

/**
 * POST /api/webhooks/evolution
 * Main webhook endpoint for Evolution API events
 * No auth middleware - validated via webhook secret
 */
router.post('/evolution', async (req, res) => {
  try {
    const event = req.body;
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📨 [Evolution Webhook] Event received');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Event:', event.event);
    console.log('Instance:', event.instance);
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Extract instance name (this is the crm_user_id)
    const instanceName = event.instance;
    
    if (!instanceName) {
      console.warn('[Evolution Webhook] No instance in payload');
      return res.status(400).json({ error: 'Missing instance' });
    }
    
    // Find user by instance ID
    const userResult = await pool.query(
      'SELECT id, business_name, evolution_instance_status FROM crm_users WHERE evolution_instance_id = $1',
      [instanceName]
    );
    
    if (userResult.rows.length === 0) {
      console.warn(`[Evolution Webhook] Unknown instance: ${instanceName}`);
      return res.status(404).json({ error: 'Instance not found' });
    }
    
    const crmUserId = userResult.rows[0].id;
    const businessName = userResult.rows[0].business_name;
    
    console.log(`User: ${businessName} (${crmUserId})`);
    
    // Log webhook event to database
    await logWebhookEvent(crmUserId, instanceName, event);
    
    // Handle different event types
    const eventType = event.event;
    
    if (eventType === 'qrcode.updated') {
      await handleQRCodeUpdate(crmUserId, event);
    } else if (eventType === 'connection.update') {
      await handleConnectionUpdate(crmUserId, event);
    } else if (eventType === 'messages.upsert') {
      await handleInboundMessage(crmUserId, instanceName, event);
    } else if (eventType === 'messages.update') {
      // Message status update (sent, delivered, read)
      console.log('[Evolution Webhook] Message status update - no action needed');
    } else {
      console.log(`[Evolution Webhook] Unhandled event type: ${eventType}`);
    }
    
    // Always respond 200 to Evolution API
    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('❌ [Evolution Webhook] Error processing webhook:', error);
    // Still return 200 to avoid retries
    res.status(200).json({ received: true, error: error.message });
  }
});

/**
 * Log webhook event to database
 */
async function logWebhookEvent(crmUserId, instanceId, event) {
  try {
    const eventId = uuidv4();
    
    // Extract message details if present
    const messageData = event.data?.messages?.[0] || event.data?.message || {};
    const fromPhone = messageData.key?.remoteJid?.replace('@s.whatsapp.net', '');
    const messageBody = messageData.message?.conversation || 
                       messageData.message?.extendedTextMessage?.text || '';
    const messageId = messageData.key?.id;
    
    await pool.query(`
      INSERT INTO evolution_webhook_events 
      (id, crm_user_id, instance_id, event_type, payload, from_phone, message_body, message_id, processed)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false)
    `, [
      eventId,
      crmUserId,
      instanceId,
      event.event,
      JSON.stringify(event),
      fromPhone || null,
      messageBody || null,
      messageId || null
    ]);
    
  } catch (error) {
    console.error('[Evolution Webhook] Failed to log event:', error);
  }
}

/**
 * Handle QR code update event
 */
async function handleQRCodeUpdate(crmUserId, event) {
  try {
    const qrCode = event.data?.qrcode?.base64 || event.data?.qr;
    
    if (!qrCode) {
      console.warn('[Evolution Webhook] QR update but no QR in payload');
      return;
    }
    
    console.log('[Evolution Webhook] Updating QR code for user');
    
    const qrExpiresAt = new Date(Date.now() + 40000); // 40 seconds
    
    await pool.query(`
      UPDATE crm_users 
      SET evolution_qr_code = $1,
          evolution_qr_expires_at = $2,
          evolution_instance_status = 'pending_qr'
      WHERE id = $3
    `, [qrCode, qrExpiresAt, crmUserId]);
    
  } catch (error) {
    console.error('[Evolution Webhook] QR update error:', error);
  }
}

/**
 * Handle connection status update
 */
async function handleConnectionUpdate(crmUserId, event) {
  try {
    const state = event.data?.state || event.data?.status;
    
    console.log(`[Evolution Webhook] Connection update: ${state}`);
    
    const updates = {};
    
    if (state === 'open') {
      // Successfully connected
      const phoneNumber = event.data?.phoneNumber || 
                         event.data?.number ||
                         event.data?.instance?.wuid?.user;
      
      updates.evolution_phone_number = phoneNumber;
      updates.evolution_qr_code = null; // Clear QR
      updates.evolution_qr_expires_at = null;
      
      console.log(`✅ [Evolution Webhook] User connected! Phone: ${phoneNumber}`);
    }
    
    await updateInstanceStatus(crmUserId, state, updates);
    
  } catch (error) {
    console.error('[Evolution Webhook] Connection update error:', error);
  }
}

/**
 * Handle inbound message
 */
async function handleInboundMessage(crmUserId, instanceName, event) {
  try {
    const messageData = event.data?.messages?.[0] || event.data?.message;
    
    if (!messageData) {
      console.warn('[Evolution Webhook] No message data in payload');
      return;
    }
    
    // Extract message details
    const fromJid = messageData.key?.remoteJid;
    const fromPhone = fromJid?.replace('@s.whatsapp.net', '');
    const messageBody = messageData.message?.conversation || 
                       messageData.message?.extendedTextMessage?.text ||
                       messageData.message?.imageMessage?.caption ||
                       '';
    const messageId = messageData.key?.id;
    const fromMe = messageData.key?.fromMe;
    
    // Ignore messages sent by us
    if (fromMe) {
      console.log('[Evolution Webhook] Ignoring outbound message');
      return;
    }
    
    if (!fromPhone || !messageBody) {
      console.warn('[Evolution Webhook] Missing phone or body');
      return;
    }
    
    console.log('📨 [Evolution Webhook] Inbound message:');
    console.log(`   From: ${fromPhone}`);
    console.log(`   Message: ${messageBody.substring(0, 50)}...`);
    
    // Trigger user's n8n workflow
    console.log(`\n🚀 [Evolution Webhook] Triggering n8n workflow for user ${crmUserId}...`);
    
    const workflowPayload = {
      module: 'whatsapp',
      from_phone: fromPhone,
      message: messageBody,
      message_id: messageId,
      from_name: messageData.pushName || '',
      trigger_source: 'evolution_webhook',
      timestamp: messageData.messageTimestamp
    };
    
    // Trigger user's workflow (async - don't wait)
    setImmediate(() => {
      triggerUserWorkflow(crmUserId, 'whatsapp', workflowPayload)
        .then(() => {
          console.log(`✅ [Evolution Webhook] Workflow triggered successfully`);
          
          // Mark event as processed
          pool.query(
            `UPDATE evolution_webhook_events 
             SET processed = true, processed_at = NOW() 
             WHERE instance_id = $1 AND message_id = $2`,
            [instanceName, messageId]
          ).catch(err => console.error('Failed to mark processed:', err));
        })
        .catch(err => {
          console.error(`❌ [Evolution Webhook] Workflow trigger failed:`, err);
          
          // Log error
          pool.query(
            `UPDATE evolution_webhook_events 
             SET error_message = $1 
             WHERE instance_id = $2 AND message_id = $3`,
            [err.message, instanceName, messageId]
          ).catch(e => console.error('Failed to log error:', e));
        });
    });
    
  } catch (error) {
    console.error('[Evolution Webhook] Message handling error:', error);
  }
}

/**
 * POST /api/whatsapp/refresh-qr
 * Refresh QR code if expired
 */
router.post('/refresh-qr', async (req, res) => {
  try {
    const crmUserId = req.user.crm_user_id;
    
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
 * Reconnect WhatsApp session
 */
router.post('/reconnect', async (req, res) => {
  try {
    const crmUserId = req.user.crm_user_id;
    
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
 * Disconnect WhatsApp
 */
router.delete('/disconnect', async (req, res) => {
  try {
    const crmUserId = req.user.crm_user_id;
    
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



