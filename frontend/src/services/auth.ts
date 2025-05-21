import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './api';

export interface User {
  _id: string;
  email: string;
  username: string;
  profilePicture: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  bio: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private token: string | null = null;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async initialize() {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      
      if (token && userData) {
        this.token = token;
        this.currentUser = JSON.parse(userData);
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
    }
  }

  async login(email: string, password: string): Promise<AuthState> {
    try {
      console.log('🔑 Tentative de connexion frontend avec:', { email });
      const response = await authService.login({ email, password });
      console.log('✅ Réponse du serveur:', response);
      
      if (!response || !response.token || !response._id) {
        console.error('❌ Réponse invalide du serveur:', response);
        throw new Error('Réponse invalide du serveur');
      }

      const userData: User = {
        _id: response._id,
        email: response.email,
        username: response.username,
        profilePicture: response.profilePicture || '',
        location: response.location || { type: 'Point', coordinates: [0, 0] },
        bio: response.bio || ''
      };

      console.log('👤 Données utilisateur préparées:', userData);
      
      await this.setAuthState({ token: response.token, user: userData });
      console.log('✅ État d\'authentification mis à jour après connexion');
      
      return this.getAuthState();
    } catch (error: any) {
      console.error('❌ Erreur de connexion frontend:', error.response?.data || error.message);
      throw error;
    }
  }

  async register(email: string, password: string, username: string): Promise<AuthState> {
    try {
      console.log('📝 Tentative d\'inscription frontend avec:', { email, username });
      const response = await authService.register({ email, password, username });
      console.log('✅ Réponse du serveur:', response);
      
      if (!response || !response.token || !response._id) {
        console.error('❌ Réponse invalide du serveur:', response);
        throw new Error('Réponse invalide du serveur');
      }

      const userData: User = {
        _id: response._id,
        email: response.email,
        username: response.username,
        profilePicture: response.profilePicture || '',
        location: response.location || { type: 'Point', coordinates: [0, 0] },
        bio: response.bio || ''
      };

      console.log('👤 Données utilisateur préparées:', userData);
      
      await this.setAuthState({ token: response.token, user: userData });
      console.log('✅ État d\'authentification mis à jour après inscription');
      
      return this.getAuthState();
    } catch (error: any) {
      console.error('❌ Erreur d\'inscription frontend:', error.response?.data || error.message);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      console.log('🚪 Tentative de déconnexion');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      this.currentUser = null;
      this.token = null;
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      throw error;
    }
  }

  async updateProfile(profileData: Partial<User>): Promise<User> {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      this.currentUser = updatedUser;
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      throw new Error('Échec de la mise à jour du profil');
    }
  }

  private async setAuthState(data: { token: string; user: User }) {
    try {
      if (!data.token || !data.user) {
        console.error('❌ Données d\'authentification invalides:', data);
        throw new Error('Données d\'authentification invalides');
      }

      console.log('💾 Sauvegarde des données d\'authentification:', {
        token: data.token.substring(0, 10) + '...',
        user: data.user
      });

      // S'assurer que les données sont valides avant de les sauvegarder
      const userData = {
        _id: data.user._id,
        email: data.user.email,
        username: data.user.username,
        profilePicture: data.user.profilePicture || '',
        location: data.user.location || { type: 'Point', coordinates: [0, 0] },
        bio: data.user.bio || ''
      };

      this.token = data.token;
      this.currentUser = userData;
      
      // Sauvegarder les données dans AsyncStorage
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      console.log('✅ État d\'authentification mis à jour');
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'état:', error);
      throw error;
    }
  }

  getAuthState(): AuthState {
    return {
      user: this.currentUser,
      token: this.token,
      isAuthenticated: !!this.token
    };
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      console.log('👤 Récupération des données utilisateur');
      const userData = await AsyncStorage.getItem('user');
      console.log('✅ Données utilisateur récupérées:', userData);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des données utilisateur:', error);
      return null;
    }
  }

  getToken(): string | null {
    return this.token;
  }
}

export default AuthService.getInstance(); 