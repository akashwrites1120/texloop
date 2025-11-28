"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { useRoom } from "@/hooks/useRoom";
import { Message } from "@/types/message";
import RoomHeader from "@/components/room/RoomHeader";
import TextEditor from "@/components/room/TextEditor";
import ChatPanel from "@/components/room/ChatPanel";
import {
  Loader2,
  Lock,
  AlertCircle,
  MessageSquare,
  FileText,
  ChevronLeft,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [connectionError, setConnectionError] = useState("");

  // Password verification state
  const [password, setPassword] = useState(urlPassword || "");
  const [passwordError, setPasswordError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Mobile view state
  const [activeTab, setActiveTab] = useState<"editor" | "chat">("editor");
  const [unreadCount, setUnreadCount] = useState(0);

  // Monitor connection status
  useEffect(() => {
    if (!isConnected && hasJoined) {
      setConnectionError("Connection lost. Reconnecting...");
    } else {
      setConnectionError("");
    }
  }, [isConnected, hasJoined]);

  // Check if room requires password and verify
  useEffect(() => {
    if (!room) return;

    const verifyAccess = async () => {
      if (!room.isPrivate) {
        setIsVerified(true);
        return;
      }

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

  // Join room via socket with retry logic
  useEffect(() => {
    if (!socket || !isConnected || !roomId || hasJoined || !isVerified) return;

    const joinRoom = () => {
      console.log(`🔌 Joining room ${roomId} as ${username}`);
      socket.emit("room:join", {
        roomId,
        userId,
        username,
        password: room?.isPrivate ? password : undefined,
      });
      setHasJoined(true);
    };

    joinRoom();

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
      
      // Increment unread count if not on chat tab (mobile)
      if (activeTab !== "chat" && window.innerWidth < 768) {
        setUnreadCount((prev) => prev + 1);
      }
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

      setTimeout(() => {
        router.push("/rooms");
      }, 3000);
    };

    const handleError = (data: { message: string }) => {
      console.error("Socket error:", data.message);
      setConnectionError(data.message);
    };

    const handleConnect = () => {
      console.log("✅ Socket reconnected");
      setConnectionError("");
      if (hasJoined && roomId) {
        socket.emit("room:join", {
          roomId,
          userId,
          username,
          password: room?.isPrivate ? password : undefined,
        });
      }
    };

    const handleDisconnect = () => {
      console.log("❌ Socket disconnected");
      setConnectionError("Connection lost. Reconnecting...");
    };

    socket.on("message:new", handleNewMessage);
    socket.on("text:update", handleTextUpdate);
    socket.on("room:deleted", handleRoomDeleted);
    socket.on("error", handleError);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("text:update", handleTextUpdate);
      socket.off("room:deleted", handleRoomDeleted);
      socket.off("error", handleError);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket, router, hasJoined, roomId, userId, username, room, password, activeTab]);

  // Reset unread count when switching to chat tab
  useEffect(() => {
    if (activeTab === "chat") {
      setUnreadCount(0);
    }
  }, [activeTab]);

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

  // Handle sending messages with connection check
  const handleSendMessage = useCallback(
    (message: string) => {
      if (!socket || !isConnected) {
        setConnectionError(
          "Not connected to server. Please wait or refresh the page."
        );
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

      setConnectionError("");
    },
    [socket, isConnected, roomId, userId, username]
  );

  // Loading state
  if (isLoading || verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full animate-pulse" />
            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-primary relative" />
          </div>
          <p className="text-sm sm:text-base text-muted-foreground font-medium">
            {verifying ? "Verifying access..." : "Loading room..."}
          </p>
        </div>
      </div>
    );
  }

  // Room deleted state
  if (roomDeleted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive text-lg sm:text-xl">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>Room Deleted</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Room No Longer Available</AlertTitle>
              <AlertDescription className="text-sm">{deletionMessage}</AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md shadow-lg text-center">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Room Not Found</CardTitle>
            <CardDescription className="text-sm">
              This room does not exist or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/rooms")} size="lg" className="w-full sm:w-auto">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Browse Active Rooms
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Password verification required
  if (room.isPrivate && !isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-center text-xl sm:text-2xl">Private Room</CardTitle>
            <CardDescription className="text-center text-sm">
              This room is password protected. Enter the password to join.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">Password</Label>
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
                className="h-10 sm:h-11 text-base"
              />
              {passwordError && (
                <p className="text-xs sm:text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {passwordError}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/rooms")}
              className="w-full sm:flex-1 h-10 sm:h-11"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordSubmit}
              disabled={verifying || !password.trim()}
              className="w-full sm:flex-1 h-10 sm:h-11"
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
    <div className="h-screen flex flex-col bg-background">
      <RoomHeader room={room} roomPassword={password} />

      {/* Connection Status Alert */}
      {connectionError && (
        <Alert variant="destructive" className="m-2 sm:m-3 md:m-4 mb-0 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm sm:text-base">Connection Issue</AlertTitle>
          <AlertDescription className="text-xs sm:text-sm">{connectionError}</AlertDescription>
        </Alert>
      )}

      {/* Desktop View - Side by Side */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Text Editor */}
        <div className="flex-1 flex flex-col border-r">
          <TextEditor value={textContent} onChange={handleTextChange} />
        </div>

        {/* Chat Panel */}
        <div className="w-80 lg:w-130 flex flex-col">
          <ChatPanel
            messages={messages}
            currentUserId={userId}
            onSendMessage={handleSendMessage}
            isConnected={isConnected}
          />
        </div>
      </div>

      {/* Mobile View - Tabs */}
      <div className="md:hidden flex-1 flex flex-col overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "editor" | "chat")}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2 rounded-none border-b h-11 sm:h-12 bg-background/95 backdrop-blur">
            <TabsTrigger 
              value="editor" 
              className="gap-1.5 sm:gap-2 text-sm data-[state=active]:bg-muted/50"
            >
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Editor</span>
              <span className="xs:hidden">Edit</span>
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="gap-1.5 sm:gap-2 relative text-sm data-[state=active]:bg-muted/50"
            >
              <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Chat</span>
              <span className="xs:hidden">Talk</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] px-1 flex items-center justify-center text-[9px] sm:text-[10px] font-bold bg-primary text-primary-foreground rounded-full animate-in zoom-in-50">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
              {messages.length > 0 && unreadCount === 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium bg-muted-foreground/10 text-muted-foreground rounded-full">
                  {messages.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent 
            value="editor" 
            className="flex-1 m-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col"
          >
            <TextEditor value={textContent} onChange={handleTextChange} />
          </TabsContent>

          <TabsContent 
            value="chat" 
            className="flex-1 m-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col"
          >
            <ChatPanel
              messages={messages}
              currentUserId={userId}
              onSendMessage={handleSendMessage}
              isConnected={isConnected}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}