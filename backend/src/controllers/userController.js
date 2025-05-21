const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Créer un nouvel utilisateur
exports.register = async (req, res) => {
  try {
    console.log('📝 Tentative d\'inscription avec:', req.body);
    const { email, password, username } = req.body;
    
    // Validation des données
    if (!email || !password || !username) {
      console.log('❌ Données manquantes:', { email: !!email, password: !!password, username: !!username });
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    // Vérification de l'email
    if (!/\S+@\S+\.\S+/.test(email)) {
      console.log('❌ Format d\'email invalide:', email);
      return res.status(400).json({ message: 'Format d\'email invalide' });
    }

    // Vérification du nom d'utilisateur
    if (username.length < 3) {
      console.log('❌ Nom d\'utilisateur trop court:', username);
      return res.status(400).json({ message: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' });
    }

    // Vérification du mot de passe
    if (password.length < 6) {
      console.log('❌ Mot de passe trop court');
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }
    
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      console.log('❌ Utilisateur déjà existant');
      return res.status(400).json({ message: 'Email ou nom d\'utilisateur déjà utilisé' });
    }

    const user = new User({
      email,
      password,
      username
    });

    await user.save();
    console.log('✅ Utilisateur créé avec succès:', user._id);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'votre_secret_jwt', {
      expiresIn: '30d'
    });

    res.status(201).json({
      _id: user._id,
      email: user.email,
      username: user.username,
      profilePicture: user.profilePicture || '',
      location: user.location || { type: 'Point', coordinates: [0, 0] },
      bio: user.bio || '',
      token
    });
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur', error: error.message });
  }
};

// Connexion utilisateur
exports.login = async (req, res) => {
  try {
    console.log('🔑 Tentative de connexion avec:', req.body);
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Utilisateur non trouvé pour l\'email:', email);
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    console.log('✅ Utilisateur trouvé:', user.username);
    const isMatch = await user.comparePassword(password);
    console.log('🔐 Résultat de la comparaison du mot de passe:', isMatch);

    if (!isMatch) {
      console.log('❌ Mot de passe incorrect');
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'votre_secret_jwt', {
      expiresIn: '30d'
    });

    console.log('✅ Connexion réussie pour:', user.username);
    res.json({
      _id: user._id,
      email: user.email,
      username: user.username,
      profilePicture: user.profilePicture || '',
      location: user.location || { type: 'Point', coordinates: [0, 0] },
      bio: user.bio || '',
      token
    });
  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion', error: error.message });
  }
};

// Mettre à jour le profil utilisateur
exports.updateProfile = async (req, res) => {
  try {
    const { username, profilePicture, location } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    if (username) user.username = username;
    if (profilePicture) user.profilePicture = profilePicture;
    if (location) user.location = location;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil', error: error.message });
  }
};

// Rechercher des utilisateurs par nom d'utilisateur
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.find({
      username: { $regex: query, $options: 'i' }
    }).select('-password');
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la recherche d\'utilisateurs', error: error.message });
  }
};

// Trouver des utilisateurs à proximité
exports.findNearbyUsers = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 5000 } = req.query;
    
    const users = await User.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).select('-password');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la recherche d\'utilisateurs à proximité', error: error.message });
  }
};

// Ajouter un ami
exports.addFriend = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    if (user.friends.includes(friendId)) {
      return res.status(400).json({ message: 'Cet utilisateur est déjà votre ami' });
    }

    user.friends.push(friendId);
    await user.save();

    res.json({ message: 'Ami ajouté avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'ajout d\'un ami', error: error.message });
  }
};

// Réinitialiser le mot de passe
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Hash du nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    
    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe' });
  }
};

// Supprimer le profil utilisateur
exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    await User.findByIdAndDelete(userId);
    res.json({ message: 'Profil supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du profil', error: error.message });
  }
};

// Envoyer une demande d'ami
exports.sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(req.user.id);
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier si une demande existe déjà
    const existingRequest = targetUser.friendRequests.find(
      request => request.from.toString() === req.user.id
    );

    if (existingRequest) {
      return res.status(400).json({ message: 'Une demande d\'ami existe déjà' });
    }

    // Ajouter la demande
    targetUser.friendRequests.push({
      from: req.user.id,
      status: 'pending'
    });

    await targetUser.save();
    res.json({ message: 'Demande d\'ami envoyée' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'envoi de la demande d\'ami', error: error.message });
  }
};

// Gérer une demande d'ami (accepter/rejeter)
exports.handleFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // 'accept' ou 'reject'
    const currentUser = await User.findById(req.user.id);

    const request = currentUser.friendRequests.id(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    if (action === 'accept') {
      // Ajouter aux amis des deux côtés
      currentUser.friends.push(request.from);
      const otherUser = await User.findById(request.from);
      otherUser.friends.push(currentUser._id);
      await otherUser.save();
    }

    // Mettre à jour le statut de la demande
    request.status = action === 'accept' ? 'accepted' : 'rejected';
    await currentUser.save();

    res.json({ message: `Demande ${action === 'accept' ? 'acceptée' : 'rejetée'}` });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du traitement de la demande d\'ami', error: error.message });
  }
};

// Obtenir la liste des amis
exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friends', 'username profilePicture');
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des amis', error: error.message });
  }
};

// Obtenir les demandes d'amis
exports.getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friendRequests.from', 'username profilePicture');
    res.json(user.friendRequests);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des demandes d\'amis', error: error.message });
  }
};

// Supprimer un ami
exports.removeFriend = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(req.user.id);
    const otherUser = await User.findById(userId);

    // Supprimer des deux côtés
    currentUser.friends = currentUser.friends.filter(
      friend => friend.toString() !== userId
    );
    otherUser.friends = otherUser.friends.filter(
      friend => friend.toString() !== req.user.id
    );

    await currentUser.save();
    await otherUser.save();

    res.json({ message: 'Ami supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'ami', error: error.message });
  }
};

// Obtenir le profil de l'utilisateur
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du profil', error: error.message });
  }
}; 