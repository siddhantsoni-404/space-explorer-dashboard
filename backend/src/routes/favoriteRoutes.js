const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');

router.post('/', favoriteController.createFavorite);
router.get('/', favoriteController.getAllFavorites);
router.get('/:id', favoriteController.getOneFavorite);
router.patch('/:id', favoriteController.updateFavorite);
router.delete('/:id', favoriteController.deleteFavorite);

module.exports = router;
