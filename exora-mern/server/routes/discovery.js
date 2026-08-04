const express = require('express');
const router = express.Router();
const BusinessDiscoveryAgent = require('../services/BusinessDiscoveryAgent');
const WorkflowGenerationService = require('../services/WorkflowGenerationService');
const BusinessDiscoverySession = require('../models/BusinessDiscoverySession');
const BusinessProfile = require('../models/BusinessProfile');
const WorkflowRecommendation = require('../models/WorkflowRecommendation');
const { authenticateToken } = require('../middleware/auth');

const discoveryAgent = new BusinessDiscoveryAgent();
const workflowService = new WorkflowGenerationService();

// Start discovery session
router.post('/start-session', authenticateToken, async (req, res) => {
  try {
    console.log('Starting discovery session for user:', req.user.id);
    const userId = req.user.id;
    
    // Check if user already has an active session
    const existingSession = await BusinessDiscoverySession.findActiveByUserId(userId);
    if (existingSession) {
      console.log('Found existing session:', existingSession.id);
      return res.json({
        success: true,
        id: existingSession.id,
        status: existingSession.sessionStatus,
        phase: existingSession.discoveryData.currentPhase || 'Phase 1: Business Overview'
      });
    }
    
    console.log('Creating new session for user:', userId);
    const session = await BusinessDiscoverySession.create({
      userId,
      sessionStatus: 'active',
      discoveryData: {},
      conversationHistory: []
    });

    console.log('Session created successfully:', session.id);
    res.json({
      success: true,
      id: session.id,
      status: 'active',
      phase: 'Phase 1: Business Overview'
    });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Process user message
router.post('/process-message', authenticateToken, async (req, res) => {
  try {
    const { sessionId, message, currentContext } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }
    
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a non-empty string'
      });
    }
    
    // Verify session belongs to user
    const session = await BusinessDiscoverySession.findById(sessionId);
    if (!session || session.userId !== userId) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    const result = await discoveryAgent.processUserMessage(
      sessionId, 
      message, 
      currentContext
    );

    // Check if discovery is complete
    if (result.isComplete || discoveryAgent.isDiscoveryComplete(result.discoveredInfo)) {
      // Generate workflow recommendations
      const recommendations = discoveryAgent.generateWorkflowRecommendations(result.discoveredInfo);
      result.recommendedWorkflows = recommendations;
      
      // Mark session as completed
      await session.complete();
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Process message error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Generate workflow recommendations
router.post('/generate-workflows', authenticateToken, async (req, res) => {
  try {
    const { sessionId, businessProfile } = req.body;
    const userId = req.user.id;
    
    // Verify session belongs to user
    const session = await BusinessDiscoverySession.findById(sessionId);
    if (!session || session.userId !== userId) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    // Create business profile in database
    const profile = await BusinessProfile.create({
      userId,
      sessionId,
      industry: businessProfile.industry,
      business_size: businessProfile.businessSize,
      pain_points: businessProfile.painPoints || [],
      current_tools: businessProfile.currentTools || [],
      automation_goals: businessProfile.automationGoals || []
    });

    // Generate workflow recommendations
    const workflows = await workflowService.generateWorkflowsFromDiscovery(profile);
    
    // Save recommendations
    const savedRecommendations = await Promise.all(
      workflows.map(workflow => 
        WorkflowRecommendation.create({
          userId,
          sessionId,
          workflow_type: workflow.name,
          priority_score: workflow.priority,
          recommended_reason: workflow.description,
          estimated_impact: workflow.expectedImpact,
          estimated_setup_time: workflow.estimatedSetupTime,
          setup_complexity: workflow.setupComplexity,
          n8n_workflow_json: workflow.n8nWorkflow
        })
      )
    );

    res.json({
      success: true,
      workflows: savedRecommendations.map(rec => ({
        id: rec.id,
        name: rec.workflowType,
        description: rec.recommendedReason,
        expectedImpact: rec.estimatedImpact,
        estimatedSetupTime: rec.estimatedSetupTime,
        priority: rec.priorityScore,
        setupComplexity: rec.setupComplexity
      }))
    });
  } catch (error) {
    console.error('Generate workflows error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Deploy workflow
router.post('/deploy-workflow', authenticateToken, async (req, res) => {
  try {
    const { workflowId } = req.body;
    const userId = req.user.id;
    
    const recommendation = await WorkflowRecommendation.findById(workflowId);
    if (!recommendation || recommendation.userId !== userId) {
      return res.status(404).json({ 
        success: false,
        error: 'Workflow not found' 
      });
    }

    const deployment = await workflowService.deployWorkflowToN8N(
      recommendation.n8nWorkflowJson,
      userId
    );

    if (deployment.success) {
      await recommendation.approve(deployment.workflowId, deployment.webhookUrl);
    }

    res.json({
      success: deployment.success,
      ...deployment
    });
  } catch (error) {
    console.error('Deploy workflow error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Get user's workflow recommendations
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const recommendations = await WorkflowRecommendation.findByUserId(userId);
    
    res.json({
      success: true,
      recommendations: recommendations.map(rec => rec.toSafeObject())
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Get discovery session status
router.get('/session/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    
    const session = await BusinessDiscoverySession.findById(sessionId);
    if (!session || session.userId !== userId) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    res.json({
      success: true,
      session: session.toSafeObject()
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Complete discovery session
router.post('/complete-session', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id;
    
    const session = await BusinessDiscoverySession.findById(sessionId);
    if (!session || session.userId !== userId) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    await session.complete();
    
    res.json({
      success: true,
      message: 'Discovery session completed'
    });
  } catch (error) {
    console.error('Complete session error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;

