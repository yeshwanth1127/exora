const express = require('express');
const { pool } = require('../config/db');
const { validateExoraToken, requireCRMActivation } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Middleware
router.use(validateExoraToken);
router.use(requireCRMActivation);

// List activities
router.get('/', async (req, res) => {
  try {
    const { contact_id, activity_type, channel, skip = 0, limit = 100 } = req.query;
    const crmUserId = req.user.crm_user_id;
    
    let query = `
      SELECT 
        a.*,
        c.name as contact_name,
        c.whatsapp_number
      FROM activities a
      LEFT JOIN contacts c ON a.contact_id = c.id
      WHERE a.crm_user_id = $1
    `;
    
    const params = [crmUserId];
    let paramIndex = 2;
    
    if (contact_id) {
      query += ` AND a.contact_id = $${paramIndex}`;
      params.push(contact_id);
      paramIndex++;
    }
    
    if (activity_type) {
      query += ` AND a.activity_type = $${paramIndex}`;
      params.push(activity_type);
      paramIndex++;
    }
    
    if (channel) {
      query += ` AND a.channel = $${paramIndex}`;
      params.push(channel);
      paramIndex++;
    }
    
    query += ` ORDER BY a.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(skip));
    
    const result = await pool.query(query, params);
    
    res.json({
      activities: result.rows,
      total: result.rows.length
    });
    
  } catch (error) {
    console.error('List activities error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create activity
router.post('/', async (req, res) => {
  try {
    const crmUserId = req.user.crm_user_id;
    const {
      contact_id, opportunity_id, event_id,
      activity_type, direction, channel,
      subject, body, external_message_id,
      metadata, status
    } = req.body;
    
    const activityId = uuidv4();
    
    const query = `
      INSERT INTO activities (
        id, crm_user_id, contact_id, opportunity_id, event_id,
        activity_type, direction, channel, subject, body,
        external_message_id, metadata, status, completed_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW()
      )
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      activityId, crmUserId, contact_id, opportunity_id, event_id,
      activity_type, direction, channel, subject, body,
      external_message_id, JSON.stringify(metadata || {}),
      status || 'completed'
    ]);
    
    // Update last_contact_at
    if (contact_id) {
      await pool.query(
        'UPDATE contacts SET last_contact_at = NOW() WHERE id = $1',
        [contact_id]
      );
    }
    
    res.status(201).json({
      success: true,
      activity: result.rows[0]
    });
    
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get conversation history
router.get('/conversation/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    const { limit = 50 } = req.query;
    const crmUserId = req.user.crm_user_id;
    
    const query = `
      SELECT * FROM activities
      WHERE crm_user_id = $1
      AND contact_id = $2
      AND activity_type IN ('message', 'email', 'call')
      ORDER BY created_at ASC
      LIMIT $3
    `;
    
    const result = await pool.query(query, [crmUserId, contactId, parseInt(limit)]);
    
    res.json({
      contact_id: contactId,
      conversation: result.rows
    });
    
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

