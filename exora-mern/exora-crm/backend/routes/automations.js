const express = require('express');
const { pool } = require('../config/db');
const { validateExoraToken, requireCRMActivation } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

router.use(validateExoraToken);
router.use(requireCRMActivation);

// GET /api/automations/modules - List all available automation modules
router.get('/modules', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM automation_modules 
      WHERE is_active = true 
      ORDER BY category, name
    `);
    
    res.json({ modules: result.rows });
  } catch (error) {
    console.error('List modules error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/automations/configs - Get user's enabled automations
router.get('/configs', async (req, res) => {
  try {
    const crmUserId = req.user.crm_user_id;
    
    const result = await pool.query(`
      SELECT ac.*, am.name, am.description, am.icon, am.category
      FROM automation_configs ac
      JOIN automation_modules am ON ac.module_key = am.module_key
      WHERE ac.crm_user_id = $1
      ORDER BY am.category, am.name
    `, [crmUserId]);
    
    res.json({ configs: result.rows });
  } catch (error) {
    console.error('List configs error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/automations/enable - Enable an automation module
router.post('/enable', async (req, res) => {
  try {
    const crmUserId = req.user.crm_user_id;
    const { module_key, config_data } = req.body;
    
    if (!module_key) {
      return res.status(400).json({ error: 'module_key is required' });
    }
    
    const result = await pool.query(`
      INSERT INTO automation_configs (crm_user_id, module_key, enabled, config_data)
      VALUES ($1, $2, true, $3)
      ON CONFLICT (crm_user_id, module_key) 
      DO UPDATE SET enabled = true, config_data = $3, updated_at = NOW()
      RETURNING *
    `, [crmUserId, module_key, JSON.stringify(config_data || {})]);
    
    res.json({ success: true, config: result.rows[0] });
  } catch (error) {
    console.error('Enable automation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/automations/:module_key/config - Update configuration
router.put('/:module_key/config', async (req, res) => {
  try {
    const crmUserId = req.user.crm_user_id;
    const { module_key } = req.params;
    const { config_data } = req.body;
    
    const result = await pool.query(`
      UPDATE automation_configs 
      SET config_data = $1, updated_at = NOW()
      WHERE crm_user_id = $2 AND module_key = $3
      RETURNING *
    `, [JSON.stringify(config_data), crmUserId, module_key]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Automation not found or not enabled' });
    }
    
    res.json({ success: true, config: result.rows[0] });
  } catch (error) {
    console.error('Update config error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/automations/:module_key - Disable an automation
router.delete('/:module_key', async (req, res) => {
  try {
    const crmUserId = req.user.crm_user_id;
    const { module_key } = req.params;
    
    await pool.query(`
      UPDATE automation_configs 
      SET enabled = false, updated_at = NOW()
      WHERE crm_user_id = $1 AND module_key = $2
    `, [crmUserId, module_key]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Disable automation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/automations/logs - Get execution logs
router.get('/logs', async (req, res) => {
  try {
    const crmUserId = req.user.crm_user_id;
    const { module_key, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT * FROM automation_execution_logs 
      WHERE crm_user_id = $1
    `;
    const params = [crmUserId];
    
    if (module_key) {
      query += ` AND module_key = $2`;
      params.push(module_key);
    }
    
    query += ` ORDER BY executed_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await pool.query(query, params);
    
    res.json({ logs: result.rows });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/automations/stats - Get aggregated statistics
router.get('/stats', async (req, res) => {
  try {
    const crmUserId = req.user.crm_user_id;
    const { days = 30 } = req.query;
    
    const statsQuery = `
      SELECT 
        module_key,
        COUNT(*) as total_executions,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        AVG(execution_time_ms) as avg_execution_time
      FROM automation_execution_logs
      WHERE crm_user_id = $1
      AND executed_at >= NOW() - INTERVAL '${parseInt(days)} days'
      GROUP BY module_key
    `;
    
    const result = await pool.query(statsQuery, [crmUserId]);
    
    // Calculate overall stats
    const overall = {
      total_executions: 0,
      successful: 0,
      failed: 0,
      success_rate: 0
    };
    
    result.rows.forEach(row => {
      overall.total_executions += parseInt(row.total_executions);
      overall.successful += parseInt(row.successful);
      overall.failed += parseInt(row.failed);
    });
    
    if (overall.total_executions > 0) {
      overall.success_rate = Math.round((overall.successful / overall.total_executions) * 100);
    }
    
    res.json({ 
      by_module: result.rows,
      overall: overall
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

