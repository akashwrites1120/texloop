import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

import { Server } from "socket.io";
import mongoose from "mongoose";

import RoomModel from "./models/room";
import MessageModel from "./models/message";
import {
  verifyPassword,
  encryptMessage,
  decryptMessage,
} from "./lib/encryption";
import { rateLimiter } from "./lib/rate-limiter";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// MongoDB Connection
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .catch((err) => console.error("MongoDB connection error:", err));
} else {
  console.error("MONGODB_URI is not defined");
}

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${port}`,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Store io instance globally for API routes
  // @ts-ignore
  global.io = io;

  io.on("connection", (socket) => {
    // Join room
    socket.on("room:join", async ({ roomId, userId, username, password }) => {
      try {
        // Rate limiting: 20 join attempts per minute per socket
        if (rateLimiter.isRateLimited(`join:${socket.id}`, 20, 60000)) {
          socket.emit("error", {
            message: "Too many join attempts. Please wait a moment.",
          });
          return;
        }

        const room = await RoomModel.findOne({ roomId, isActive: true });
        if (!room) {
          socket.emit("room:deleted", {
            message: "Room not found or has been deleted.",
          });
          return;
        }

        if (room.isPrivate && password) {
          const isValid = await verifyPassword(
            password as string,
            room.passwordHash || ""
          );
          if (!isValid) {
            socket.emit("error", { message: "Incorrect password" });
            return;
          }
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
          userId: "system",
          username: "System",
          message: `${username} joined the room`,
          type: "system",
          timestamp: new Date(),
        });

        io.to(roomId).emit("user:joined", { userId, username });
        io.to(roomId).emit("message:new", systemMessage.toObject());

        const updatedRoom = await RoomModel.findOne({ roomId });
        if (updatedRoom) {
          io.to(roomId).emit("participants:update", updatedRoom.participants);
        }
      } catch (error) {
        console.error("Error joining room:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // Leave room
    socket.on("room:leave", async ({ roomId, userId }) => {
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
            userId: "system",
            username: "System",
            message: `${socket.data.username} left the room`,
            type: "system",
            timestamp: new Date(),
          });

          io.to(roomId).emit("user:left", {
            userId,
            username: socket.data.username,
          });
          io.to(roomId).emit("message:new", systemMessage.toObject());
          io.to(roomId).emit("participants:update", room.participants);
        }
      } catch (error) {
        console.error("Error leaving room:", error);
      }
    });

    // Send message
    socket.on("message:send", async ({ roomId, userId, username, message }) => {
      try {
        // Rate limiting: 30 messages per minute per socket
        if (rateLimiter.isRateLimited(`message:${socket.id}`, 30, 60000)) {
          socket.emit("error", {
            message: "Too many messages. Please slow down.",
          });
          return;
        }

        // Encrypt message before storing in database
        const encryptedMessage = encryptMessage(message);

        const newMessage = await MessageModel.create({
          roomId,
          userId,
          username,
          message: encryptedMessage,
          type: "text",
          timestamp: new Date(),
        });

        await RoomModel.updateOne({ roomId }, { lastActivity: new Date() });

        // Decrypt message before broadcasting to users
        const messageObj = newMessage.toObject();
        messageObj.message = decryptMessage(messageObj.message);
        io.to(roomId).emit("message:new", messageObj);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Update text content (live editing)
    socket.on("text:change", async ({ roomId, textContent, userId }) => {
      try {
        await RoomModel.updateOne(
          { roomId },
          {
            textContent,
            lastActivity: new Date(),
          }
        );

        // Broadcast to ALL users in the room (including sender for confirmation)
        io.to(roomId).emit("text:update", { textContent });
      } catch (error) {
        console.error("Error updating text:", error);
      }
    });

    // Disconnect
    socket.on("disconnect", async () => {
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
              userId: "system",
              username: "System",
              message: `${username} disconnected`,
              type: "system",
              timestamp: new Date(),
            });

            io.to(roomId).emit("user:left", { userId, username });
            io.to(roomId).emit("message:new", systemMessage.toObject());
            io.to(roomId).emit("participants:update", room.participants);
          }
        }
      } catch (error) {
        console.error("Error on disconnect:", error);
      }
    });
  });

  // Periodic cleanup service - runs every minute
  const setupCleanupService = async () => {
    const { CleanupService } = await import("./lib/cleanup-service");

    const runCleanup = async () => {
      // Callback to notify clients when a room is deleted
      const notifyCallback = async (roomId: string) => {
        if (io) {
          io.to(roomId).emit("room:deleted", {
            message: "This room has expired and been automatically deleted.",
          });

          // Disconnect all sockets in this room
          const sockets = await io.in(roomId).fetchSockets();
          for (const socket of sockets) {
            socket.leave(roomId);
          }
        }
      };

      // Cleanup expired rooms
      await CleanupService.cleanupExpiredRooms(notifyCallback);

      // Optionally cleanup inactive rooms (24 hours of inactivity)
      // await CleanupService.cleanupInactiveRooms(24, notifyCallback);
    };

    // Run cleanup every minute
    setInterval(runCleanup, 60 * 1000);

    // Run cleanup on startup
    runCleanup();
  };

  setupCleanupService();

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      if (process.env.NODE_ENV !== "production") {
        console.log(`Server ready on http://${hostname}:${port}`);
      }
    });
});
