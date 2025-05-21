import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { friendService, userService } from '../services/api';

interface Friend {
  _id: string;
  username: string;
  profilePicture: string;
}

interface FriendRequest {
  _id: string;
  from: Friend;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

const FriendsScreen = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFriends();
    loadFriendRequests();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const response = await friendService.getFriends();
      setFriends(response);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger la liste des amis');
    } finally {
      setLoading(false);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const response = await friendService.getFriendRequests();
      setFriendRequests(response);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les demandes d\'amis');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const results = await userService.searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de rechercher des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (userId: string) => {
    try {
      await friendService.sendFriendRequest(userId);
      Alert.alert('Succès', 'Demande d\'ami envoyée');
      setSearchResults(searchResults.filter(user => user._id !== userId));
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer la demande d\'ami');
    }
  };

  const handleFriendRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      await friendService.handleFriendRequest(requestId, action);
      if (action === 'accept') {
        await loadFriends();
      }
      setFriendRequests(friendRequests.filter(request => request._id !== requestId));
      Alert.alert('Succès', `Demande ${action === 'accept' ? 'acceptée' : 'rejetée'}`);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de traiter la demande d\'ami');
    }
  };

  const handleRemoveFriend = async (userId: string) => {
    try {
      await friendService.removeFriend(userId);
      setFriends(friends.filter(friend => friend._id !== userId));
      Alert.alert('Succès', 'Ami supprimé');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer l\'ami');
    }
  };

  const renderFriendRequest = ({ item }: { item: FriendRequest }) => (
    <View style={styles.requestItem}>
      <Image
        source={{ uri: item.from.profilePicture || 'https://via.placeholder.com/50' }}
        style={styles.profilePicture}
      />
      <View style={styles.requestInfo}>
        <Text style={styles.username}>{item.from.username}</Text>
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={() => handleFriendRequest(item._id, 'accept')}
          >
            <Text style={styles.buttonText}>Accepter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.rejectButton]}
            onPress={() => handleFriendRequest(item._id, 'reject')}
          >
            <Text style={styles.buttonText}>Refuser</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderFriend = ({ item }: { item: Friend }) => (
    <View style={styles.friendItem}>
      <Image
        source={{ uri: item.profilePicture || 'https://via.placeholder.com/50' }}
        style={styles.profilePicture}
      />
      <Text style={styles.username}>{item.username}</Text>
      <TouchableOpacity
        style={[styles.button, styles.removeButton]}
        onPress={() => handleRemoveFriend(item._id)}
      >
        <Text style={styles.buttonText}>Supprimer</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchResult = ({ item }: { item: Friend }) => (
    <View style={styles.searchItem}>
      <Image
        source={{ uri: item.profilePicture || 'https://via.placeholder.com/50' }}
        style={styles.profilePicture}
      />
      <Text style={styles.username}>{item.username}</Text>
      <TouchableOpacity
        style={[styles.button, styles.addButton]}
        onPress={() => handleSendFriendRequest(item._id)}
      >
        <Text style={styles.buttonText}>Ajouter</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher des utilisateurs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.buttonText}>Rechercher</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      {searchResults.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résultats de recherche</Text>
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={item => item._id}
          />
        </View>
      )}

      {friendRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Demandes d'amis</Text>
          <FlatList
            data={friendRequests}
            renderItem={renderFriendRequest}
            keyExtractor={item => item._id}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes amis</Text>
        <FlatList
          data={friends}
          renderItem={renderFriend}
          keyExtractor={item => item._id}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  username: {
    flex: 1,
    fontSize: 16,
  },
  requestInfo: {
    flex: 1,
  },
  requestActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  button: {
    padding: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  addButton: {
    backgroundColor: '#2196F3',
  },
  removeButton: {
    backgroundColor: '#f44336',
  },
});

export default FriendsScreen; 