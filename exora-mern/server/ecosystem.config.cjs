/**
 * PM2 ecosystem for Exora main API (same style as nammacabs/cab/ecosystem.config.cjs).
 * Usage (from anywhere):
 *   pm2 start /var/www/exora/exora-mern/server/ecosystem.config.cjs
 * Env: server loads dotenv from server/.env (PORT, DATABASE_URL, etc.).
 */
module.exports = {
  apps: [
    {
      name: 'exora-api',
      cwd: '/var/www/exora/exora-mern/server',
      script: 'server.js',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
      error_file: './logs/exora-api-error.log',
      out_file: './logs/exora-api-out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
