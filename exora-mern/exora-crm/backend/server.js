require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/industry', require('./routes/industry'));
app.use('/api/setup', require('./routes/setup'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/opportunities', require('./routes/opportunities'));
app.use('/api/events', require('./routes/events'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/automation-history', require('./routes/automationHistory'));
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api/webhooks', require('./routes/evolutionWebhook')); // Evolution API webhooks
app.use('/api/automations', require('./routes/automations'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/workflow', require('./routes/workflowManagement'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/internal', require('./routes/internal')); // Internal server-to-server APIs
app.use('/api/whatsapp', require('./routes/whatsapp')); // WhatsApp management

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'exora-crm-api',
    version: '1.0.0'
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Exora CRM API',
    version: '1.0.0',
    docs: '/api/docs'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database. Please check your .env configuration.');
      process.exit(1);
    }
    
    // Start background auto-sync job
    // This automatically syncs users who have workflows but no automation catalog
    const { startAutoSyncJob } = require('./services/autoSyncService');
    startAutoSyncJob();
    console.log('✅ Background auto-sync job started (checks every 5 minutes)');
    
    // Start Evolution API health check job
    // Monitors WhatsApp session health and handles auto-reconnect
    const { startHealthCheckJob } = require('./jobs/evolutionHealthCheck');
    startHealthCheckJob();
    console.log('✅ Evolution API health monitoring started (checks every 5 minutes)');
    
    app.listen(PORT, () => {
      const isProduction = process.env.NODE_ENV === 'production';
      const baseUrl = isProduction 
        ? 'https://crm-api.exora.solutions' 
        : `http://localhost:${PORT}`;
      
      console.log('');
      console.log('='.repeat(60));
      console.log(`✅ Exora CRM Backend running on ${baseUrl}`);
      console.log('='.repeat(60));
      console.log('');
      console.log('📊 Endpoints:');
      console.log(`   Health: ${baseUrl}/health`);
      console.log(`   API: ${baseUrl}/api/`);
      console.log('');
      console.log('🌍 Environment: ' + (isProduction ? 'PRODUCTION 🚀' : 'DEVELOPMENT 🔧'));
      console.log('💾 Database: ' + (process.env.DB_NAME || 'exora-crm'));
      console.log('🔐 JWT Secret: ' + (process.env.JWT_SECRET ? 'Configured ✓' : 'MISSING ❌'));
      console.log('🔗 CORS Origins: ' + (process.env.CORS_ORIGINS || '*'));
      console.log('📡 n8n URL: ' + (process.env.N8N_BASE_URL || 'NOT SET'));
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

