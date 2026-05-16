import { io, type Socket } from 'socket.io-client';
import { config } from './config';

/**
 * Singleton Socket.IO client. The session cookie travels with the handshake
 * via `withCredentials: true` — no JWT-in-query, no token passed from JS.
 *
 * The socket is created lazily so it doesn't fire on the public login page
 * where there is no session yet. Call `connectSocket()` once the auth
 * provider confirms a session, and `disconnectSocket()` on sign-out.
 */

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(): Socket {
  if (socket && socket.connected) return socket;

  socket = io(config.wsUrl, {
    withCredentials: true,
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 8,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 8_000,
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
