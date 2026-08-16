import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket && typeof window !== 'undefined') {
    // Connect to server port (or environment URL fallback)
    const serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    socket = io(serverUrl, {
      autoConnect: false,
      transports: ['websocket', 'polling']
    });
  }
  return socket as Socket;
}

export function connectSocket() {
  const s = getSocket();
  if (s && !s.connected) {
    s.connect();
  }
}

export function disconnectSocket() {
  if (socket && socket.connected) {
    socket.disconnect();
  }
}
