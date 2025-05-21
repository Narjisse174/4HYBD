import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configuration de l'URL de l'API en fonction de la plateforme
const API_URL = Platform.select({
  android: 'http://10.0.2.2:3000/api',  // Pour l'émulateur Android
  ios: 'http://localhost:3000/api',     // Pour iOS
  default: 'http://localhost:3000/api'  // Pour le web
});

console.log('🌐 Configuration de l\'API avec l\'URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les réponses
api.interceptors.response.use(
  (response) => {
    console.log('✅ Réponse reçue:', response.status);
    return response;
  },
  async (error) => {
    console.error('❌ Erreur de réponse:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      console.log('🔒 Session expirée, déconnexion...');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Service d'authentification
export const authService = {
  register: async (userData: { email: string; password: string; username: string }) => {
    try {
      console.log('📤 Envoi de la requête d\'inscription:', { ...userData, password: '[REDACTED]' });
      const response = await api.post('/users/register', userData);
      console.log('📥 Réponse d\'inscription reçue:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'inscription:', error.response?.data || error.message);
      throw error;
    }
  },

  login: async (credentials: { email: string; password: string }) => {
    try {
      console.log('📤 Envoi de la requête de connexion:', { email: credentials.email });
      const response = await api.post('/users/login', credentials);
      console.log('📥 Réponse de connexion reçue:', response.data);
      
      if (!response.data || !response.data.token || !response.data._id) {
        console.error('❌ Réponse invalide du serveur:', response.data);
        throw new Error('Réponse invalide du serveur');
      }

      // S'assurer que tous les champs requis sont présents
      const userData = {
        _id: response.data._id,
        email: response.data.email,
        username: response.data.username,
        profilePicture: response.data.profilePicture || '',
        location: response.data.location || { type: 'Point', coordinates: [0, 0] },
        bio: response.data.bio || '',
        token: response.data.token
      };
      
      console.log('✅ Données utilisateur validées:', userData);
      return userData;
    } catch (error: any) {
      console.error('❌ Erreur lors de la connexion:', error.response?.data || error.message);
      throw error;
    }
  },

  updateProfile: async (profileData: { username?: string; profilePicture?: string; location?: any }) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  deleteProfile: async () => {
    const response = await api.delete('/users/profile');
    return response.data;
  }
};

// Service de gestion des amis
export const friendService = {
  sendFriendRequest: async (userId: string) => {
    const response = await api.post(`/users/friends/request/${userId}`);
    return response.data;
  },

  handleFriendRequest: async (requestId: string, action: 'accept' | 'reject') => {
    const response = await api.put(`/users/friends/request/${requestId}`, { action });
    return response.data;
  },

  getFriends: async () => {
    const response = await api.get('/users/friends');
    return response.data;
  },

  getFriendRequests: async () => {
    const response = await api.get('/users/friends/requests');
    return response.data;
  },

  removeFriend: async (userId: string) => {
    const response = await api.delete(`/users/friends/${userId}`);
    return response.data;
  }
};

// Service de recherche d'utilisateurs
export const userService = {
  searchUsers: async (query: string) => {
    const response = await api.get(`/users/search?query=${query}`);
    return response.data;
  },

  findNearbyUsers: async (latitude: number, longitude: number, maxDistance: number = 5000) => {
    const response = await api.get(`/users/nearby?latitude=${latitude}&longitude=${longitude}&maxDistance=${maxDistance}`);
    return response.data;
  }
};

// Service de messages
export const messageService = {
  sendMessage: async (recipientId: string, messageData: { content: string; mediaUrl?: string; mediaType?: string }) => {
    console.log('📤 Envoi d\'un message à:', recipientId, messageData);
    const response = await api.post('/messages/send', { recipientId, ...messageData });
    console.log('✅ Message envoyé avec succès:', response.data);
    return response.data;
  },

  sendGroupMessage: async (messageData: { recipientIds: string[]; content: string; mediaUrl?: string; mediaType?: string }) => {
    console.log('📤 Envoi d\'un message de groupe à:', messageData.recipientIds);
    const response = await api.post('/messages/group/send', messageData);
    console.log('✅ Message de groupe envoyé avec succès:', response.data);
    return response.data;
  },

  getConversation: async (userId: string) => {
    console.log('📥 Récupération de la conversation avec:', userId);
    const response = await api.get(`/messages/conversation/${userId}`);
    console.log('✅ Conversation reçue:', response.data);
    return response.data;
  },

  getConversations: async () => {
    console.log('📥 Récupération de toutes les conversations');
    const response = await api.get('/messages/conversations');
    console.log('✅ Conversations reçues:', response.data);
    return response.data;
  },

  getUnreadMessages: async () => {
    console.log('📥 Récupération des messages non lus');
    const response = await api.get('/messages/unread');
    console.log('✅ Messages non lus reçus:', response.data);
    return response.data;
  },

  markAsRead: async (messageId: string) => {
    console.log('📝 Marquage du message comme lu:', messageId);
    const response = await api.put(`/messages/read/${messageId}`);
    console.log('✅ Message marqué comme lu:', response.data);
    return response.data;
  }
};

export default api; 