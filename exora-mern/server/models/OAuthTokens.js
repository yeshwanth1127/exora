const { pool } = require('../config/db');
const crypto = require('crypto');

const ENC_ALGO = 'aes-256-gcm';
function encrypt(text) {
  const key = (process.env.OAUTH_ENCRYPTION_KEY || '').padEnd(32, '0').slice(0, 32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ENC_ALGO, Buffer.from(key), iv);
  const enc = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}
function decrypt(b64) {
  const key = (process.env.OAUTH_ENCRYPTION_KEY || '').padEnd(32, '0').slice(0, 32);
  const buf = Buffer.from(b64, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = crypto.createDecipheriv(ENC_ALGO, Buffer.from(key), iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return dec.toString('utf8');
}

// Table schema (PostgreSQL):
// CREATE TABLE IF NOT EXISTS oauth_tokens (
//   id SERIAL PRIMARY KEY,
//   user_id INTEGER NOT NULL,
//   workflow_id VARCHAR(64) NOT NULL,
//   provider VARCHAR(32) NOT NULL,
//   access_token TEXT NOT NULL,
//   refresh_token TEXT,
//   expiry_date TIMESTAMPTZ,
//   scope TEXT,
//   created_at TIMESTAMPTZ DEFAULT NOW(),
//   updated_at TIMESTAMPTZ DEFAULT NOW(),
//   UNIQUE(user_id, workflow_id, provider)
// );

class OAuthTokens {
  static async upsert({ userId, workflowId, provider, accessToken, refreshToken, expiryDate, scope }) {
    const query = `
      INSERT INTO oauth_tokens (user_id, workflow_id, provider, access_token, refresh_token, expiry_date, scope, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      ON CONFLICT (user_id, workflow_id, provider)
      DO UPDATE SET access_token = EXCLUDED.access_token,
                    refresh_token = EXCLUDED.refresh_token,
                    expiry_date = EXCLUDED.expiry_date,
                    scope = EXCLUDED.scope,
                    updated_at = NOW()
      RETURNING id, user_id AS "userId", workflow_id AS "workflowId", provider, expiry_date AS "expiryDate", scope;
    `;
    const params = [
      userId,
      workflowId,
      provider,
      encrypt(accessToken),
      refreshToken ? encrypt(refreshToken) : null,
      expiryDate || null,
      scope || null,
    ];
    const res = await pool.query(query, params);
    return res.rows[0];
  }

  static async findByUserWorkflow({ userId, workflowId, provider }) {
    const res = await pool.query(
      'SELECT * FROM oauth_tokens WHERE user_id=$1 AND workflow_id=$2 AND provider=$3',
      [userId, workflowId, provider]
    );
    const row = res.rows[0];
    if (!row) return null;
    try {
      row.access_token = decrypt(row.access_token);
      if (row.refresh_token) row.refresh_token = decrypt(row.refresh_token);
    } catch (_) {}
    return row;
  }
}

module.exports = OAuthTokens;


