const express = require('express');
const { validateExoraToken, requireCRMActivation } = require('../middleware/auth');

const router = express.Router();

// Validate token
router.get('/validate', validateExoraToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      exora_user_id: req.user.exora_user_id,
      crm_user_id: req.user.crm_user_id,
      email: req.user.email
    }
  });
});

// Get current user
router.get('/me', validateExoraToken, requireCRMActivation, (req, res) => {
  res.json({
    exora_user_id: req.user.exora_user_id,
    crm_user_id: req.user.crm_user_id,
    email: req.user.email,
    crm_user: req.user.crm_user
  });
});

module.exports = router;

