const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Routes publiques
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/reset-password', userController.resetPassword);

// Routes protégées
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.get('/search', auth, userController.searchUsers);
router.get('/nearby', auth, userController.findNearbyUsers);
router.delete('/profile', auth, userController.deleteProfile);

// Routes pour la gestion des amis
router.post('/friends/request/:userId', auth, userController.sendFriendRequest);
router.put('/friends/request/:requestId', auth, userController.handleFriendRequest);
router.get('/friends', auth, userController.getFriends);
router.get('/friends/requests', auth, userController.getFriendRequests);
router.delete('/friends/:userId', auth, userController.removeFriend);

module.exports = router; 