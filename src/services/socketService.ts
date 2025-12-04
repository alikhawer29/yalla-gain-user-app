import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'https://custom-dev.onlinetestingserver.com:2170';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  connect(): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Listen for receiveMessage event
    this.socket.on('receiveMessage', (data) => {
      this.notifyListeners('receiveMessage', data);
    });

    // Listen for updateChatList event
    this.socket.on('updateChatList', (data) => {
      this.notifyListeners('updateChatList', data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join a specific chat room (listen to chat_id events)
  joinChat(chatId: number): void {
    if (this.socket) {
      // Listen for messages on this specific chat
      this.socket.on(String(chatId), (data) => {
        this.notifyListeners(`chat_${chatId}`, data);
      });
    }
  }

  // Leave a chat room
  leaveChat(chatId: number): void {
    if (this.socket) {
      this.socket.off(String(chatId));
    }
  }

  // Send a message through socket
  sendMessage(data: {
    chat_id: number;
    id: number;
    user_id: number;
    user_name: string;
    image: string;
    message: string;
    read_at: string | null;
    date: string;
    time: string;
    file: any[];
    is_mine: boolean;
  }): void {
    if (this.socket) {
      this.socket.emit('sendMessage', data);
    }
  }

  // Subscribe to an event
  subscribe(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  // Unsubscribe from an event
  unsubscribe(event: string, callback: (data: any) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  // Notify all listeners for an event
  private notifyListeners(event: string, data: any): void {
    this.listeners.get(event)?.forEach((callback) => callback(data));
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// Export a singleton instance
export const socketService = new SocketService();
export default socketService;

