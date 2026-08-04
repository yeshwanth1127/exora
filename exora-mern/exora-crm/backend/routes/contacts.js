const express = require('express');
const { pool } = require('../config/db');
const { validateExoraToken, requireCRMActivation } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Middleware
router.use(validateExoraToken);
router.use(requireCRMActivation);

// List contacts
router.get('/', async (req, res) => {
  try {
    const { skip = 0, limit = 100, search, tag, source } = req.query;
    const crmUserId = req.user.crm_user_id;
    
    let query = `
      SELECT 
        id, name, phone, email, whatsapp_number, telegram_id,
        birth_date, address, notes, custom_fields, tags, source,
        status, created_at, updated_at, last_contact_at
      FROM contacts 
      WHERE crm_user_id = $1
    `;
    
    const params = [crmUserId];
    let paramIndex = 2;
    
    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR phone ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR whatsapp_number ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    if (tag) {
      query += ` AND $${paramIndex} = ANY(tags)`;
      params.push(tag);
      paramIndex++;
    }
    
    if (source) {
      query += ` AND source = $${paramIndex}`;
      params.push(source);
      paramIndex++;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(skip));
    
    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM contacts WHERE crm_user_id = $1';
    const countParams = [crmUserId];
    
    if (search) {
      countQuery += ` AND (name ILIKE $2 OR phone ILIKE $2 OR email ILIKE $2 OR whatsapp_number ILIKE $2)`;
      countParams.push(`%${search}%`);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    res.json({
      contacts: result.rows,
      total: total,
      page: Math.floor(skip / limit) + 1,
      pages: Math.ceil(total / limit)
    });
    
  } catch (error) {
    console.error('List contacts error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create contact
router.post('/', async (req, res) => {
  try {
    const crmUserId = req.user.crm_user_id;
    const {
      name, phone, email, whatsapp_number, telegram_id,
      birth_date, address, notes, custom_fields, tags, source
    } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const contactId = uuidv4();
    
    const query = `
      INSERT INTO contacts (
        id, crm_user_id, name, phone, email, whatsapp_number,
        telegram_id, birth_date, address, notes, custom_fields,
        tags, source, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'active'
      )
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      contactId, crmUserId, name, phone, email, whatsapp_number,
      telegram_id, birth_date, address, notes,
      JSON.stringify(custom_fields || {}),
      tags || [],
      source || 'manual'
    ]);
    
    res.status(201).json({
      success: true,
      contact: result.rows[0]
    });
    
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get contact by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const crmUserId = req.user.crm_user_id;
    
    const contactQuery = 'SELECT * FROM contacts WHERE id = $1 AND crm_user_id = $2';
    const contactResult = await pool.query(contactQuery, [id, crmUserId]);
    
    if (contactResult.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    const contact = contactResult.rows[0];
    
    // Get recent activities
    const activitiesQuery = `
      SELECT * FROM activities 
      WHERE contact_id = $1 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    const activitiesResult = await pool.query(activitiesQuery, [id]);
    
    // Get upcoming events
    const eventsQuery = `
      SELECT * FROM events 
      WHERE contact_id = $1 
      AND start_time > NOW()
      ORDER BY start_time ASC 
      LIMIT 5
    `;
    const eventsResult = await pool.query(eventsQuery, [id]);
    
    res.json({
      ...contact,
      recent_activities: activitiesResult.rows,
      upcoming_events: eventsResult.rows
    });
    
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update contact
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const crmUserId = req.user.crm_user_id;
    const updates = req.body;
    
    const setClause = [];
    const values = [id, crmUserId];
    let paramIndex = 3;
    
    Object.keys(updates).forEach(key => {
      setClause.push(`${key} = $${paramIndex}`);
      values.push(updates[key]);
      paramIndex++;
    });
    
    if (setClause.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    const query = `
      UPDATE contacts 
      SET ${setClause.join(', ')}
      WHERE id = $1 AND crm_user_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json({
      success: true,
      contact: result.rows[0]
    });
    
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete contact
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const crmUserId = req.user.crm_user_id;
    
    const query = 'DELETE FROM contacts WHERE id = $1 AND crm_user_id = $2 RETURNING id';
    const result = await pool.query(query, [id, crmUserId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Find contact by phone (used by n8n)
router.get('/by-phone/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const crmUserId = req.user.crm_user_id;
    
    const query = `
      SELECT * FROM contacts 
      WHERE crm_user_id = $1
      AND (phone = $2 OR whatsapp_number = $2)
      LIMIT 1
    `;
    
    const result = await pool.query(query, [crmUserId, phone]);
    
    if (result.rows.length === 0) {
      return res.json({ found: false, contact: null });
    }
    
    res.json({
      found: true,
      contact: result.rows[0]
    });
    
  } catch (error) {
    console.error('Find contact by phone error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

