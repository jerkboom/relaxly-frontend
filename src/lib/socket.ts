import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let activeToken: string | null = null;
let socketPromise: Promise<Socket | null> | null = null;

const getSocketUrl = (): string => {
  const explicitUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (explicitUrl) return explicitUrl;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  return apiUrl.replace(/\/api\/?$/, '');
};

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const authStorage = window.localStorage.getItem('auth-storage');
    if (!authStorage) return null;
    const parsed = JSON.parse(authStorage);
    return parsed?.state?.token || null;
  } catch {
    return null;
  }
};

export const getSocket = async (token?: string): Promise<Socket | null> => {
  if (typeof window === 'undefined') return null;

  if (socket && activeToken === token) return socket;
  if (socketPromise && activeToken === token) return socketPromise;

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }

  activeToken = token || null;

  socketPromise = (async () => {
    try {
      socket = io(getSocketUrl(), {
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 800,
        reconnectionDelayMax: 5000,
        transports: ['websocket'],
        auth: { token },
      });

      socket.on('connect_error', (error: Error) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Socket connection failed:', error.message);
        }
      });

      return socket;
    } catch (error) {
      console.error('Socket initialization error:', error);
      return null;
    } finally {
      socketPromise = null;
    }
  })();

  return socketPromise;
};

export const connectSocket = async (token?: string): Promise<Socket | null> => {
  if (typeof window === 'undefined') return null;
  const currentSocket = await getSocket(token);
  if (currentSocket && !currentSocket.connected) {
    currentSocket.connect();
  }
  return currentSocket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }
  socket = null;
  activeToken = null;
  socketPromise = null;
};
