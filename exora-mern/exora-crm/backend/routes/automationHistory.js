const express = require('express');
const { pool } = require('../config/db');
const { validateExoraToken, requireCRMActivation } = require('../middleware/auth');

const router = express.Router();

// Middleware
router.use(validateExoraToken);
router.use(requireCRMActivation);

// List automation history
router.get('/', async (req, res) => {
  try {
    const { automation_type, contact_id, days = 7, skip = 0, limit = 100 } = req.query;
    const crmUserId = req.user.crm_user_id;
    
    let query = `
      SELECT 
        ah.*,
        c.name as contact_name,
        e.title as event_title,
        e.start_time as event_start_time
      FROM automation_history ah
      LEFT JOIN contacts c ON ah.contact_id = c.id
      LEFT JOIN events e ON ah.event_id = e.id
      WHERE ah.crm_user_id = $1
      AND ah.executed_at >= NOW() - INTERVAL '${parseInt(days)} days'
    `;
    
    const params = [crmUserId];
    let paramIndex = 2;
    
    if (automation_type) {
      query += ` AND ah.automation_type = $${paramIndex}`;
      params.push(automation_type);
      paramIndex++;
    }
    
    if (contact_id) {
      query += ` AND ah.contact_id = $${paramIndex}`;
      params.push(contact_id);
      paramIndex++;
    }
    
    query += ` ORDER BY ah.executed_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(skip));
    
    const result = await pool.query(query, params);
    
    res.json({
      automation_history: result.rows,
      total: result.rows.length
    });
    
  } catch (error) {
    console.error('List automation history error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get automation stats
router.get('/stats', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const crmUserId = req.user.crm_user_id;
    
    const query = `
      SELECT 
        automation_type,
        COUNT(*) as count,
        COUNT(CASE WHEN result = 'success' THEN 1 END) as successful,
        COUNT(CASE WHEN result = 'failed' THEN 1 END) as failed
      FROM automation_history
      WHERE crm_user_id = $1
      AND executed_at >= NOW() - INTERVAL '${parseInt(days)} days'
      GROUP BY automation_type
      ORDER BY count DESC
    `;
    
    const result = await pool.query(query, [crmUserId]);
    
    const stats = result.rows;
    const total_automations = stats.reduce((sum, s) => sum + parseInt(s.count), 0);
    const successful = stats.reduce((sum, s) => sum + parseInt(s.successful), 0);
    const failed = stats.reduce((sum, s) => sum + parseInt(s.failed), 0);
    const success_rate = total_automations > 0 ? (successful / total_automations * 100) : 0;
    
    res.json({
      stats_by_type: stats,
      summary: {
        total_automations,
        successful,
        failed,
        success_rate: Math.round(success_rate * 100) / 100
      },
      period_days: parseInt(days)
    });
    
  } catch (error) {
    console.error('Get automation stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

