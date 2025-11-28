import mongoose, { Schema, Model } from "mongoose";
import { Room } from "@/types/room";

const RoomSchema = new Schema<Room>(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      default: null,
    },
    createdBy: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    destructionTimer: {
      type: Number,
      default: null,
    },
    autoDelete: {
      type: Boolean,
      default: true,
    },
    participants: {
      type: [String],
      default: [],
    },
    textContent: {
      type: String,
      default: "",
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    passwordHash: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for cleanup queries
RoomSchema.index({ lastActivity: 1, isActive: 1 });
RoomSchema.index({ expiresAt: 1, isActive: 1 });

// TTL index - MongoDB will automatically delete documents when expiresAt is reached
// This only works when expiresAt is set and isActive is true
RoomSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { expiresAt: { $exists: true }, isActive: true },
  }
);

const RoomModel: Model<Room> =
  mongoose.models.Room || mongoose.model<Room>("Room", RoomSchema);

export default RoomModel;
