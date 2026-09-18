const express = require('express');
const router = express.Router();
const { submitContact } = require('../controllers/contactController');

// Public marketing contact form
router.post('/', submitContact);

module.exports = router;
