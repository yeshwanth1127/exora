const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

/**
 * Validate JWT token from Exora platform
 * Extracts user info and checks CRM activation status
 */
async function validateExoraToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer '
    
    // Verify JWT (same secret as Exora)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const exoraUserId = decoded.id;
    const email = decoded.email;
    
    if (!exoraUserId) {
      return res.status(401).json({ error: 'Invalid token: missing user ID' });
    }
    
    // Get or create CRM user
    let result = await pool.query(
      'SELECT * FROM crm_users WHERE exora_user_id = $1',
      [exoraUserId]
    );
    
    let crmUser = result.rows[0];
    
    // Auto-create CRM user if doesn't exist
    if (!crmUser) {
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('🆕 [Auth] CREATING NEW CRM USER');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('Exora User ID:', exoraUserId);
      console.log('Email:', email);
      console.log('═══════════════════════════════════════════════════════════════');
      
      const createResult = await pool.query(
        `INSERT INTO crm_users (exora_user_id, status) 
         VALUES ($1, 'pending_setup') 
         RETURNING *`,
        [exoraUserId]
      );
      crmUser = createResult.rows[0];
      
      console.log('✅ [Auth] CRM user created successfully');
      console.log('CRM User ID:', crmUser.id);
      console.log('Status:', crmUser.status);
      console.log('n8n Workflow ID:', crmUser.n8n_workflow_id || 'Not yet assigned');
      console.log('═══════════════════════════════════════════════════════════════\n');
    } else {
      console.log('🔐 [Auth] Existing CRM user authenticated');
      console.log('   CRM User ID:', crmUser.id);
      console.log('   Workflow ID:', crmUser.n8n_workflow_id || 'Not assigned');
      console.log('   Status:', crmUser.status);
    }
    
    // Attach to request
    req.user = {
      exora_user_id: exoraUserId,
      crm_user_id: crmUser.id,
      email: email,
      crm_user: crmUser
    };
    
    next();
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(401).json({ error: 'Authentication failed: ' + error.message });
  }
}

/**
 * Ensure user has CRM user record
 * Use this for all CRM endpoints
 */
function requireCRMActivation(req, res, next) {
  if (!req.user.crm_user_id) {
    return res.status(403).json({ 
      error: 'CRM not activated',
      message: 'Please activate CRM from Exora dashboard first.'
    });
  }
  // Allow access even if status is 'pending_setup'
  // The frontend will handle showing the setup wizard
  next();
}

/**
 * Ensure user has completed setup
 * Use this for endpoints that require fully configured CRM
 */
function requireCompleteSetup(req, res, next) {
  if (!req.user.crm_user_id) {
    return res.status(403).json({ 
      error: 'CRM not activated',
      message: 'Please activate CRM from Exora dashboard first.'
    });
  }
  
  if (req.user.crm_user?.status === 'pending_setup') {
    return res.status(403).json({ 
      error: 'Setup required',
      message: 'Please complete CRM setup first.',
      needs_setup: true
    });
  }
  
  next();
}

module.exports = {
  validateExoraToken,
  requireCRMActivation,
  requireCompleteSetup
};

