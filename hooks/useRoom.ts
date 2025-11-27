'use client';

import useSWR from 'swr';
import { Room, RoomResponse } from '@/types/room';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useRoom(roomId: string) {
  const { data, error, isLoading, mutate } = useSWR<RoomResponse>(
    roomId ? `/api/rooms/${roomId}` : null,
    fetcher,
    {
      refreshInterval: 0, // Don't auto-refresh, we'll use socket for real-time updates
      revalidateOnFocus: false,
    }
  );

  return {
    room: data?.room,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useRooms() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/rooms',
    fetcher,
    {
      refreshInterval: 5000, // Refresh every 5 seconds
    }
  );

  return {
    rooms: data?.rooms || [],
    isLoading,
    isError: error,
    mutate,
  };
}