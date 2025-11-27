"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { useRoom } from "@/hooks/useRoom";
import { Message } from "@/types/message";
import RoomHeader from "@/components/room/RoomHeader";
import TextEditor from "@/components/room/TextEditor";
import ChatPanel from "@/components/room/ChatPanel";
import { Loader2, Lock, AlertCircle } from "lucide-react";
import { nanoid } from "nanoid";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = params.roomId as string;
  const urlPassword = searchParams.get("password");

  const { socket, isConnected } = useSocket();
  const { room, isLoading, isError } = useRoom(roomId);

  const [userId] = useState(() => nanoid(10));
  const [username] = useState(() => `User-${nanoid(4)}`);
  const [textContent, setTextContent] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasJoined, setHasJoined] = useState(false);
  const [roomDeleted, setRoomDeleted] = useState(false);
  const [deletionMessage, setDeletionMessage] = useState("");

  // Password verification state
  const [password, setPassword] = useState(urlPassword || "");
  const [passwordError, setPasswordError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Check if room requires password and verify
  useEffect(() => {
    if (!room) return;

    const verifyAccess = async () => {
      // If room is public, no verification needed
      if (!room.isPrivate) {
        setIsVerified(true);
        return;
      }

      // If we have password from URL, verify it
      if (urlPassword) {
        setVerifying(true);
        try {
          const response = await fetch(`/api/rooms/${roomId}/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: urlPassword }),
          });

          const data = await response.json();

          if (data.success) {
            setIsVerified(true);
          } else {
            setPasswordError("Invalid password from URL");
          }
        } catch (error) {
          console.error("Error verifying password:", error);
          setPasswordError("Failed to verify password");
        } finally {
          setVerifying(false);
        }
      }
    };

    verifyAccess();
  }, [room, roomId, urlPassword]);

  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      setPasswordError("Please enter a password");
      return;
    }

    setVerifying(true);
    setPasswordError("");

    try {
      const response = await fetch(`/api/rooms/${roomId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setIsVerified(true);
      } else {
        setPasswordError("Incorrect password");
      }
    } catch (error) {
      console.error("Error verifying password:", error);
      setPasswordError("Failed to verify password");
    } finally {
      setVerifying(false);
    }
  };

  // Fetch initial messages
  useEffect(() => {
    if (!roomId || !isVerified) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}/messages`);
        const data = await response.json();
        if (data.success) {
          setMessages(data.messages);
          console.log(`📥 Loaded ${data.messages.length} messages`);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [roomId, isVerified]);

  // Set initial text content from room
  useEffect(() => {
    if (room) {
      setTextContent(room.textContent || "");
    }
  }, [room]);

  // Join room via socket
  useEffect(() => {
    if (!socket || !isConnected || !roomId || hasJoined || !isVerified) return;

    console.log(`🔌 Joining room ${roomId} as ${username}`);
    socket.emit("room:join", {
      roomId,
      userId,
      username,
      password: room?.isPrivate ? password : undefined,
    });
    setHasJoined(true);

    return () => {
      if (socket && hasJoined) {
        socket.emit("room:leave", { roomId, userId });
      }
    };
  }, [
    socket,
    isConnected,
    roomId,
    userId,
    username,
    hasJoined,
    isVerified,
    room,
    password,
  ]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      console.log("📨 New message received:", message);
      setMessages((prev) => [...prev, message]);
    };

    const handleTextUpdate = ({
      textContent: newText,
    }: {
      textContent: string;
    }) => {
      console.log("📝 Text update received");
      setTextContent(newText);
    };

    const handleRoomDeleted = (data?: { message?: string }) => {
      console.log("🗑️ Room deleted event received");
      setRoomDeleted(true);
      setDeletionMessage(
        data?.message || "This room has been deleted by the admin."
      );

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("/rooms");
      }, 3000);
    };

    const handleError = (data: { message: string }) => {
      console.error("Socket error:", data.message);
      alert(data.message);
    };

    socket.on("message:new", handleNewMessage);
    socket.on("text:update", handleTextUpdate);
    socket.on("room:deleted", handleRoomDeleted);
    socket.on("error", handleError);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("text:update", handleTextUpdate);
      socket.off("room:deleted", handleRoomDeleted);
      socket.off("error", handleError);
    };
  }, [socket, router]);

  // Handle text changes
  const handleTextChange = useCallback(
    (newText: string) => {
      setTextContent(newText);

      if (socket && isConnected) {
        socket.emit("text:change", {
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
      if (!socket || !isConnected) {
        console.error("Cannot send message: socket not connected");
        return;
      }

      console.log(`📤 Sending message: ${message}`);
      socket.emit("message:send", {
        roomId,
        userId,
        username,
        message,
      });
    },
    [socket, isConnected, roomId, userId, username]
  );

  // Loading state
  if (isLoading || verifying) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            {verifying ? "Verifying access..." : "Loading room..."}
          </p>
        </div>
      </div>
    );
  }

  // Room deleted state
  if (roomDeleted) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Room Deleted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Room No Longer Available</AlertTitle>
              <AlertDescription>{deletionMessage}</AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground mt-4">
              Redirecting to rooms list...
            </p>
          </CardContent>
        </Card>
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
            onClick={() => router.push("/rooms")}
            className="text-primary hover:underline"
          >
            Browse Active Rooms
          </button>
        </div>
      </div>
    );
  }

  // Password verification required
  if (room.isPrivate && !isVerified) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Private Room
            </CardTitle>
            <CardDescription>
              This room is password protected. Enter the password to join.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter room password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                disabled={verifying}
                autoFocus
              />
              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/rooms")}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordSubmit}
              disabled={verifying || !password.trim()}
              className="flex-1"
            >
              {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Join Room
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <RoomHeader room={room} roomPassword={password} />

      <div className="flex-1 flex overflow-hidden">
        {/* Text Editor */}
        <div className="flex-1 flex flex-col border-r">
          <TextEditor value={textContent} onChange={handleTextChange} />
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
