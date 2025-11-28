'use client';

import { Room } from '@/types/room';
import RoomCard from './RoomCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, Loader2 } from 'lucide-react';

interface RoomListProps {
  rooms: Room[];
  isLoading?: boolean;
}

export default function RoomList({ rooms, isLoading }: RoomListProps) {
  // Filter out expired rooms
  const activeRooms = rooms.filter(room => {
    if (!room.expiresAt) return true;
    return new Date(room.expiresAt) > new Date();
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-muted/50 animate-pulse rounded-xl border border-border/50"
            />
          ))}
        </div>
      </div>
    );
  }

  if (activeRooms.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Alert className="max-w-md border-2 border-dashed">
          <InfoIcon className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">No active rooms</AlertTitle>
          <AlertDescription className="text-base mt-2">
            Be the first to create a room and start sharing text with others!
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 auto-rows-fr">
      {activeRooms.map((room) => (
        <RoomCard key={room._id} room={room} />
      ))}
    </div>
  );
}