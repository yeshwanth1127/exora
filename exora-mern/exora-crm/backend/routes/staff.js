const express = require('express');
const { pool } = require('../config/db');
const { validateExoraToken, requireCRMActivation } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Middleware
router.use(validateExoraToken);
router.use(requireCRMActivation);

// List staff
router.get('/', async (req, res) => {
  try {
    const crmUserId = req.user.crm_user_id;
    
    const query = `
      SELECT * FROM staff_members
      WHERE crm_user_id = $1
      AND status = 'active'
      ORDER BY name ASC
    `;
    
    const result = await pool.query(query, [crmUserId]);
    
    res.json({ staff: result.rows });
    
  } catch (error) {
    console.error('List staff error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create staff member
router.post('/', async (req, res) => {
  try {
    const crmUserId = req.user.crm_user_id;
    const { name, email, phone, role, telegram_chat_id, whatsapp_number } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const staffId = uuidv4();
    
    const query = `
      INSERT INTO staff_members (
        id, crm_user_id, name, email, phone, role,
        telegram_chat_id, whatsapp_number
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8
      )
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      staffId, crmUserId, name, email, phone, role || 'staff',
      telegram_chat_id, whatsapp_number
    ]);
    
    res.status(201).json({
      success: true,
      staff: result.rows[0]
    });
    
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

