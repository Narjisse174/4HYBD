import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { friendService } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

interface Friend {
  _id: string;
  username: string;
  profilePicture?: string;
}

interface FriendRequest {
  _id: string;
  sender: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

const FriendsScreen = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [friendsData, requestsData] = await Promise.all([
        friendService.getFriends(),
        friendService.getFriendRequests()
      ]);
      setFriends(friendsData);
      setRequests(requestsData.filter((req: FriendRequest) => req.status === 'pending'));
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFriendRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      await friendService.handleFriendRequest(requestId, action);
      setRequests(requests.filter(req => req._id !== requestId));
      if (action === 'accept') {
        loadData(); // Recharger la liste des amis
      }
    } catch (error) {
      console.error('Erreur lors de la gestion de la demande:', error);
      Alert.alert('Erreur', 'Impossible de traiter la demande');
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      await friendService.removeFriend(friendId);
      setFriends(friends.filter(friend => friend._id !== friendId));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'ami:', error);
      Alert.alert('Erreur', 'Impossible de supprimer l\'ami');
    }
  };

  const renderFriendRequest = ({ item }: { item: FriendRequest }) => (
    <View style={styles.requestItem}>
      <View style={styles.requestInfo}>
        <Text style={styles.username}>{item.sender.username}</Text>
        <Text style={styles.requestDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleFriendRequest(item._id, 'accept')}
        >
          <Ionicons name="checkmark" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleFriendRequest(item._id, 'reject')}
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFriend = ({ item }: { item: Friend }) => (
    <View style={styles.friendItem}>
      <View style={styles.friendInfo}>
        <Text style={styles.username}>{item.username}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveFriend(item._id)}
      >
        <Ionicons name="person-remove" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </View>
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
      {requests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Demandes d'amis</Text>
          <FlatList
            data={requests}
            renderItem={renderFriendRequest}
            keyExtractor={item => item._id}
            style={styles.requestsList}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes amis</Text>
        <FlatList
          data={friends}
          renderItem={renderFriend}
          keyExtractor={item => item._id}
          style={styles.friendsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadData();
              }}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>Vous n'avez pas encore d'amis</Text>
          }
        />
      </View>
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginVertical: 8,
    color: '#000',
  },
  requestsList: {
    backgroundColor: '#FFF',
  },
  friendsList: {
    backgroundColor: '#FFF',
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  requestInfo: {
    flex: 1,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#34C759',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  friendInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  requestDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    marginTop: 20,
  },
});

export default FriendsScreen; 