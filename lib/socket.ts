import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from '@/types/socket';
import connectDB from './mongodb';
import RoomModel from '@/models/room';
import MessageModel from '@/models/message';

export type SocketServer = SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

let io: SocketServer | undefined;

export const initSocket = (httpServer: NetServer): SocketServer => {
  if (io) {
    return io;
  }

  io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);

    // Join room
    socket.on('room:join', async ({ roomId, userId, username }) => {
      try {
        await connectDB();

        // Verify room exists
        const room = await RoomModel.findOne({ roomId, isActive: true });
        if (!room) {
          socket.emit('room:deleted');
          return;
        }

        // Join socket room
        socket.join(roomId);
        socket.data = { userId, username, roomId };

        // Add to participants
        if (!room.participants.includes(userId)) {
          await RoomModel.updateOne(
            { roomId },
            { 
              $addToSet: { participants: userId },
              lastActivity: new Date()
            }
          );
        }

        // Create system message
        const systemMessage = await MessageModel.create({
          roomId,
          userId: 'system',
          username: 'System',
          message: `${username} joined the room`,
          type: 'system',
          timestamp: new Date(),
        });

        // Notify room
        io?.to(roomId).emit('user:joined', { userId, username });
        io?.to(roomId).emit('message:new', systemMessage);

        // Send updated participants list
        const updatedRoom = await RoomModel.findOne({ roomId });
        if (updatedRoom) {
          io?.to(roomId).emit('participants:update', updatedRoom.participants);
        }

        console.log(`👤 ${username} joined room: ${roomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
      }
    });

    // Leave room
    socket.on('room:leave', async ({ roomId, userId }) => {
      try {
        await connectDB();

        socket.leave(roomId);

        // Remove from participants
        const room = await RoomModel.findOneAndUpdate(
          { roomId },
          { 
            $pull: { participants: userId },
            lastActivity: new Date()
          },
          { new: true }
        );

        if (room && socket.data.username) {
          // Create system message
          const systemMessage = await MessageModel.create({
            roomId,
            userId: 'system',
            username: 'System',
            message: `${socket.data.username} left the room`,
            type: 'system',
            timestamp: new Date(),
          });

          // Notify room
          io?.to(roomId).emit('user:left', { userId, username: socket.data.username });
          io?.to(roomId).emit('message:new', systemMessage);
          io?.to(roomId).emit('participants:update', room.participants);
        }

        console.log(`👋 User ${userId} left room: ${roomId}`);
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    });

    // Send message
    socket.on('message:send', async ({ roomId, userId, username, message }) => {
      try {
        await connectDB();

        // Create message
        const newMessage = await MessageModel.create({
          roomId,
          userId,
          username,
          message,
          type: 'text',
          timestamp: new Date(),
        });

        // Update room activity
        await RoomModel.updateOne(
          { roomId },
          { lastActivity: new Date() }
        );

        // Broadcast to room
        io?.to(roomId).emit('message:new', newMessage);

        console.log(`💬 Message in ${roomId}: ${message.substring(0, 30)}...`);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    // Update text content
    socket.on('text:change', async ({ roomId, textContent, userId }) => {
      try {
        await connectDB();

        // Update room text content
        await RoomModel.updateOne(
          { roomId },
          { 
            textContent,
            lastActivity: new Date()
          }
        );

        // Broadcast to others in room (exclude sender)
        socket.to(roomId).emit('text:update', { textContent, userId });
      } catch (error) {
        console.error('Error updating text:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      try {
        if (socket.data.roomId && socket.data.userId) {
          await connectDB();

          const { roomId, userId, username } = socket.data;

          // Remove from participants
          const room = await RoomModel.findOneAndUpdate(
            { roomId },
            { 
              $pull: { participants: userId },
              lastActivity: new Date()
            },
            { new: true }
          );

          if (room && username) {
            // Create system message
            const systemMessage = await MessageModel.create({
              roomId,
              userId: 'system',
              username: 'System',
              message: `${username} disconnected`,
              type: 'system',
              timestamp: new Date(),
            });

            io?.to(roomId).emit('user:left', { userId, username });
            io?.to(roomId).emit('message:new', systemMessage);
            io?.to(roomId).emit('participants:update', room.participants);
          }
        }

        console.log('❌ Socket disconnected:', socket.id);
      } catch (error) {
        console.error('Error on disconnect:', error);
      }
    });
  });

  console.log('🚀 Socket.IO server initialized');
  return io;
};

export const getIO = (): SocketServer | undefined => {
  return io;
};