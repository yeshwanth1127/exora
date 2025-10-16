const express = require('express');
const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Webhook from n8n - incoming WhatsApp message stored
router.post('/whatsapp-incoming', async (req, res) => {
  try {
    const { crm_user_id, contact_id, message, phone, direction, message_id } = req.body;
    
    // Store activity
    const activityId = uuidv4();
    
    const query = `
      INSERT INTO activities (
        id, crm_user_id, contact_id, activity_type,
        direction, channel, body, external_message_id, status
      ) VALUES (
        $1, $2, $3, 'message', $4, 'whatsapp', $5, $6, 'completed'
      )
      RETURNING *
    `;
    
    await pool.query(query, [
      activityId, crm_user_id, contact_id,
      direction || 'inbound', message, message_id
    ]);
    
    // Update last_contact_at
    if (contact_id) {
      await pool.query(
        'UPDATE contacts SET last_contact_at = NOW() WHERE id = $1',
        [contact_id]
      );
    }
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Webhook from n8n - log automation
router.post('/automation-log', async (req, res) => {
  try {
    const {
      crm_user_id, automation_type, trigger_source,
      contact_id, event_id, activity_id,
      action_taken, result, error_message, metadata
    } = req.body;
    
    const logId = uuidv4();
    
    const query = `
      INSERT INTO automation_history (
        id, crm_user_id, automation_type, trigger_source,
        contact_id, event_id, activity_id,
        action_taken, result, error_message, metadata
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      )
    `;
    
    await pool.query(query, [
      logId, crm_user_id, automation_type, trigger_source,
      contact_id, event_id, activity_id,
      action_taken, result, error_message, JSON.stringify(metadata || {})
    ]);
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Automation log webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

