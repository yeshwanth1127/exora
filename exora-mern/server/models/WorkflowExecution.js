// server/models/WorkflowExecution.js

const { pool } = require('../config/db');

/**
 * WorkflowExecution Model
 * Manages workflow execution records and history
 */
class WorkflowExecution {
  
  /**
   * Create a new execution record
   */
  static async create({
    userId,
    templateWorkflowId,
    instanceWorkflowId,
    n8nExecutionId = null,
    inputData,
    outputData = null,
    status = 'running',
    errorMessage = null,
    executionTimeMs = null,
    triggerType = 'manual'
  }) {
    const query = `
      INSERT INTO workflow_executions (
        user_id, 
        template_workflow_id, 
        instance_workflow_id, 
        n8n_execution_id,
        input_data, 
        output_data, 
        status, 
        error_message,
        execution_time_ms,
        trigger_type,
        started_at,
        completed_at,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), $11, NOW())
      RETURNING *
    `;

    const completedAt = (status === 'success' || status === 'error') ? 'NOW()' : null;

    try {
      const result = await pool.query(query, [
        userId,
        templateWorkflowId,
        instanceWorkflowId,
        n8nExecutionId,
        JSON.stringify(inputData),
        outputData ? JSON.stringify(outputData) : null,
        status,
        errorMessage,
        executionTimeMs,
        triggerType,
        completedAt
      ]);

      return this._transformRow(result.rows[0]);
    } catch (error) {
      console.error('Error creating workflow execution:', error);
      throw error;
    }
  }

  /**
   * Update execution status and result
   */
  static async update(executionId, {
    status,
    outputData,
    errorMessage,
    executionTimeMs
  }) {
    const query = `
      UPDATE workflow_executions
      SET status = COALESCE($2, status),
          output_data = COALESCE($3, output_data),
          error_message = COALESCE($4, error_message),
          execution_time_ms = COALESCE($5, execution_time_ms),
          completed_at = CASE WHEN $2 IN ('success', 'error', 'timeout') THEN NOW() ELSE completed_at END
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        executionId,
        status,
        outputData ? JSON.stringify(outputData) : null,
        errorMessage,
        executionTimeMs
      ]);

      return result.rows.length > 0 ? this._transformRow(result.rows[0]) : null;
    } catch (error) {
      console.error('Error updating execution:', error);
      throw error;
    }
  }

  /**
   * Get execution by ID
   */
  static async findById(executionId) {
    const query = 'SELECT * FROM workflow_executions WHERE id = $1';

    try {
      const result = await pool.query(query, [executionId]);
      return result.rows.length > 0 ? this._transformRow(result.rows[0]) : null;
    } catch (error) {
      console.error('Error finding execution:', error);
      throw error;
    }
  }

  /**
   * Get execution history for a user's workflow
   */
  static async getHistory(userId, templateWorkflowId, limit = 20) {
    const query = `
      SELECT * FROM workflow_executions
      WHERE user_id = $1 AND template_workflow_id = $2
      ORDER BY created_at DESC
      LIMIT $3
    `;

    try {
      const result = await pool.query(query, [userId, templateWorkflowId, limit]);
      return result.rows.map(row => this._transformRow(row));
    } catch (error) {
      console.error('Error fetching execution history:', error);
      throw error;
    }
  }

  /**
   * Get all executions for a user
   */
  static async getUserExecutions(userId, limit = 50) {
    const query = `
      SELECT * FROM workflow_executions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    try {
      const result = await pool.query(query, [userId, limit]);
      return result.rows.map(row => this._transformRow(row));
    } catch (error) {
      console.error('Error fetching user executions:', error);
      throw error;
    }
  }

  /**
   * Get execution statistics for a workflow
   */
  static async getStats(userId, templateWorkflowId) {
    const query = `
      SELECT 
        COUNT(*) as total_executions,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_executions,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as failed_executions,
        AVG(execution_time_ms) as avg_execution_time_ms,
        MAX(created_at) as last_execution_at
      FROM workflow_executions
      WHERE user_id = $1 AND template_workflow_id = $2
    `;

    try {
      const result = await pool.query(query, [userId, templateWorkflowId]);
      const stats = result.rows[0];

      return {
        totalExecutions: parseInt(stats.total_executions) || 0,
        successfulExecutions: parseInt(stats.successful_executions) || 0,
        failedExecutions: parseInt(stats.failed_executions) || 0,
        avgExecutionTimeMs: Math.round(parseFloat(stats.avg_execution_time_ms)) || 0,
        lastExecutionAt: stats.last_execution_at
      };
    } catch (error) {
      console.error('Error fetching execution stats:', error);
      throw error;
    }
  }

  /**
   * Delete old executions (cleanup)
   */
  static async cleanup(daysOld = 30) {
    const query = `
      DELETE FROM workflow_executions
      WHERE created_at < NOW() - INTERVAL '${daysOld} days'
      RETURNING id
    `;

    try {
      const result = await pool.query(query);
      console.log(`Cleaned up ${result.rows.length} old workflow executions`);
      return result.rows.length;
    } catch (error) {
      console.error('Error cleaning up executions:', error);
      throw error;
    }
  }

  /**
   * Transform database row to camelCase object
   * @private
   */
  static _transformRow(row) {
    if (!row) return null;

    return {
      id: row.id,
      userId: row.user_id,
      templateWorkflowId: row.template_workflow_id,
      instanceWorkflowId: row.instance_workflow_id,
      n8nExecutionId: row.n8n_execution_id,
      inputData: row.input_data,
      outputData: row.output_data,
      status: row.status,
      errorMessage: row.error_message,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      executionTimeMs: row.execution_time_ms,
      triggerType: row.trigger_type,
      createdAt: row.created_at
    };
  }
}

module.exports = WorkflowExecution;


