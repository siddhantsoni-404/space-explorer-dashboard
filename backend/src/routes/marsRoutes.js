const express = require('express');
const router = express.Router();
const marsController = require('../controllers/marsController');
const { cacheMiddleware } = require('../middleware/cache');

// Cache Mars queries for 30 minutes (1800 seconds)
router.get('/', cacheMiddleware(1800), marsController.getMarsPhotos);

module.exports = router;
