const { Pool } = require('pg');

let pool;

function createPool() {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    pool = new Pool({
      connectionString,
      ssl: /^(require|true)$/i.test(process.env.PGSSLMODE || '') ? { rejectUnauthorized: false } : false,
    });
  } else {
    pool = new Pool({
      host: process.env.PGHOST || '127.0.0.1',
      port: Number(process.env.PGPORT || 5432),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '',
      database: process.env.PGDATABASE || 'exora-web',
      ssl: false,
    });
  }
  return pool;
}

async function connectToDatabase() {
  const createdPool = createPool();
  const client = await createdPool.connect();
  try {
    await client.query('SELECT 1');
    console.log('[DB] PostgreSQL connected');
  } finally {
    client.release();
  }
  return createdPool;
}

async function getDbHealth() {
  const createdPool = createPool();
  const result = await createdPool.query('select current_database() as db, version() as version');
  const row = result.rows[0] || {};
  return {
    state: 'connected',
    database: row.db,
    version: row.version,
  };
}

module.exports = {
  connectToDatabase,
  getDbHealth,
  get pool() {
    return createPool();
  },
};
