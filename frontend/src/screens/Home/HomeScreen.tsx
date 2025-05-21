import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { userService } from '../../services/api';

interface User {
  _id: string;
  username: string;
  profilePicture?: string;
  location?: {
    coordinates: [number, number];
  };
}

const HomeScreen = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNearbyUsers = async () => {
    try {
      // Pour le test, on utilise des coordonnées fixes
      // Dans une vraie application, on utiliserait la géolocalisation
      const latitude = 48.8566;
      const longitude = 2.3522;
      const nearbyUsers = await userService.findNearbyUsers(latitude, longitude);
      setUsers(nearbyUsers);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      Alert.alert('Erreur', 'Impossible de charger les utilisateurs à proximité');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNearbyUsers();
  }, []);

  const handleUserPress = (userId: string) => {
    // Navigation vers le profil de l'utilisateur ou le chat
    // navigation.navigate('UserProfile', { userId });
  };

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => handleUserPress(item._id)}
    >
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          {item.profilePicture ? (
            <Image
              source={{ uri: item.profilePicture }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={24} color="#8E8E93" />
            </View>
          )}
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.username}>{item.username}</Text>
          {item.location && (
            <Text style={styles.location}>
              <Ionicons name="location" size={14} color="#8E8E93" /> À proximité
            </Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#C7C7CC" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Utilisateurs à proximité</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => {
            setRefreshing(true);
            loadNearbyUsers();
          }}
        >
          <Ionicons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadNearbyUsers();
            }}
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Aucun utilisateur à proximité
          </Text>
        }
      />
    </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  refreshButton: {
    padding: 8,
  },
  list: {
    padding: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    marginTop: 20,
  },
});

export default HomeScreen; 