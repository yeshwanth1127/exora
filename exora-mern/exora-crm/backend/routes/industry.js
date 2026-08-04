const express = require('express');
const { validateExoraToken, requireCRMActivation } = require('../middleware/auth');
const { getAvailableIndustries, getIndustryTemplate } = require('../config/industryTemplates');

const router = express.Router();

// Get all available industry templates
router.get('/templates', (req, res) => {
  res.json({
    industries: getAvailableIndustries()
  });
});

// Get current user's industry configuration
router.get('/config', validateExoraToken, requireCRMActivation, (req, res) => {
  const crmUser = req.user.crm_user;
  const industry = crmUser.industry || 'general';
  const template = getIndustryTemplate(industry);
  
  res.json({
    industry: industry,
    template: template,
    custom_config: crmUser.industry_config || {}
  });
});

module.exports = router;

