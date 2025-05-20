import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  async connect() {
    if (this.socket?.connected) return;

    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    this.socket = io('http://localhost:3000', {
      auth: {
        token
      }
    });

    this.socket.on('connect', () => {
      console.log('Socket connecté');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket déconnecté');
    });

    this.socket.on('error', (error) => {
      console.error('Erreur socket:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export default SocketService.getInstance(); 