export interface Room {
  _id: string;
  roomId: string;
  name?: string;
  createdBy: string;
  createdAt: Date;
  expiresAt?: Date;
  lastActivity: Date;
  isActive: boolean;
  destructionTimer?: number; // in hours
  autoDelete: boolean;
  participants: string[];
  textContent: string;
}

export interface CreateRoomInput {
  name?: string;
  destructionTimer?: number;
  autoDelete: boolean;
}

export interface RoomResponse {
  success: boolean;
  room?: Room;
  message?: string;
  error?: string;
}

export interface RoomsListResponse {
  success: boolean;
  rooms: Room[];
  error?: string;
}

export type RoomStatus = 'active' | 'inactive' | 'expired';