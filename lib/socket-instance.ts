import { Server as SocketIOServer } from "socket.io";

// The Socket.IO server is created in server.ts (custom server process) while
// API routes execute inside Next.js's module registry. A plain module-level
// variable would be duplicated across those registries, so the instance is
// shared via globalThis.
const globalForIO = globalThis as unknown as {
  __texloopSocketIO?: SocketIOServer | null;
};

export function setSocketIO(socketServer: SocketIOServer) {
  globalForIO.__texloopSocketIO = socketServer;
}

export function getSocketIO(): SocketIOServer | null {
  return globalForIO.__texloopSocketIO ?? null;
}
