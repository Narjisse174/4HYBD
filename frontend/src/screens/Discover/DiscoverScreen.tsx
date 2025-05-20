import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Location from 'expo-location';
import { userService } from '../../services/api';
import { User } from '../../services/auth';

// Définition du type pour les paramètres de navigation
type RootStackParamList = {
  Story: { storyId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Story {
  _id: string;
  user: User;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  location: {
    type: string;
    coordinates: [number, number];
  };
  createdAt: string;
}

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.8;

const DEFAULT_AVATAR = { uri: 'https://via.placeholder.com/150' };

const DiscoverScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [stories, setStories] = useState<Story[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      
      if (status === 'granted') {
        await getCurrentLocation();
      } else {
        Alert.alert(
          'Localisation requise',
          'Pour découvrir des stories à proximité, veuillez autoriser l\'accès à votre localisation dans les paramètres de votre appareil.',
          [
            {
              text: 'Annuler',
              style: 'cancel',
            },
            {
              text: 'Paramètres',
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
      Alert.alert('Erreur', 'Impossible d\'accéder à la localisation');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      await loadNearbyStories(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error('Erreur lors de la récupération de la localisation:', error);
      Alert.alert('Erreur', 'Impossible de récupérer votre position');
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyStories = async (latitude: number, longitude: number) => {
    try {
      const response = await userService.findNearbyUsers(longitude, latitude);
      setStories(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des stories:', error);
      Alert.alert('Erreur', 'Impossible de charger les stories à proximité');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (currentLocation) {
      await loadNearbyStories(currentLocation.latitude, currentLocation.longitude);
    }
    setRefreshing(false);
  };

  const renderStory = ({ item }: { item: Story }) => (
    <TouchableOpacity
      style={styles.storyCard}
      onPress={() => navigation.navigate('Story', { storyId: item._id })}
    >
      <Image source={{ uri: item.mediaUrl }} style={styles.storyImage} />
      <View style={styles.storyInfo}>
        <View style={styles.userInfo}>
          <Image
            source={
              item.user.profilePicture
                ? { uri: item.user.profilePicture }
                : DEFAULT_AVATAR
            }
            style={styles.avatar}
          />
          <Text style={styles.username}>{item.user.username}</Text>
        </View>
        <View style={styles.storyMeta}>
          <Icon name="time-outline" size={16} color="#666" />
          <Text style={styles.timestamp}>
            {new Date(item.createdAt).toLocaleTimeString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement de votre position...</Text>
      </View>
    );
  }

  if (!locationPermission) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="location-off" size={48} color="#666" />
        <Text style={styles.emptyText}>
          Localisation non autorisée
        </Text>
        <Text style={styles.emptySubtext}>
          Activez la localisation pour découvrir des stories près de chez vous
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={checkLocationPermission}
        >
          <Text style={styles.permissionButtonText}>Autoriser la localisation</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={stories}
        renderItem={renderStory}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH + 16}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="compass-outline" size={48} color="#666" />
            <Text style={styles.emptyText}>
              Aucune story à proximité
            </Text>
            <Text style={styles.emptySubtext}>
              Soyez le premier à partager une story dans votre région !
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 16,
  },
  storyCard: {
    width: ITEM_WIDTH,
    marginRight: 16,
    borderRadius: 16,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  storyImage: {
    width: '100%',
    height: ITEM_WIDTH * 1.2,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  storyInfo: {
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  storyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DiscoverScreen; 