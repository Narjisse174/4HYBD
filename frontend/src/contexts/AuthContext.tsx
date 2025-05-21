import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';

interface User {
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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      console.log('🔍 Vérification de l\'utilisateur...');
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        console.log('✅ Utilisateur trouvé:', parsedUser.email);
        setUser(parsedUser);
      } else {
        console.log('❌ Aucun utilisateur trouvé');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de l\'utilisateur:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔑 Tentative de connexion...');
      setLoading(true);
      const response = await authService.login({ email, password });
      
      if (!response || !response.token || !response._id) {
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

      await AsyncStorage.setItem('token', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      console.log('✅ Connexion réussie pour:', userData.email);
    } catch (error) {
      console.error('❌ Erreur lors de la connexion:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string) => {
    try {
      console.log('📝 Tentative d\'inscription...');
      setLoading(true);
      const response = await authService.register({ email, password, username });
      
      if (!response || !response.token || !response._id) {
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

      await AsyncStorage.setItem('token', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      console.log('✅ Inscription réussie pour:', userData.email);
    } catch (error) {
      console.error('❌ Erreur lors de l\'inscription:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Tentative de déconnexion...');
      setLoading(true);
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}; 