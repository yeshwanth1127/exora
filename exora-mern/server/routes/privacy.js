const path = require('path');
const express = require('express');

const router = express.Router();

// Serve privacy policy HTML
router.get('/privacy-policy', (req, res) => {
  const filePath = path.join(__dirname, '..', 'public', 'privacy-policy.html');
  res.sendFile(filePath);
});

module.exports = router;


