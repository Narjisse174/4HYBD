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

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        console.log('🔑 Token trouvé, ajout aux headers');
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log('⚠️ Pas de token trouvé');
      }
      return config;
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du token:', error);
      return config;
    }
  },
  (error) => {
    console.error('❌ Erreur dans l\'intercepteur de requête:', error);
    return Promise.reject(error);
  }
);

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
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/users/login', credentials);
    return response.data;
  },

  updateProfile: async (profileData: { username?: string; profilePicture?: string; location?: any }) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },
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
  },
};

// Service d'utilisateurs
export const userService = {
  searchUsers: async (query: string) => {
    const response = await api.get(`/users/search?query=${query}`);
    return response.data;
  },

  findNearbyUsers: async (longitude: number, latitude: number, maxDistance?: number) => {
    const response = await api.get(`/users/nearby?longitude=${longitude}&latitude=${latitude}&maxDistance=${maxDistance || 5000}`);
    return response.data;
  },

  addFriend: async (friendId: string) => {
    const response = await api.post('/users/friends', { friendId });
    return response.data;
  },
};

export default api; 