const { Pool } = require('pg');

// Separate connection pool for CRM database
let crmPool;

function getCRMPool() {
  if (crmPool) return crmPool;

  // Use same PostgreSQL server, different database
  const connectionString = process.env.DATABASE_URL;
  
  if (connectionString) {
    // Replace database name in connection string
    const crmConnectionString = connectionString.replace(/\/[^\/]+(\?|$)/, '/exora-crm$1');
    crmPool = new Pool({
      connectionString: crmConnectionString,
      ssl: /^(require|true)$/i.test(process.env.PGSSLMODE || '') ? { rejectUnauthorized: false } : false,
    });
  } else {
    // Use individual connection params
    crmPool = new Pool({
      host: process.env.PGHOST || '127.0.0.1',
      port: Number(process.env.PGPORT || 5432),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '',
      database: 'exora-crm', // CRM database
      ssl: false,
    });
  }

  return crmPool;
}

module.exports = {
  getCRMPool
};


