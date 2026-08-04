const express = require('express');
const { pool } = require('../config/db');
const { validateExoraToken } = require('../middleware/auth');
const { getIndustryTemplate } = require('../config/industryTemplates');

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
          whatsapp_connected = $6,
          telegram_chat_id = $7,
          telegram_connected = $8,
          status = 'active'
      WHERE exora_user_id = $9
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      business_name,
      industry,
      admin_email,
      admin_whatsapp || null,
      whatsapp_instance_name || null,
      whatsapp_instance_name ? true : false,
      telegram_chat_id || null,
      telegram_chat_id ? true : false,
      exoraUserId
    ]);
    
    const crmUser = result.rows[0];
    
    // ✅ NO AUTO-ENABLING: Users will manually enable automations from /automations page
    // Automations are discovered from user's n8n workflow dynamically
    console.log(`[Setup] Setup complete for ${industry} - User: ${crmUser.business_name}`);
    console.log(`[Setup] User should visit /automations to enable features`);
    
    res.json({
      success: true,
      crm_user: crmUser,
      message: 'Setup complete! Visit the Automations page to enable features.',
      next_step: '/automations'
    });
    
  } catch (error) {
    console.error('Complete setup error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

