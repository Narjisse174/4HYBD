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