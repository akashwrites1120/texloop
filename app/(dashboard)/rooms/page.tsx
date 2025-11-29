"use client";

import { useState, useMemo } from "react";
import { useRooms } from "@/hooks/useRoom";
import RoomList from "@/components/dashboard/RoomList";
import CreateRoomDialog from "@/components/dashboard/CreateRoomDialog";
import SearchRooms from "@/components/dashboard/SearchRooms";
import { Room } from "@/types/room";

export default function RoomsPage() {
  const { rooms, isLoading } = useRooms();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRooms = useMemo(() => {
    if (!searchQuery) return rooms;

    return rooms.filter((room: Room) =>
      room.roomId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rooms, searchQuery]);

  return (
    <div className="container mx-auto lg:px-20 md:px-16 px-6 py-8 pt-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Active Rooms</h1>
          <p className="text-muted-foreground mt-1">
            Join an existing room or create a new one to start sharing.
          </p>
        </div>
        <CreateRoomDialog />
      </div>

      <div className="mb-6 max-w-md">
        <SearchRooms value={searchQuery} onChange={setSearchQuery} />
      </div>

      <RoomList rooms={filteredRooms} isLoading={isLoading} />
    </div>
  );
}
