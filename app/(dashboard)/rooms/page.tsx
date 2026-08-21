"use client";

import { useState, useMemo } from "react";
import { useRooms } from "@/hooks/useRoom";
import RoomList from "@/components/dashboard/RoomList";
import CreateRoomDialog from "@/components/dashboard/CreateRoomDialog";
import SearchRooms from "@/components/dashboard/SearchRooms";
import Reveal from "@/components/shared/Reveal";
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
    <div className="relative mx-auto w-full max-w-6xl px-4 py-8 pt-28 sm:px-6">
      <div className="bg-dots mask-fade-y pointer-events-none absolute inset-x-0 top-0 h-56 opacity-60" />

      <Reveal className="relative">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs tracking-widest text-brand uppercase">
              browse
            </p>
            <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Active rooms
            </h1>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Jump into a live room or spin up your own — it takes one click.
            </p>
          </div>
          <CreateRoomDialog />
        </div>

        <div className="mt-8 mb-6 max-w-md">
          <SearchRooms value={searchQuery} onChange={setSearchQuery} />
        </div>
      </Reveal>

      <div className="relative">
        <RoomList rooms={filteredRooms} isLoading={isLoading} />
      </div>
    </div>
  );
}
