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
  const { room, isLoading, isError, mutate } = useRoom(roomId);

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

  // Live sync toggle - OFF by default
  const [liveSyncEnabled, setLiveSyncEnabled] = useState(false);

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
            if (data.room) {
              mutate({ success: true, room: data.room }, { revalidate: false });
            }
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
        if (data.room) {
          mutate({ success: true, room: data.room }, { revalidate: false });
        }
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

  // Fetch initial messages - refetch when rejoining
  useEffect(() => {
    if (!roomId || !isVerified) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}/messages`);
        const data = await response.json();
        if (data.success) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [roomId, isVerified, hasJoined]); // Added hasJoined to refetch when rejoining

  // Set initial text content from room
  useEffect(() => {
    if (room) {
      setTextContent(room.textContent || "");
    }
  }, [room]);

  // Join room via socket
  useEffect(() => {
    if (!socket || !isConnected || !roomId || hasJoined || !isVerified) return;

    socket.emit("room:join", {
      roomId,
      userId,
      username,
      password: room?.isPrivate ? password : undefined,
    });
    setHasJoined(true);

    // Leaving is handled by the server's disconnect handler when the
    // socket from useSocket() is disconnected on unmount.
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
      setMessages((prev) => [...prev, message]);

      // Increment unread count if not on chat tab (mobile)
      if (activeTab !== "chat" && window.innerWidth < 768) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    const handleParticipantsUpdate = (participants: string[]) => {
      if (room) {
        mutate(
          {
            success: true,
            room: { ...room, participants },
          },
          false
        );
      }
    };

    const handleTextUpdate = ({
      textContent: newText,
    }: {
      textContent: string;
    }) => {
      // Only update if live sync is enabled
      if (liveSyncEnabled) {
        setTextContent(newText);
      }
    };

    const handleRoomDeleted = (data?: { message?: string }) => {
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
      setConnectionError("Connection lost. Reconnecting...");
    };

    socket.on("message:new", handleNewMessage);
    socket.on("participants:update", handleParticipantsUpdate);
    socket.on("text:update", handleTextUpdate);
    socket.on("room:deleted", handleRoomDeleted);
    socket.on("error", handleError);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("participants:update", handleParticipantsUpdate);
      socket.off("text:update", handleTextUpdate);
      socket.off("room:deleted", handleRoomDeleted);
      socket.off("error", handleError);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [
    socket,
    router,
    hasJoined,
    roomId,
    userId,
    username,
    room,
    password,
    activeTab,
    liveSyncEnabled,
  ]);

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

      // Only broadcast if live sync is enabled
      if (socket && isConnected && liveSyncEnabled) {
        socket.emit("text:change", {
          roomId,
          textContent: newText,
          userId,
        });
      }
    },
    [socket, isConnected, roomId, userId, liveSyncEnabled]
  );

  // Handle sending messages
  const handleSendMessage = useCallback(
    (message: string) => {
      if (!socket || !isConnected) {
        setConnectionError(
          "Not connected to server. Please wait or refresh the page."
        );
        console.error("Cannot send message: socket not connected");
        return;
      }

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

  // Handle message click - load message content into editor
  const handleSelectMessage = useCallback((message: Message) => {
    if (message.type !== "system") {
      setTextContent(message.message);
      // Switch to editor tab on mobile
      if (window.innerWidth < 768) {
        setActiveTab("editor");
      }
    }
  }, []);

  // Loading state
  if (isLoading || verifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="animate-fade-up space-y-4 text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 animate-pulse rounded-full bg-brand/20 blur-xl" />
            <Loader2 className="relative h-10 animate-spin text-brand sm:h-12 sm:w-12" />
          </div>
          <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase sm:text-sm">
            {verifying ? "verifying access…" : "loading room…"}
          </p>
        </div>
      </div>
    );
  }

  // Room deleted state
  if (roomDeleted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="animate-fade-up w-full max-w-md rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg text-destructive sm:text-xl">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>Room deleted</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Room no longer available</AlertTitle>
              <AlertDescription className="text-sm">
                {deletionMessage}
              </AlertDescription>
            </Alert>
            <p className="font-mono text-xs text-muted-foreground">
              Redirecting to rooms…
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (isError || !room) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
        <div className="bg-dots mask-fade-y pointer-events-none absolute inset-0 opacity-60" />
        <div className="animate-fade-up relative w-full max-w-md">
          {/* Icon */}
          <div className="mb-7 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping-slow rounded-full bg-destructive/25" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border bg-card shadow-sm">
                <AlertCircle
                  className="h-7 w-7 text-destructive"
                  strokeWidth={2}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Room not found
            </h1>
            <p className="mt-3 mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground">
              This room doesn&apos;t exist — or its timer ran out and it
              quietly deleted itself.
            </p>

            <Button
              onClick={() => router.push("/rooms")}
              className="mt-7 h-11 w-full rounded-full hover:cursor-pointer active:scale-[0.98]"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
              Browse active rooms
            </Button>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Double-check the link — IDs look like{" "}
            <span className="font-mono">clever-cat-123</span>.
          </p>
        </div>
      </div>
    );
  }

  // Password verification required
  if (room.isPrivate && !isVerified) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
        <div className="bg-dots mask-fade-y pointer-events-none absolute inset-x-0 top-0 h-72 opacity-60" />
        <Card className="animate-fade-up relative w-full max-w-md rounded-2xl py-8 shadow-sm">
          <CardHeader className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-muted text-accent-foreground">
              <Lock className="h-5 w-5" />
            </div>
            <CardTitle className="font-display text-center text-xl sm:text-2xl">
              Private room
            </CardTitle>
            <CardDescription className="text-center text-sm">
              This room is password protected. Enter the password to join.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">
                Password
              </Label>
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

          <CardFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="ghost"
              onClick={() => router.push("/rooms")}
              className="h-10 w-full rounded-full hover:cursor-pointer sm:h-11 sm:flex-1 active:scale-[0.98]"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordSubmit}
              disabled={verifying || !password.trim()}
              className="h-10 w-full rounded-full hover:cursor-pointer sm:h-11 sm:flex-1 active:scale-[0.98]"
            >
              {verifying && <Loader2 className="animate-spin" />}
              Join room
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-background overflow-hidden">
      <RoomHeader room={room} roomPassword={password} />

      {/* Connection Status Alert */}
      {connectionError && (
        <Alert
          variant="destructive"
          className="m-2 sm:m-3 md:m-4 mb-0 rounded-lg"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm sm:text-base">
            Connection Issue
          </AlertTitle>
          <AlertDescription className="text-xs sm:text-sm">
            {connectionError}
          </AlertDescription>
        </Alert>
      )}

      {/* Desktop View - Side by Side */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Text Editor */}
        <div className="flex-1 flex flex-col border-r">
          <TextEditor
            value={textContent}
            onChange={handleTextChange}
            liveSyncEnabled={liveSyncEnabled}
            onLiveSyncToggle={setLiveSyncEnabled}
            roomPassword={password}
            roomId={roomId}
          />
        </div>

        {/* Chat Panel */}
        <div className="w-90 lg:w-120 flex flex-col">
          <ChatPanel
            messages={messages}
            currentUserId={userId}
            onSendMessage={handleSendMessage}
            onSelectMessage={handleSelectMessage}
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
          <TabsList className="grid w-full grid-cols-2 rounded-none border-b h-10 sm:h-12 bg-background/95 backdrop-blur shrink-0">
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
            <TextEditor
              value={textContent}
              onChange={handleTextChange}
              liveSyncEnabled={liveSyncEnabled}
              onLiveSyncToggle={setLiveSyncEnabled}
              roomPassword={password}
              roomId={roomId}
            />
          </TabsContent>

          <TabsContent
            value="chat"
            className="flex-1 m-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col"
          >
            <ChatPanel
              messages={messages}
              currentUserId={userId}
              onSendMessage={handleSendMessage}
              onSelectMessage={handleSelectMessage}
              isConnected={isConnected}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
