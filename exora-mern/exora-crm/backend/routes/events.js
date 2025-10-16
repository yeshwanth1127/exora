const express = require('express');
const { pool } = require('../config/db');
const { validateExoraToken, requireCRMActivation } = require('../middleware/auth');
const { triggerN8NWebhook } = require('../services/n8nService');
const { notifyEventCreated } = require('../services/notificationService');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Middleware
router.use(validateExoraToken);
router.use(requireCRMActivation);

// List events
router.get('/', async (req, res) => {
  try {
    const { skip = 0, limit = 100, status, start_date, end_date } = req.query;
    const crmUserId = req.user.crm_user_id;
    
    let query = `
      SELECT 
        e.*,
        c.name as contact_name,
        c.whatsapp_number,
        c.phone,
        s.name as staff_name
      FROM events e
      LEFT JOIN contacts c ON e.contact_id = c.id
      LEFT JOIN staff_members s ON e.assigned_to = s.id
      WHERE e.crm_user_id = $1
    `;
    
    const params = [crmUserId];
    let paramIndex = 2;
    
    if (status) {
      query += ` AND e.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (start_date) {
      query += ` AND e.start_time >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }
    
    if (end_date) {
      query += ` AND e.start_time <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }
    
    query += ` ORDER BY e.start_time ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(skip));
    
    const result = await pool.query(query, params);
    
    res.json({ events: result.rows });
    
  } catch (error) {
    console.error('List events error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get upcoming events
router.get('/upcoming', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const crmUserId = req.user.crm_user_id;
    
    const query = `
      SELECT 
        e.*,
        c.name as contact_name,
        c.whatsapp_number,
        s.name as staff_name
      FROM events e
      LEFT JOIN contacts c ON e.contact_id = c.id
      LEFT JOIN staff_members s ON e.assigned_to = s.id
      WHERE e.crm_user_id = $1
      AND e.start_time >= NOW()
      AND e.start_time <= NOW() + INTERVAL '${parseInt(days)} days'
      AND e.status IN ('scheduled', 'confirmed')
      ORDER BY e.start_time ASC
    `;
    
    const result = await pool.query(query, [crmUserId]);
    
    res.json({
      upcoming_events: result.rows,
      count: result.rows.length
    });
    
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create event
router.post('/', async (req, res) => {
  try {
    const crmUserId = req.user.crm_user_id;
    const {
      contact_id, title, description, location,
      start_time, end_time, assigned_to, status
    } = req.body;
    
    if (!contact_id || !title || !start_time || !end_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get contact details
    const contactResult = await pool.query(
      'SELECT * FROM contacts WHERE id = $1 AND crm_user_id = $2',
      [contact_id, crmUserId]
    );
    
    if (contactResult.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    const contact = contactResult.rows[0];
    const eventId = uuidv4();
    
    // Insert event
    const insertQuery = `
      INSERT INTO events (
        id, crm_user_id, contact_id, title, description, location,
        start_time, end_time, assigned_to, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      )
      RETURNING *
    `;
    
    const result = await pool.query(insertQuery, [
      eventId, crmUserId, contact_id, title, description, location,
      start_time, end_time, assigned_to, status || 'scheduled'
    ]);
    
    const createdEvent = result.rows[0];
    
    // Trigger n8n webhook (async - don't wait)
    setImmediate(() => {
      triggerN8NWebhook('event-created', {
        event_id: eventId,
        crm_user_id: crmUserId,
        contact_id: contact_id,
        contact_name: contact.name,
        contact_phone: contact.phone,
        contact_whatsapp: contact.whatsapp_number,
        start_time: start_time,
        end_time: end_time,
        title: title,
        description: description
      }).catch(err => console.error('n8n trigger error:', err));
      
      // Send notifications
      notifyEventCreated(crmUserId, createdEvent, contact)
        .catch(err => console.error('Notification error:', err));
    });
    
    res.status(201).json({
      success: true,
      event: createdEvent
    });
    
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update event
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
      UPDATE events 
      SET ${setClause.join(', ')}
      WHERE id = $1 AND crm_user_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Trigger n8n to update Google Calendar
    setImmediate(() => {
      triggerN8NWebhook('event-updated', {
        event_id: id,
        crm_user_id: crmUserId,
        updates: updates
      }).catch(err => console.error('n8n trigger error:', err));
    });
    
    res.json({
      success: true,
      event: result.rows[0]
    });
    
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Confirm event
router.put('/:id/confirm', async (req, res) => {
  try {
    const { id } = req.params;
    const crmUserId = req.user.crm_user_id;
    
    const query = `
      UPDATE events 
      SET status = 'confirmed',
          confirmation_sent = true,
          confirmation_sent_at = NOW()
      WHERE id = $1 AND crm_user_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, crmUserId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({
      success: true,
      event: result.rows[0]
    });
    
  } catch (error) {
    console.error('Confirm event error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete event
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const crmUserId = req.user.crm_user_id;
    
    // Get event first
    const getQuery = 'SELECT * FROM events WHERE id = $1 AND crm_user_id = $2';
    const eventResult = await pool.query(getQuery, [id, crmUserId]);
    
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const event = eventResult.rows[0];
    
    // Delete event
    const deleteQuery = 'DELETE FROM events WHERE id = $1 AND crm_user_id = $2 RETURNING id';
    await pool.query(deleteQuery, [id, crmUserId]);
    
    // Trigger n8n to delete from Google Calendar and notify
    setImmediate(() => {
      triggerN8NWebhook('event-cancelled', {
        event_id: id,
        crm_user_id: crmUserId,
        google_event_id: event.google_event_id,
        contact_name: event.title
      }).catch(err => console.error('n8n trigger error:', err));
    });
    
    res.json({
      success: true,
      message: 'Event cancelled'
    });
    
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

