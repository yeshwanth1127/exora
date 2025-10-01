const { pool } = require('../config/db');

// Suggested table schema:
// CREATE TABLE IF NOT EXISTS user_workflow_instances (
//   id SERIAL PRIMARY KEY,
//   user_id INTEGER NOT NULL,
//   source_workflow_id VARCHAR(64) NOT NULL,
//   instance_workflow_id VARCHAR(64) NOT NULL,
//   status VARCHAR(24) DEFAULT 'active',
//   activated_at TIMESTAMPTZ,
//   services_used TEXT[] DEFAULT '{}',
//   credential_id VARCHAR(128),
//   created_at TIMESTAMPTZ DEFAULT NOW(),
//   updated_at TIMESTAMPTZ DEFAULT NOW(),
//   UNIQUE(user_id, source_workflow_id)
// );

class UserWorkflowInstance {
  static async upsert({ userId, sourceWorkflowId, instanceWorkflowId, status = 'active', credentialId = null, servicesUsed = [] }) {
    const query = `
      INSERT INTO user_workflow_instances (user_id, source_workflow_id, instance_workflow_id, status, activated_at, services_used, credential_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), $5, $6, NOW(), NOW())
      ON CONFLICT (user_id, source_workflow_id)
      DO UPDATE SET instance_workflow_id = EXCLUDED.instance_workflow_id,
                    status = EXCLUDED.status,
                    activated_at = NOW(),
                    services_used = EXCLUDED.services_used,
                    credential_id = EXCLUDED.credential_id,
                    updated_at = NOW()
      RETURNING id, user_id AS "userId", source_workflow_id AS "sourceWorkflowId", instance_workflow_id AS "instanceWorkflowId", status, activated_at AS "activatedAt", services_used AS "servicesUsed", credential_id AS "credentialId";
    `;
    const res = await pool.query(query, [userId, sourceWorkflowId, instanceWorkflowId, status, servicesUsed, credentialId]);
    return res.rows[0];
  }

  static async findByUserSource({ userId, sourceWorkflowId }) {
    const res = await pool.query(
      'SELECT * FROM user_workflow_instances WHERE user_id=$1 AND source_workflow_id=$2',
      [userId, sourceWorkflowId]
    );
    return res.rows[0] || null;
  }

  static async findExistingUserWorkflowInstance(userId, sourceWorkflowId) {
    return this.findByUserSource({ userId, sourceWorkflowId });
  }

  static async getUserWorkflowInstances(userId) {
    const res = await pool.query(
      'SELECT * FROM user_workflow_instances WHERE user_id=$1 ORDER BY activated_at DESC NULLS LAST, updated_at DESC',
      [userId]
    );
    return res.rows;
  }
}

module.exports = UserWorkflowInstance;





