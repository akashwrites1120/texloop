import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import mongoose from 'mongoose';

import RoomModel from './models/Room.js';
import MessageModel from './models/Message.js';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${port}`,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);

    // Join room
    socket.on('room:join', async ({ roomId, userId, username }) => {
      try {
        const room = await RoomModel.findOne({ roomId, isActive: true });
        if (!room) {
          socket.emit('room:deleted');
          return;
        }

        socket.join(roomId);
        socket.data = { userId, username, roomId };

        if (!room.participants.includes(userId)) {
          await RoomModel.updateOne(
            { roomId },
            {
              $addToSet: { participants: userId },
              lastActivity: new Date(),
            }
          );
        }

        const systemMessage = await MessageModel.create({
          roomId,
          userId: 'system',
          username: 'System',
          message: `${username} joined the room`,
          type: 'system',
          timestamp: new Date(),
        });

        io.to(roomId).emit('user:joined', { userId, username });
        io.to(roomId).emit('message:new', systemMessage);

        const updatedRoom = await RoomModel.findOne({ roomId });
        if (updatedRoom) {
          io.to(roomId).emit('participants:update', updatedRoom.participants);
        }

        console.log(`👤 ${username} joined room: ${roomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
      }
    });

    // Leave room
    socket.on('room:leave', async ({ roomId, userId }) => {
      try {
        socket.leave(roomId);

        const room = await RoomModel.findOneAndUpdate(
          { roomId },
          {
            $pull: { participants: userId },
            lastActivity: new Date(),
          },
          { new: true }
        );

        if (room && socket.data.username) {
          const systemMessage = await MessageModel.create({
            roomId,
            userId: 'system',
            username: 'System',
            message: `${socket.data.username} left the room`,
            type: 'system',
            timestamp: new Date(),
          });

          io.to(roomId).emit('user:left', { userId, username: socket.data.username });
          io.to(roomId).emit('message:new', systemMessage);
          io.to(roomId).emit('participants:update', room.participants);
        }
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    });

    // Send message
    socket.on('message:send', async ({ roomId, userId, username, message }) => {
      try {
        const newMessage = await MessageModel.create({
          roomId,
          userId,
          username,
          message,
          type: 'text',
          timestamp: new Date(),
        });

        await RoomModel.updateOne({ roomId }, { lastActivity: new Date() });

        io.to(roomId).emit('message:new', newMessage);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    // Update text
    socket.on('text:change', async ({ roomId, textContent, userId }) => {
      try {
        await RoomModel.updateOne(
          { roomId },
          {
            textContent,
            lastActivity: new Date(),
          }
        );

        socket.to(roomId).emit('text:update', { textContent, userId });
      } catch (error) {
        console.error('Error updating text:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      try {
        if (socket.data.roomId && socket.data.userId) {
          const { roomId, userId, username } = socket.data;

          const room = await RoomModel.findOneAndUpdate(
            { roomId },
            {
              $pull: { participants: userId },
              lastActivity: new Date(),
            },
            { new: true }
          );

          if (room && username) {
            const systemMessage = await MessageModel.create({
              roomId,
              userId: 'system',
              username: 'System',
              message: `${username} disconnected`,
              type: 'system',
              timestamp: new Date(),
            });

            io.to(roomId).emit('user:left', { userId, username });
            io.to(roomId).emit('message:new', systemMessage);
            io.to(roomId).emit('participants:update', room.participants);
          }
        }

        console.log('❌ Socket disconnected:', socket.id);
      } catch (error) {
        console.error('Error on disconnect:', error);
      }
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`🚀 Server ready on http://${hostname}:${port}`);
      console.log(`🔌 Socket.IO ready on ws://${hostname}:${port}/api/socket`);
    });
});
