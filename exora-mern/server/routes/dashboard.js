const express = require('express');
const { 
  getDashboardOverview,
  getUserAgents,
  createAgent,
  getAgentTemplates,
  getRecentActivities,
  getNotifications,
  markNotificationAsRead,
  getStatisticsHistory
} = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticateToken);

// Dashboard overview
router.get('/overview', getDashboardOverview);

// User agents
router.get('/agents', getUserAgents);
router.post('/agents', createAgent);

// Agent templates
router.get('/templates', getAgentTemplates);

// Activities
router.get('/activities', getRecentActivities);

// Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/:notificationId/read', markNotificationAsRead);

// Statistics
router.get('/statistics/history', getStatisticsHistory);

module.exports = router;

