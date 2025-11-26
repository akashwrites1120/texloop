export interface Message {
  _id: string;
  roomId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system';
}

export interface CreateMessageInput {
  roomId: string;
  userId: string;
  username: string;
  message: string;
  type?: 'text' | 'system';
}

export interface MessagesResponse {
  success: boolean;
  messages: Message[];
  error?: string;
}