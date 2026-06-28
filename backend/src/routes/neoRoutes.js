const express = require('express');
const router = express.Router();
const neoController = require('../controllers/neoController');
const { cacheMiddleware } = require('../middleware/cache');

// Cache NEO responses for 1 hour (3600 seconds)
router.get('/', cacheMiddleware(3600), neoController.getNeo);

module.exports = router;
