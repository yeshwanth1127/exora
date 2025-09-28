const UserStatistics = require('../models/UserStatistics');
const AgentActivity = require('../models/AgentActivity');
const UserAgent = require('../models/UserAgent');
const UserNotification = require('../models/UserNotification');
const AgentTemplate = require('../models/AgentTemplate');
const DashboardData = require('../models/DashboardData');

// Get dashboard overview data
const getDashboardOverview = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get dashboard data first
    const dashboardData = await DashboardData.findByUserId(userId);
    
    if (!dashboardData || !dashboardData.isConfigured) {
      // Return empty state for unconfigured dashboard
      return res.status(200).json({
        success: true,
        data: {
          isConfigured: false,
          businessInfo: {},
          workflows: [],
          recommendations: [],
          metrics: {},
          recentActivities: [],
          userAgents: [],
          unreadNotifications: 0
        }
      });
    }

    // Get user statistics
    const statsData = await UserStatistics.getDashboardStats(userId);
    
    // Get recent activities
    const recentActivities = await AgentActivity.getRecentByUserId(userId, 5);
    
    // Get user agents
    const userAgents = await UserAgent.findByUserId(userId);
    
    // Get unread notifications count
    const unreadNotifications = await UserNotification.getUnreadCount(userId);

    // Format recent activities for display
    const formattedActivities = recentActivities.map(activity => ({
      id: activity.id,
      type: activity.activityType,
      message: activity.title,
      time: getTimeAgo(activity.createdAt),
      agentName: activity.agentName
    }));

    res.status(200).json({
      success: true,
      data: {
        isConfigured: true,
        businessInfo: dashboardData.businessInfo,
        workflows: dashboardData.workflows,
        recommendations: dashboardData.recommendations,
        metrics: dashboardData.metrics,
        stats: statsData.stats,
        changes: statsData.changes,
        recentActivities: formattedActivities,
        userAgents: userAgents.map(agent => agent.toSafeObject()),
        unreadNotifications,
        lastUpdated: statsData.lastUpdated
      }
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user agents
const getUserAgents = async (req, res) => {
  try {
    const userId = req.user.id;
    const agents = await UserAgent.findByUserId(userId);

    res.status(200).json({
      success: true,
      data: {
        agents: agents.map(agent => agent.toSafeObject())
      }
    });
  } catch (error) {
    console.error('Get user agents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load user agents',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create new agent
const createAgent = async (req, res) => {
  try {
    const { agentType, name, configuration } = req.body;
    const userId = req.user.id;

    const agent = await UserAgent.create({
      userId,
      agentType,
      name,
      configuration
    });

    // Create initial activity
    await AgentActivity.create({
      agentId: agent.id,
      userId,
      activityType: 'agent_created',
      title: `Agent "${name}" created successfully`,
      description: `New ${agentType} agent has been deployed`,
      metadata: { agentType, configuration }
    });

    // Emit realtime update to this user's dashboard room
    try {
      const io = req.app.get('io');
      if (io) io.to(`dashboard:${userId}`).emit('dashboard:update', { type: 'agent_created' });
    } catch (_) {}

    res.status(201).json({
      success: true,
      message: 'Agent created successfully',
      data: {
        agent: agent.toSafeObject()
      }
    });
  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create agent',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get agent templates
const getAgentTemplates = async (req, res) => {
  try {
    const userId = req.user.id;
    const userUsageType = req.user.usageType || 'business';
    
    const templates = await AgentTemplate.findByUsageType(userUsageType);

    res.status(200).json({
      success: true,
      data: {
        templates: templates.map(template => template.toSafeObject())
      }
    });
  } catch (error) {
    console.error('Get agent templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load agent templates',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get recent activities
const getRecentActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;
    
    const activities = await AgentActivity.getRecentByUserId(userId, limit);

    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      type: activity.activityType,
      message: activity.title,
      time: getTimeAgo(activity.createdAt),
      agentName: activity.agentName,
      description: activity.description
    }));

    res.status(200).json({
      success: true,
      data: {
        activities: formattedActivities
      }
    });
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load recent activities',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user notifications
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    
    const notifications = await UserNotification.findByUserId(userId, limit, offset);
    const unreadCount = await UserNotification.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: {
        notifications: notifications.map(notification => notification.toSafeObject()),
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    // Verify notification belongs to user
    const notification = await UserNotification.findById(notificationId);
    if (!notification || notification.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get statistics history for charts
const getStatisticsHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { statType, days = 30 } = req.query;

    const history = await UserStatistics.getHistory(userId, statType, parseInt(days));

    res.status(200).json({
      success: true,
      data: {
        history: history.map(record => ({
          date: record.date,
          value: parseFloat(record.avg_value),
          max: parseFloat(record.max_value),
          min: parseFloat(record.min_value)
        }))
      }
    });
  } catch (error) {
    console.error('Get statistics history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load statistics history',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Helper function to format time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
}

// Update dashboard data
const updateDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const dashboardData = req.body;

    const result = await DashboardData.upsert(userId, dashboardData);

    // Emit realtime update
    try {
      const io = req.app.get('io');
      if (io) io.to(`dashboard:${userId}`).emit('dashboard:update', { type: 'data_updated' });
    } catch (_) {}

    res.status(200).json({
      success: true,
      message: 'Dashboard data updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Update dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get dashboard data
const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const dashboardData = await DashboardData.findByUserId(userId);

    if (!dashboardData) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard data not found'
      });
    }

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Reset dashboard data
const resetDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    await DashboardData.delete(userId);

    // Emit realtime update
    try {
      const io = req.app.get('io');
      if (io) io.to(`dashboard:${userId}`).emit('dashboard:update', { type: 'data_reset' });
    } catch (_) {}

    res.status(200).json({
      success: true,
      message: 'Dashboard data reset successfully'
    });
  } catch (error) {
    console.error('Reset dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Add workflows to dashboard
const addWorkflowsToDashboard = async (req, res) => {
  try {
    const { workflows } = req.body;
    const userId = req.user.id;

    console.log('Adding workflows to dashboard for user:', userId);
    console.log('Workflows to add:', workflows);

    if (!workflows || !Array.isArray(workflows)) {
      return res.status(400).json({
        success: false,
        error: 'Workflows array is required'
      });
    }

    // Get or create dashboard data
    let dashboardData = await DashboardData.findByUserId(userId);
    console.log('Existing dashboard data:', dashboardData);
    
    if (!dashboardData) {
      dashboardData = {
        businessInfo: {},
        workflows: [],
        recommendations: [],
        metrics: {},
        isConfigured: false
      };
      console.log('Created new dashboard data object');
    }

    // Add selected workflows to dashboard
    const selectedWorkflows = workflows.map(workflow => ({
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      active: workflow.active,
      category: getWorkflowCategory(workflow),
      icon: getWorkflowIcon(workflow),
      nodes: workflow.nodes,
      connections: workflow.connections,
      triggers: workflow.triggers,
      actions: workflow.actions,
      createdAt: workflow.createdAt,
      addedAt: new Date().toISOString(),
      status: 'inactive' // Start as inactive, user can activate later
    }));

    // Check for duplicates
    const existingWorkflowIds = dashboardData.workflows.map(w => w.id);
    const newWorkflows = selectedWorkflows.filter(w => !existingWorkflowIds.includes(w.id));
    const duplicateWorkflows = selectedWorkflows.filter(w => existingWorkflowIds.includes(w.id));
    
    // If all workflows are duplicates, return early
    if (newWorkflows.length === 0) {
      const duplicateNames = duplicateWorkflows.map(w => w.name).join(', ');
      return res.json({
        success: true,
        message: `The workflow${duplicateWorkflows.length > 1 ? 's' : ''} "${duplicateNames}" ${duplicateWorkflows.length > 1 ? 'are' : 'is'} already added to your dashboard`,
        data: {
          addedWorkflows: [],
          duplicateWorkflows: duplicateWorkflows,
          totalWorkflows: dashboardData.workflows.length
        }
      });
    }
    
    // Add new workflows to dashboard
    dashboardData.workflows = [...dashboardData.workflows, ...newWorkflows];
    dashboardData.isConfigured = true;

    console.log('Updated dashboard data before save:', {
      workflows: dashboardData.workflows.length,
      isConfigured: dashboardData.isConfigured
    });

    // Save to database
    console.log('Saving to database...');
    const savedData = await DashboardData.upsert(userId, dashboardData);
    console.log('Saved data result:', savedData);

    // Prepare response message
    let message = `Successfully added ${newWorkflows.length} workflow${newWorkflows.length !== 1 ? 's' : ''} to your dashboard`;
    if (duplicateWorkflows.length > 0) {
      const duplicateNames = duplicateWorkflows.map(w => w.name).join(', ');
      message += `. Note: "${duplicateNames}" ${duplicateWorkflows.length > 1 ? 'were' : 'was'} already in your dashboard`;
    }

    res.json({
      success: true,
      message: message,
      data: {
        addedWorkflows: newWorkflows,
        duplicateWorkflows: duplicateWorkflows,
        totalWorkflows: dashboardData.workflows.length
      }
    });

  } catch (error) {
    console.error('Error adding workflows to dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add workflows to dashboard'
    });
  }
};

// Helper functions
function getWorkflowCategory(workflow) {
  const name = workflow.name.toLowerCase();
  if (name.includes('whatsapp') || name.includes('chatbot')) return 'Communication';
  if (name.includes('booking') || name.includes('calendar')) return 'Scheduling';
  if (name.includes('email')) return 'Email Automation';
  if (name.includes('data') || name.includes('sync')) return 'Data Management';
  return 'General Automation';
}

function getWorkflowIcon(workflow) {
  const name = workflow.name.toLowerCase();
  if (name.includes('whatsapp') || name.includes('chatbot')) return '💬';
  if (name.includes('booking') || name.includes('calendar')) return '📅';
  if (name.includes('email')) return '📧';
  if (name.includes('data') || name.includes('sync')) return '🔄';
  return '⚡';
}

module.exports = {
  getDashboardOverview,
  getUserAgents,
  createAgent,
  getAgentTemplates,
  getRecentActivities,
  getNotifications,
  markNotificationAsRead,
  getStatisticsHistory,
  updateDashboardData,
  getDashboardData,
  resetDashboardData,
  addWorkflowsToDashboard
};

