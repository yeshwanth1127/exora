const express = require('express');
const { pool } = require('../config/db');
const { validateExoraToken, requireCRMActivation } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Middleware
router.use(validateExoraToken);
router.use(requireCRMActivation);

// List opportunities
router.get('/', async (req, res) => {
  try {
    const { stage, skip = 0, limit = 100 } = req.query;
    const crmUserId = req.user.crm_user_id;
    
    let query = `
      SELECT 
        o.*,
        c.name as contact_name,
        s.name as staff_name
      FROM opportunities o
      LEFT JOIN contacts c ON o.contact_id = c.id
      LEFT JOIN staff_members s ON o.assigned_to = s.id
      WHERE o.crm_user_id = $1
    `;
    
    const params = [crmUserId];
    
    if (stage) {
      query += ' AND o.stage = $2';
      params.push(stage);
      query += ' ORDER BY o.created_at DESC LIMIT $3 OFFSET $4';
      params.push(parseInt(limit), parseInt(skip));
    } else {
      query += ' ORDER BY o.created_at DESC LIMIT $2 OFFSET $3';
      params.push(parseInt(limit), parseInt(skip));
    }
    
    const result = await pool.query(query, params);
    
    res.json({ opportunities: result.rows });
    
  } catch (error) {
    console.error('List opportunities error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create opportunity
router.post('/', async (req, res) => {
  try {
    const crmUserId = req.user.crm_user_id;
    const {
      contact_id, title, description, value, currency,
      stage, probability, assigned_to, expected_date
    } = req.body;
    
    const oppId = uuidv4();
    
    const query = `
      INSERT INTO opportunities (
        id, crm_user_id, contact_id, title, description,
        value, currency, stage, probability, assigned_to, expected_date
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      )
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      oppId, crmUserId, contact_id, title, description,
      value, currency || 'BRL', stage || 'new', probability, assigned_to, expected_date
    ]);
    
    res.status(201).json({
      success: true,
      opportunity: result.rows[0]
    });
    
  } catch (error) {
    console.error('Create opportunity error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update opportunity stage
router.put('/:id/stage', async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;
    const crmUserId = req.user.crm_user_id;
    
    const query = `
      UPDATE opportunities 
      SET stage = $1
      WHERE id = $2 AND crm_user_id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [stage, id, crmUserId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    
    res.json({
      success: true,
      opportunity: result.rows[0]
    });
    
  } catch (error) {
    console.error('Update opportunity stage error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

