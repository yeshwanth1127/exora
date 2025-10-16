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
    
    // Get CRM user
    const result = await pool.query(
      'SELECT * FROM crm_users WHERE exora_user_id = $1',
      [exoraUserId]
    );
    
    const crmUser = result.rows[0] || null;
    
    // Attach to request
    req.user = {
      exora_user_id: exoraUserId,
      crm_user_id: crmUser ? crmUser.id : null,
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
 * Ensure user has CRM activated
 * Use this for all CRM endpoints
 */
function requireCRMActivation(req, res, next) {
  if (!req.user.crm_user_id) {
    return res.status(403).json({ 
      error: 'CRM not activated',
      message: 'Please activate CRM from Exora dashboard first.'
    });
  }
  next();
}

module.exports = {
  validateExoraToken,
  requireCRMActivation
};

