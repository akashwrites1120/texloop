import mongoose, { Schema, Model } from 'mongoose';
import { Room } from '@/types/room';

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
      required: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    destructionTimer: {
      type: Number,
      default: null,
    },
    autoDelete: {
      type: Boolean,
      default: true,
      required: true,
    },
    participants: {
      type: [String],
      default: [],
      required: true,
    },
    textContent: {
      type: String,
      default: '',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for cleanup queries
RoomSchema.index({ lastActivity: 1, isActive: 1 });
RoomSchema.index({ expiresAt: 1 });

const RoomModel: Model<Room> = mongoose.models.Room || mongoose.model<Room>('Room', RoomSchema);

export default RoomModel;