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
  isPrivate: boolean;
  passwordHash?: string;
}

export interface CreateRoomInput {
  name?: string;
  destructionTimer?: number;
  autoDelete: boolean;
  isPrivate: boolean;
  password?: string;
}

export interface JoinRoomInput {
  roomId: string;
  password?: string;
}

export interface DeleteRoomInput {
  password: string;
}

export interface RoomResponse {
  success: boolean;
  room?: Room;
  message?: string;
  error?: string;
  requiresPassword?: boolean;
}

export interface RoomsListResponse {
  success: boolean;
  rooms: Room[];
  error?: string;
}

export type RoomStatus = 'active' | 'inactive' | 'expired';