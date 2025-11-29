"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
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
import Navbar from "@/components/shared/Navbar";

export default function JoinPage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requiresPassword, setRequiresPassword] = useState(false);

  const handleJoin = async () => {
    if (!roomId.trim()) {
      setError("Please enter a room ID");
      return;
    }

    if (requiresPassword && !password.trim()) {
      setError("Please enter the room password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // First, check if room exists and if it requires password
      const checkResponse = await fetch(`/api/rooms/${roomId}`);
      const checkData = await checkResponse.json();

      if (!checkData.success || !checkData.room) {
        setError("Room not found or has expired");
        setLoading(false);
        return;
      }

      // If room is private and we haven't shown password field yet
      if (checkData.room.isPrivate && !requiresPassword) {
        setRequiresPassword(true);
        setLoading(false);
        return;
      }

      // If room is private, verify password
      if (checkData.room.isPrivate) {
        const verifyResponse = await fetch(`/api/rooms/${roomId}/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });

        const verifyData = await verifyResponse.json();

        if (!verifyData.success) {
          setError("Incorrect password");
          setLoading(false);
          return;
        }
      }

      // Password verified or public room, proceed to join
      router.push(
        `/room/${roomId}${checkData.room.isPrivate ? `?password=${encodeURIComponent(password)}` : ""}`
      );
    } catch (err) {
      console.error("Error joining room:", err);
      setError("Failed to join room. Please try again.");
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleJoin();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 ">
        <Card className="w-full max-w-md pt-4 pb-6">
          <CardHeader>
            <CardTitle className="text-3xl">Join Room</CardTitle>
            <CardDescription>
              Enter a Room ID to join and start collaborating.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roomId">Room ID</Label>
              <Input
                id="roomId"
                type="text"
                placeholder="e.g., clever-cat-123"
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value);
                  setError("");
                  setRequiresPassword(false);
                  setPassword("");
                }}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
            </div>

            {requiresPassword && (
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Room Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter room password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  autoFocus
                />
                <p className="text-sm text-muted-foreground">
                  This is a private room. Password required to join.
                </p>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="p-4 bg-muted rounded-lg text-sm">
              <p className="font-medium mb-1">💡 Tip</p>
              <p className="text-muted-foreground">
                You can also paste a full room link here. We'll extract the Room
                ID automatically.
              </p>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              onClick={handleJoin}
              disabled={loading || !roomId.trim()}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {requiresPassword ? "Verify & Join" : "Join Room"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
