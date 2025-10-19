const express = require('express');
const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Middleware to enrich webhook data with user's automation configs
async function enrichWithConfigs(req, res, next) {
  try {
    const crmUserId = req.body?.crm_user_id;
    if (!crmUserId) {
      console.warn('No crm_user_id in webhook request');
      return next();
    }
    
    // Fetch all enabled configs for this user
    const result = await pool.query(`
      SELECT module_key, config_data 
      FROM automation_configs 
      WHERE crm_user_id = $1 AND enabled = true
    `, [crmUserId]);
    
    // Attach to request body
    req.body.enabled_modules = result.rows.reduce((acc, row) => {
      acc[row.module_key] = row.config_data;
      return acc;
    }, {});
    
    next();
  } catch (error) {
    console.error('Config enrichment error:', error);
    next(); // Continue even if enrichment fails
  }
}

// Webhook to trigger n8n automation with user configs
router.post('/trigger-automation', enrichWithConfigs, async (req, res) => {
  try {
    const { module, crm_user_id, ...data } = req.body;
    
    if (!module || !crm_user_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'module and crm_user_id are required' 
      });
    }
    
    // This endpoint can be called by CRM frontend to trigger automations
    // The enrichWithConfigs middleware will add enabled_modules to the request
    
    // In production, you would forward this to n8n webhook
    // For now, we'll just log it
    console.log(`[Webhook] Triggering automation: ${module} for user ${crm_user_id}`);
    console.log(`[Webhook] Enabled modules:`, req.body.enabled_modules);
    
    // TODO: Forward to n8n master workflow webhook
    // await axios.post(`${N8N_BASE_URL}/webhook/crm-automation`, req.body);
    
    res.json({ success: true, message: 'Automation triggered' });
  } catch (error) {
    console.error('Trigger automation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Webhook from n8n - incoming WhatsApp message stored
router.post('/whatsapp-incoming', enrichWithConfigs, async (req, res) => {
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

