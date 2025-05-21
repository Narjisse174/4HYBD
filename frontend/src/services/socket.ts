import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configuration de l'URL du socket en fonction de la plateforme
const SOCKET_URL = Platform.select({
  android: 'http://10.0.2.2:3000',  // Pour l'émulateur Android
  ios: 'http://localhost:3000',     // Pour iOS
  default: 'http://localhost:3000'  // Pour le web
});

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;
  private userId: string | null = null;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  async connect() {
    if (this.socket?.connected) {
      console.log('🔌 Socket déjà connecté');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      
      if (!token || !userId) {
        console.log('❌ Pas de token ou userId trouvé');
        return;
      }

      this.userId = userId;
      console.log('🔌 Tentative de connexion au socket...');
      
      this.socket = io(SOCKET_URL!, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.setupSocketListeners();
      
      // Notifier le serveur de la connexion de l'utilisateur
      this.socket.emit('user_connected', userId);
      
    } catch (error) {
      console.error('❌ Erreur lors de la connexion au socket:', error);
    }
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connecté');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket déconnecté');
    });

    this.socket.on('connection_confirmed', (data) => {
      console.log('✅ Connexion confirmée:', data);
    });

    this.socket.on('error', (error) => {
      console.error('❌ Erreur socket:', error);
    });

    this.socket.on('message_sent', (data) => {
      console.log('✅ Message envoyé avec succès:', data);
    });

    this.socket.on('message_error', (error) => {
      console.error('❌ Erreur lors de l\'envoi du message:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('👋 Déconnexion du socket...');
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      console.log(`📤 Émission de l'événement ${event}:`, data);
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ Tentative d\'émission sans socket connecté');
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      console.log(`👂 Écoute de l'événement ${event}`);
      this.socket.on(event, callback);
    }
  }

  off(event: string) {
    if (this.socket) {
      console.log(`🔕 Arrêt de l'écoute de l'événement ${event}`);
      this.socket.off(event);
    }
  }
}

export default SocketService.getInstance(); 