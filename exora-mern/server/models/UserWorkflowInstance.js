const { pool } = require('../config/db');

// Suggested table schema:
// CREATE TABLE IF NOT EXISTS user_workflow_instances (
//   id SERIAL PRIMARY KEY,
//   user_id INTEGER NOT NULL,
//   source_workflow_id VARCHAR(64) NOT NULL,
//   instance_workflow_id VARCHAR(64) NOT NULL,
//   status VARCHAR(24) DEFAULT 'active',
//   created_at TIMESTAMPTZ DEFAULT NOW(),
//   updated_at TIMESTAMPTZ DEFAULT NOW(),
//   UNIQUE(user_id, source_workflow_id)
// );

class UserWorkflowInstance {
  static async upsert({ userId, sourceWorkflowId, instanceWorkflowId, status = 'active' }) {
    const query = `
      INSERT INTO user_workflow_instances (user_id, source_workflow_id, instance_workflow_id, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT (user_id, source_workflow_id)
      DO UPDATE SET instance_workflow_id = EXCLUDED.instance_workflow_id,
                    status = EXCLUDED.status,
                    updated_at = NOW()
      RETURNING id, user_id AS "userId", source_workflow_id AS "sourceWorkflowId", instance_workflow_id AS "instanceWorkflowId", status;
    `;
    const res = await pool.query(query, [userId, sourceWorkflowId, instanceWorkflowId, status]);
    return res.rows[0];
  }

  static async findByUserSource({ userId, sourceWorkflowId }) {
    const res = await pool.query(
      'SELECT * FROM user_workflow_instances WHERE user_id=$1 AND source_workflow_id=$2',
      [userId, sourceWorkflowId]
    );
    return res.rows[0] || null;
  }
}

module.exports = UserWorkflowInstance;





