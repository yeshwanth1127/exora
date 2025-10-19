const express = require('express');
const { pool } = require('../config/db');
const { validateExoraToken, requireCRMActivation } = require('../middleware/auth');

const router = express.Router();

router.use(validateExoraToken);
router.use(requireCRMActivation);

// GET /api/settings/business - Get current business settings
router.get('/business', async (req, res) => {
  try {
    const crmUserId = req.user.crm_user_id;
    
    const result = await pool.query(
      'SELECT * FROM crm_users WHERE id = $1',
      [crmUserId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'CRM user not found' });
    }
    
    res.json({
      success: true,
      settings: result.rows[0]
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/settings/business - Update business settings
router.put('/business', async (req, res) => {
  try {
    const crmUserId = req.user.crm_user_id;
    const {
      business_name,
      industry,
      admin_email,
      admin_whatsapp,
      whatsapp_instance_name,
      telegram_chat_id,
      notify_admin_email,
      notify_admin_whatsapp,
      notify_admin_telegram
    } = req.body;
    
    const updateFields = [];
    const values = [crmUserId];
    let paramIndex = 2;
    
    if (business_name !== undefined) {
      updateFields.push(`business_name = $${paramIndex}`);
      values.push(business_name);
      paramIndex++;
    }
    
    if (industry !== undefined) {
      updateFields.push(`industry = $${paramIndex}`);
      values.push(industry);
      paramIndex++;
    }
    
    if (admin_email !== undefined) {
      updateFields.push(`admin_email = $${paramIndex}`);
      values.push(admin_email);
      paramIndex++;
    }
    
    if (admin_whatsapp !== undefined) {
      updateFields.push(`admin_whatsapp = $${paramIndex}`);
      values.push(admin_whatsapp);
      paramIndex++;
    }
    
    if (whatsapp_instance_name !== undefined) {
      updateFields.push(`whatsapp_instance_name = $${paramIndex}`);
      values.push(whatsapp_instance_name);
      paramIndex++;
      
      // Update whatsapp_connected based on instance name
      updateFields.push(`whatsapp_connected = $${paramIndex}`);
      values.push(whatsapp_instance_name ? true : false);
      paramIndex++;
    }
    
    if (telegram_chat_id !== undefined) {
      updateFields.push(`telegram_chat_id = $${paramIndex}`);
      values.push(telegram_chat_id);
      paramIndex++;
      
      // Update telegram_connected based on chat ID
      updateFields.push(`telegram_connected = $${paramIndex}`);
      values.push(telegram_chat_id ? true : false);
      paramIndex++;
    }
    
    if (notify_admin_email !== undefined) {
      updateFields.push(`notify_admin_email = $${paramIndex}`);
      values.push(notify_admin_email);
      paramIndex++;
    }
    
    if (notify_admin_whatsapp !== undefined) {
      updateFields.push(`notify_admin_whatsapp = $${paramIndex}`);
      values.push(notify_admin_whatsapp);
      paramIndex++;
    }
    
    if (notify_admin_telegram !== undefined) {
      updateFields.push(`notify_admin_telegram = $${paramIndex}`);
      values.push(notify_admin_telegram);
      paramIndex++;
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    // Always update updated_at
    updateFields.push(`updated_at = NOW()`);
    
    const query = `
      UPDATE crm_users
      SET ${updateFields.join(', ')}
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    
    res.json({
      success: true,
      settings: result.rows[0]
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

