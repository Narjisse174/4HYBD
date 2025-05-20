const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Routes publiques
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/reset-password', userController.resetPassword);

// Routes protégées
router.get('/search', auth, userController.searchUsers);
router.get('/nearby', auth, userController.findNearbyUsers);
router.post('/friends', auth, userController.addFriend);
router.put('/profile', auth, userController.updateProfile);

module.exports = router; 