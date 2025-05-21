const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion à MongoDB
const connectDB = async () => {
  try {
    console.log('🔄 Tentative de connexion à MongoDB...');
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/snapshoot', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout après 5 secondes
      socketTimeoutMS: 45000, // Timeout des opérations après 45 secondes
    });
    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
    console.log(`📁 Base de données: ${conn.connection.name}`);
    
    // Vérifier les collections existantes
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('📚 Collections existantes:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB:', error.message);
    console.error('Détails de l\'erreur:', error);
    process.exit(1); // Arrêter l'application en cas d'échec de connexion
  }
};

connectDB();

// Configuration Socket.IO
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 Nouvelle connexion socket:', socket.id);

  socket.on('user_connected', (userId) => {
    console.log(`👤 Utilisateur ${userId} connecté avec socket ${socket.id}`);
    connectedUsers.set(userId, socket.id);
    
    // Émettre un événement de confirmation
    socket.emit('connection_confirmed', { userId, socketId: socket.id });
  });

  socket.on('send_message', async (data) => {
    console.log('📨 Message reçu:', data);
    const recipientSocketId = connectedUsers.get(data.recipientId);
    
    if (recipientSocketId) {
      console.log(`📤 Envoi du message à ${data.recipientId} (socket: ${recipientSocketId})`);
      io.to(recipientSocketId).emit('new_message', data);
      // Confirmer l'envoi à l'expéditeur
      socket.emit('message_sent', { messageId: data._id });
    } else {
      console.log(`⚠️ Destinataire ${data.recipientId} non connecté`);
      socket.emit('message_error', { error: 'Destinataire non connecté' });
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        console.log(`👋 Utilisateur ${userId} déconnecté`);
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// Route de base
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API Snapshoot' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Une erreur est survenue', error: err.message });
});

// Port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
}); 