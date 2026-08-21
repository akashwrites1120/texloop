'use client';

import { Room } from '@/types/room';
import RoomCard from './RoomCard';
import Reveal from '@/components/shared/Reveal';
import { Loader2, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreateRoomDialog from './CreateRoomDialog';

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{ animationDelay: `${i * 90}ms` }}
            className="ring-hairline h-52 animate-pulse rounded-2xl bg-card"
          />
        ))}
        <div className="col-span-full flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Finding live rooms…
        </div>
      </div>
    );
  }

  if (activeRooms.length === 0) {
    return (
      <Reveal>
        <div className="flex min-h-[380px] items-center justify-center p-4">
          <div className="flex max-w-sm flex-col items-center rounded-2xl border border-dashed px-8 py-12 text-center">
            <div className="relative flex h-14 w-14 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping-slow rounded-full bg-brand/30" />
              <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-brand-muted text-accent-foreground">
                <Radio className="h-5 w-5" />
              </span>
            </div>
            <h3 className="font-display mt-5 text-lg font-semibold">No active rooms</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              The airwaves are quiet. Be the first to open a room and start sharing.
            </p>
            <CreateRoomDialog>
              <Button variant="outline" className="mt-6 rounded-full hover:cursor-pointer">
                Create the first room
              </Button>
            </CreateRoomDialog>
          </div>
        </div>
      </Reveal>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
      {activeRooms.map((room, i) => (
        <RoomCard key={room._id} room={room} index={i} />
      ))}
    </div>
  );
}
