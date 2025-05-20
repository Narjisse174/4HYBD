import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { messageService } from '../../services/api';
import { User } from '../../services/auth';

// Définition du type pour les paramètres de navigation
type RootStackParamList = {
  Chat: { userId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Conversation {
  _id: string;
  participants: User[];
  lastMessage: {
    content: string;
    createdAt: string;
    sender: string;
  };
  unreadCount: number;
}

const DEFAULT_AVATAR = { uri: 'https://via.placeholder.com/50' };

const ChatListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = async () => {
    try {
      // TODO: Implémenter la récupération des conversations
      // const response = await messageService.getConversations();
      // setConversations(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const renderConversation = ({ item }: { item: Conversation }) => {
    const otherParticipant = item.participants[0]; // À adapter selon la logique de votre application

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => navigation.navigate('Chat', { userId: otherParticipant._id })}
      >
        <Image
          source={
            otherParticipant.profilePicture
              ? { uri: otherParticipant.profilePicture }
              : DEFAULT_AVATAR
          }
          style={styles.avatar}
        />
        <View style={styles.conversationInfo}>
          <View style={styles.headerRow}>
            <Text style={styles.username}>{otherParticipant.username}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.lastMessage.createdAt).toLocaleTimeString()}
            </Text>
          </View>
          <View style={styles.messageRow}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage.content}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune conversation</Text>
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
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  conversationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCount: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default ChatListScreen; 