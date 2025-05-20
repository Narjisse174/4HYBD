const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

// Toutes les routes de messages nécessitent une authentification
router.use(auth);

// Routes pour les messages individuels
router.post('/send', messageController.sendMessage);
router.get('/conversation/:userId', messageController.getConversation);
router.get('/unread', messageController.getUnreadMessages);
router.put('/read/:messageId', messageController.markAsRead);

// Routes pour les messages de groupe
router.post('/group/send', messageController.sendGroupMessage);

module.exports = router; 