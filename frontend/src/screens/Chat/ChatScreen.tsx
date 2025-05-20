import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { messageService } from '../../services/api';
import socketService from '../../services/socket';
import { User } from '../../services/auth';

type RootStackParamList = {
  Chat: { userId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

interface Message {
  _id: string;
  content: string;
  sender: string;
  createdAt: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

const ChatScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ChatScreenRouteProp>();
  const { userId } = route.params as { userId: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [uploading, setUploading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
    loadUserInfo();
    setupSocketListeners();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await messageService.getConversationMessages(userId);
      setMessages(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      Alert.alert('Erreur', 'Impossible de charger les messages');
    } finally {
      setLoading(false);
    }
  };

  const loadUserInfo = async () => {
    try {
      // TODO: Implémenter la récupération des informations de l'utilisateur
      // const response = await userService.getUserInfo(userId);
      // setOtherUser(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des informations utilisateur:', error);
    }
  };

  const setupSocketListeners = () => {
    socketService.on('newMessage', (message: Message) => {
      if (message.sender === userId) {
        setMessages(prev => [...prev, message]);
      }
    });
  };

  const handlePickMedia = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Veuillez autoriser l\'accès à votre galerie pour partager des médias.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        await handleSendMessage('', asset.uri, asset.type === 'video' ? 'video' : 'image');
      }
    } catch (error) {
      console.error('Erreur lors de la sélection du média:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner le média');
    }
  };

  const handleSendMessage = async (content: string, mediaUrl?: string, mediaType?: 'image' | 'video') => {
    if (!content.trim() && !mediaUrl) return;

    try {
      setUploading(true);
      const response = await messageService.sendMessage(userId, {
        content: content.trim(),
        mediaUrl,
        mediaType,
      });

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      flatListRef.current?.scrollToEnd();
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    } finally {
      setUploading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.sender !== userId;
    const messageDate = new Date(item.createdAt).toLocaleTimeString();

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        {item.mediaUrl && (
          <View style={styles.mediaContainer}>
            {item.mediaType === 'image' ? (
              <Image
                source={{ uri: item.mediaUrl }}
                style={styles.mediaContent}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.videoContainer}>
                <Icon name="videocam" size={24} color="#FFF" />
                <Text style={styles.videoText}>Vidéo</Text>
              </View>
            )}
          </View>
        )}
        {item.content && (
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
        )}
        <Text style={styles.messageTime}>{messageDate}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.attachButton}
          onPress={handlePickMedia}
          disabled={uploading}
        >
          <Icon name="attach" size={24} color="#007AFF" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Votre message..."
          multiline
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => handleSendMessage(newMessage)}
          disabled={uploading || !newMessage.trim()}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Icon name="send" size={24} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    marginBottom: 8,
    padding: 12,
    borderRadius: 16,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  ownMessageText: {
    color: '#FFF',
  },
  otherMessageText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 12,
    color: '#8E8E93',
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaContainer: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaContent: {
    width: '100%',
    height: 200,
  },
  videoContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    color: '#FFF',
    marginTop: 8,
  },
});

export default ChatScreen; 