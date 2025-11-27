import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

export function setSocketIO(socketServer: SocketIOServer) {
  io = socketServer;
}

export function getSocketIO(): SocketIOServer | null {
  return io;
}
