import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import authService from '../../services/auth';
import { User } from '../../services/auth';

// Définition du type pour les paramètres de navigation
type RootStackParamList = {
  EditProfile: { user: User };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DEFAULT_AVATAR = { uri: 'https://via.placeholder.com/150' };

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      // La navigation sera gérée par le système d'authentification
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la déconnexion');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = () => {
    if (user) {
      navigation.navigate('EditProfile', { user });
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={
            user.profilePicture
              ? { uri: user.profilePicture }
              : DEFAULT_AVATAR
          }
          style={styles.profileImage}
        />
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleUpdateProfile}
        >
          <Icon name="person-outline" size={24} color="#007AFF" />
          <Text style={styles.menuText}>Modifier le profil</Text>
          <Icon name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="notifications-outline" size={24} color="#007AFF" />
          <Text style={styles.menuText}>Notifications</Text>
          <Icon name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="lock-closed-outline" size={24} color="#007AFF" />
          <Text style={styles.menuText}>Confidentialité</Text>
          <Icon name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="help-circle-outline" size={24} color="#007AFF" />
          <Text style={styles.menuText}>Aide et support</Text>
          <Icon name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={loading}
      >
        <Icon name="log-out-outline" size={24} color="#FF3B30" />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#FFF',
    marginTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5EA',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    marginTop: 20,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 8,
  },
});

export default ProfileScreen; 