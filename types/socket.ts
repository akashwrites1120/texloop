import { Message } from './message';

export interface SocketUser {
  userId: string;
  username: string;
  roomId: string;
}

export interface ServerToClientEvents {
  'message:new': (message: Message) => void;
  'text:update': (data: { textContent: string; userId: string }) => void;
  'user:joined': (data: { userId: string; username: string }) => void;
  'user:left': (data: { userId: string; username: string }) => void;
  'room:deleted': () => void;
  'participants:update': (participants: string[]) => void;
}

export interface ClientToServerEvents {
  'room:join': (data: { roomId: string; userId: string; username: string }) => void;
  'room:leave': (data: { roomId: string; userId: string }) => void;
  'message:send': (data: { roomId: string; userId: string; username: string; message: string }) => void;
  'text:change': (data: { roomId: string; textContent: string; userId: string }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  username: string;
  roomId: string;
}