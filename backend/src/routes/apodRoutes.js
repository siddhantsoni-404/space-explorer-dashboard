const express = require('express');
const router = express.Router();
const apodController = require('../controllers/apodController');
const { cacheMiddleware } = require('../middleware/cache');

// Cache APOD responses for 24 hours (86400 seconds)
router.get('/', cacheMiddleware(86400), apodController.getApod);

module.exports = router;
