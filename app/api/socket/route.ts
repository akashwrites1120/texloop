import { NextRequest } from 'next/server';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { initSocket } from '@/lib/socket';

// Global to store the server instance
let io: SocketIOServer | undefined;

export async function GET(req: NextRequest) {
  if (io) {
    console.log('Socket.io already initialized');
    return new Response('Socket.io server already running', { status: 200 });
  }

  try {
    // This is a workaround for Next.js App Router
    // In production, you'd typically handle this differently
    const httpServer = (req as any).socket?.server as NetServer;
    
    if (!httpServer) {
      console.error('HTTP server not available');
      return new Response('HTTP server not available', { status: 500 });
    }

    io = initSocket(httpServer);
    
    return new Response('Socket.io server initialized', { status: 200 });
  } catch (error) {
    console.error('Error initializing Socket.io:', error);
    return new Response('Failed to initialize Socket.io', { status: 500 });
  }
}