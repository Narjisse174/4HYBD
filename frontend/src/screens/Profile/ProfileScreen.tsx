import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import authService from '../../services/auth';
import { User } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import { authService as apiAuthService } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

// Définition du type pour les paramètres de navigation
type RootStackParamList = {
  EditProfile: { user: User };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DEFAULT_AVATAR = { uri: 'https://via.placeholder.com/150' };

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const currentUser = await authService.getCurrentUser();
    // Assuming the currentUser is set in the useAuth context
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      Alert.alert('Erreur', 'Impossible de se déconnecter');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await apiAuthService.deleteProfile();
              await logout();
            } catch (error) {
              console.error('Erreur lors de la suppression du compte:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le compte');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleUpdateProfile = () => {
    if (user) {
      navigation.navigate('EditProfile', { user });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            {user?.profilePicture ? (
              <Image
                source={{ uri: user.profilePicture }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#8E8E93" />
              </View>
            )}
          </View>
          <Text style={styles.username}>{user?.username}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={handleUpdateProfile}
        >
          <Ionicons name="create-outline" size={24} color="#007AFF" />
          <Text style={[styles.buttonText, styles.editButtonText]}>
            Modifier le profil
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={[styles.buttonText, styles.logoutButtonText]}>
            Se déconnecter
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDeleteAccount}
        >
          <Ionicons name="trash-outline" size={24} color="#FF3B30" />
          <Text style={[styles.buttonText, styles.deleteButtonText]}>
            Supprimer le compte
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#8E8E93',
  },
  section: {
    padding: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    marginLeft: 12,
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  editButtonText: {
    color: '#007AFF',
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutButtonText: {
    color: '#FF3B30',
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: '#FF3B30',
    backgroundColor: '#FFF',
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
});

export default ProfileScreen; 
export default ProfileScreen; 