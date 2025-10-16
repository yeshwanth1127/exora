const express = require('express');
const { pool } = require('../config/db');
const { validateExoraToken } = require('../middleware/auth');

const router = express.Router();

// Complete CRM setup
router.post('/complete', validateExoraToken, async (req, res) => {
  try {
    const exoraUserId = req.user.exora_user_id;
    const {
      business_name,
      industry,
      admin_email,
      admin_whatsapp,
      whatsapp_instance_name,
      telegram_chat_id
    } = req.body;
    
    if (!business_name || !industry) {
      return res.status(400).json({ error: 'Business name and industry are required' });
    }
    
    const query = `
      UPDATE crm_users
      SET business_name = $1,
          industry = $2,
          admin_email = $3,
          admin_whatsapp = $4,
          whatsapp_instance_name = $5,
          whatsapp_connected = CASE WHEN $5 IS NOT NULL THEN true ELSE false END,
          telegram_chat_id = $6,
          telegram_connected = CASE WHEN $6 IS NOT NULL THEN true ELSE false END,
          status = 'active'
      WHERE exora_user_id = $7
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      business_name,
      industry,
      admin_email,
      admin_whatsapp,
      whatsapp_instance_name,
      telegram_chat_id,
      exoraUserId
    ]);
    
    res.json({
      success: true,
      crm_user: result.rows[0]
    });
    
  } catch (error) {
    console.error('Complete setup error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

