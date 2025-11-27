'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useRoom } from '@/hooks/useRoom';
import { Message } from '@/types/message';
import RoomHeader from '@/components/room/RoomHeader';
import TextEditor from '@/components/room/TextEditor';
import ChatPanel from '@/components/room/ChatPanel';
import { Loader2 } from 'lucide-react';
import { nanoid } from 'nanoid';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const { socket, isConnected } = useSocket();
  const { room, isLoading, isError } = useRoom(roomId);

  const [userId] = useState(() => nanoid(10));
  const [username] = useState(() => `User-${nanoid(4)}`);
  const [textContent, setTextContent] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasJoined, setHasJoined] = useState(false);

  // Fetch initial messages
  useEffect(() => {
    if (!roomId) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}/messages`);
        const data = await response.json();
        if (data.success) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [roomId]);

  // Set initial text content from room
  useEffect(() => {
    if (room) {
      setTextContent(room.textContent || '');
    }
  }, [room]);

  // Join room via socket
  useEffect(() => {
    if (!socket || !isConnected || !roomId || hasJoined) return;

    socket.emit('room:join', { roomId, userId, username });
    setHasJoined(true);

    return () => {
      if (socket && hasJoined) {
        socket.emit('room:leave', { roomId, userId });
      }
    };
  }, [socket, isConnected, roomId, userId, username, hasJoined]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleTextUpdate = ({ textContent: newText }: { textContent: string; userId: string }) => {
      setTextContent(newText);
    };

    const handleRoomDeleted = () => {
      alert('This room has been deleted');
      router.push('/rooms');
    };

    socket.on('message:new', handleNewMessage);
    socket.on('text:update', handleTextUpdate);
    socket.on('room:deleted', handleRoomDeleted);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('text:update', handleTextUpdate);
      socket.off('room:deleted', handleRoomDeleted);
    };
  }, [socket, router]);

  // Handle text changes
  const handleTextChange = useCallback(
    (newText: string) => {
      setTextContent(newText);
      
      if (socket && isConnected) {
        socket.emit('text:change', {
          roomId,
          textContent: newText,
          userId,
        });
      }
    },
    [socket, isConnected, roomId, userId]
  );

  // Handle sending messages
  const handleSendMessage = useCallback(
    (message: string) => {
      if (!socket || !isConnected) return;

      socket.emit('message:send', {
        roomId,
        userId,
        username,
        message,
      });
    },
    [socket, isConnected, roomId, userId, username]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading room...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !room) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Room Not Found</h1>
          <p className="text-muted-foreground mb-4">
            This room does not exist or has expired.
          </p>
          <button
            onClick={() => router.push('/rooms')}
            className="text-primary hover:underline"
          >
            Browse Active Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <RoomHeader room={room} />

      <div className="flex-1 flex overflow-hidden">
        {/* Text Editor */}
        <div className="flex-1 flex flex-col border-r">
          <TextEditor
            value={textContent}
            onChange={handleTextChange}
          />
        </div>

        {/* Chat Panel */}
        <div className="w-96 flex flex-col">
          <ChatPanel
            messages={messages}
            currentUserId={userId}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
}