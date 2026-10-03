import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(this.wsUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('[HospitalOS Socket] Connected to real-time events gateway:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('[HospitalOS Socket] Disconnected from real-time events gateway');
      });
    }
    return this.socket;
  }

  joinRoom(room: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join:room', room);
    }
  }

  leaveRoom(room: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave:room', room);
    }
  }

  subscribe(event: string, callback: (data: any) => void) {
    const s = this.connect();
    s.on(event, callback);
    return () => {
      s.off(event, callback);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
