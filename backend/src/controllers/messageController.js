const Message = require('../models/Message');
const User = require('../models/User');

// Envoyer un message à un utilisateur
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content, mediaUrl, mediaType } = req.body;
    const senderId = req.user.id;

    const message = new Message({
      sender: senderId,
      recipients: [recipientId],
      content,
      mediaUrl,
      mediaType,
      isGroupMessage: false
    });

    await message.save();

    // Ajouter le message aux messages lus par l'expéditeur
    message.readBy.push({
      user: senderId,
      readAt: new Date()
    });

    await message.save();

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message', error: error.message });
  }
};

// Envoyer un message à un groupe
exports.sendGroupMessage = async (req, res) => {
  try {
    const { recipientIds, content, mediaUrl, mediaType } = req.body;
    const senderId = req.user.id;

    const message = new Message({
      sender: senderId,
      recipients: recipientIds,
      content,
      mediaUrl,
      mediaType,
      isGroupMessage: true
    });

    await message.save();

    // Ajouter le message aux messages lus par l'expéditeur
    message.readBy.push({
      user: senderId,
      readAt: new Date()
    });

    await message.save();

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message de groupe', error: error.message });
  }
};

// Récupérer les messages d'une conversation
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipients: userId },
        { sender: userId, recipients: currentUserId }
      ]
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'username profilePicture')
    .populate('recipients', 'username profilePicture');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des messages', error: error.message });
  }
};

// Marquer un message comme lu
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    const alreadyRead = message.readBy.some(read => read.user.toString() === userId);
    if (!alreadyRead) {
      message.readBy.push({
        user: userId,
        readAt: new Date()
      });
      await message.save();
    }

    res.json({ message: 'Message marqué comme lu' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du marquage du message comme lu', error: error.message });
  }
};

// Récupérer les messages non lus
exports.getUnreadMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await Message.find({
      recipients: userId,
      'readBy.user': { $ne: userId }
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'username profilePicture')
    .populate('recipients', 'username profilePicture');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des messages non lus', error: error.message });
  }
}; 