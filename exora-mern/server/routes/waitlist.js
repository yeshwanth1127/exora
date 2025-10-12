const express = require('express');
const router = express.Router();
const { joinWaitlist, getWaitlistCount, getAllWaitlistEntries } = require('../controllers/waitlistController');

// Public routes
router.post('/join', joinWaitlist);
router.get('/count', getWaitlistCount);

// Admin route (you can add auth middleware later)
router.get('/all', getAllWaitlistEntries);

module.exports = router;

