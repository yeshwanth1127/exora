const { pool } = require('../config/db');

class DashboardData {
  static async create(userId, dashboardData) {
    const {
      businessInfo = {},
      workflows = [],
      recommendations = [],
      metrics = {},
      isConfigured = false
    } = dashboardData;

    const query = `
      INSERT INTO dashboard_data (user_id, business_info, workflows, recommendations, metrics, is_configured, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      userId,
      JSON.stringify(businessInfo),
      JSON.stringify(workflows),
      JSON.stringify(recommendations),
      JSON.stringify(metrics),
      isConfigured
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating dashboard data:', error);
      throw error;
    }
  }

  static async findByUserId(userId) {
    const query = `
      SELECT * FROM dashboard_data 
      WHERE user_id = $1 
      ORDER BY updated_at DESC 
      LIMIT 1
    `;

    try {
      const result = await pool.query(query, [userId]);
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          userId: row.user_id,
          businessInfo: row.business_info,
          workflows: row.workflows,
          recommendations: row.recommendations,
          metrics: row.metrics,
          isConfigured: row.is_configured,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        };
      }
      return null;
    } catch (error) {
      console.error('Error finding dashboard data:', error);
      throw error;
    }
  }

  static async update(userId, dashboardData) {
    const {
      businessInfo,
      workflows,
      recommendations,
      metrics,
      isConfigured
    } = dashboardData;

    const query = `
      UPDATE dashboard_data 
      SET 
        business_info = $2,
        workflows = $3,
        recommendations = $4,
        metrics = $5,
        is_configured = $6,
        updated_at = NOW()
      WHERE user_id = $1
      RETURNING *
    `;

    const values = [
      userId,
      JSON.stringify(businessInfo || {}),
      JSON.stringify(workflows || []),
      JSON.stringify(recommendations || []),
      JSON.stringify(metrics || {}),
      isConfigured
    ];

    try {
      console.log('Executing update query with values:', values);
      const result = await pool.query(query, values);
      console.log('Update query result:', result.rows.length, 'rows affected');
      
      if (result.rows.length > 0) {
        const row = result.rows[0];
        const updatedData = {
          id: row.id,
          userId: row.user_id,
          businessInfo: row.business_info,
          workflows: row.workflows,
          recommendations: row.recommendations,
          metrics: row.metrics,
          isConfigured: row.is_configured,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        };
        console.log('Updated data:', {
          workflows: updatedData.workflows?.length || 0,
          isConfigured: updatedData.isConfigured
        });
        return updatedData;
      }
      console.log('No rows returned from update query');
      return null;
    } catch (error) {
      console.error('Error updating dashboard data:', error);
      throw error;
    }
  }

  static async upsert(userId, dashboardData) {
    console.log('Upsert called for user:', userId);
    console.log('Dashboard data to upsert:', {
      workflows: dashboardData.workflows?.length || 0,
      isConfigured: dashboardData.isConfigured
    });
    
    const existing = await this.findByUserId(userId);
    console.log('Existing data found:', !!existing);
    
    if (existing) {
      console.log('Updating existing record');
      return await this.update(userId, dashboardData);
    } else {
      console.log('Creating new record');
      return await this.create(userId, dashboardData);
    }
  }

  static async delete(userId) {
    const query = 'DELETE FROM dashboard_data WHERE user_id = $1';
    
    try {
      await pool.query(query, [userId]);
      return true;
    } catch (error) {
      console.error('Error deleting dashboard data:', error);
      throw error;
    }
  }

  static async updateWorkflowStatus(userId, workflowId, status) {
    try {
      console.log(`[updateWorkflowStatus] Starting update for user ${userId}, workflow ${workflowId}, status ${status}`);
      
      const dashboardData = await this.findByUserId(userId);
      if (!dashboardData) {
        console.error('[updateWorkflowStatus] Dashboard data not found for user:', userId);
        return false;
      }

      console.log(`[updateWorkflowStatus] Found dashboard data, workflows count:`, dashboardData.workflows?.length || 0);

      // Update the workflow status in the workflows array
      const workflows = dashboardData.workflows || [];
      console.log(`[updateWorkflowStatus] Workflows to check:`, workflows.map(w => ({ id: w.id, name: w.name, currentStatus: w.status })));
      
      let foundWorkflow = false;
      const updatedWorkflows = workflows.map(workflow => {
        console.log(`[updateWorkflowStatus] Comparing: "${workflow.id}" === "${workflowId}"`, workflow.id === workflowId);
        if (workflow.id === workflowId) {
          foundWorkflow = true;
          console.log(`[updateWorkflowStatus] ✓ Found matching workflow, updating status from "${workflow.status}" to "${status}"`);
          return { ...workflow, status };
        }
        return workflow;
      });

      if (!foundWorkflow) {
        console.error(`[updateWorkflowStatus] ❌ Workflow with id ${workflowId} not found in dashboard workflows`);
        return false;
      }

      console.log(`[updateWorkflowStatus] Calling update with workflows:`, updatedWorkflows.map(w => ({ id: w.id, status: w.status })));

      // Update the dashboard data
      const updated = await this.update(userId, {
        businessInfo: dashboardData.businessInfo,
        workflows: updatedWorkflows,
        recommendations: dashboardData.recommendations,
        metrics: dashboardData.metrics,
        isConfigured: dashboardData.isConfigured
      });

      console.log(`[updateWorkflowStatus] ✓ Updated workflow ${workflowId} status to ${status} for user ${userId}`);
      return !!updated;
    } catch (error) {
      console.error('[updateWorkflowStatus] Error updating workflow status:', error);
      throw error;
    }
  }
}

module.exports = DashboardData;
