import mongoose, { Schema, Model } from 'mongoose';
import { Message } from '@/types/message';

const MessageSchema = new Schema<Message>(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
      // Message content is stored encrypted
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ['text', 'system'],
      default: 'text',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
MessageSchema.index({ roomId: 1, timestamp: -1 });

const MessageModel: Model<Message> = mongoose.models.Message || mongoose.model<Message>('Message', MessageSchema);

export default MessageModel;