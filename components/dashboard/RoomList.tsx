'use client';

import { Room } from '@/types/room';
import RoomCard from './RoomCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

interface RoomListProps {
  rooms: Room[];
  isLoading?: boolean;
}

export default function RoomList({ rooms, isLoading }: RoomListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-48 bg-muted animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>No active rooms</AlertTitle>
        <AlertDescription>
          Be the first to create a room and start sharing text!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <RoomCard key={room._id} room={room} />
      ))}
    </div>
  );
}