"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Lightbulb } from "lucide-react";
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

  // For shaking animation
  const [shakeRoomId, setShakeRoomId] = useState(false);
  const [shakePassword, setShakePassword] = useState(false);

  const triggerShake = (
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setter(true);
    setTimeout(() => setter(false), 500);
  };

  const handleJoin = async () => {
    if (!roomId.trim()) {
      setError("Please enter a room ID");
      triggerShake(setShakeRoomId);
      return;
    }

    if (requiresPassword && !password.trim()) {
      setError("Please enter the room password");
      triggerShake(setShakePassword);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Check if room exists
      const checkResponse = await fetch(`/api/rooms/${roomId}`);
      const checkData = await checkResponse.json();

      if (!checkData.success || !checkData.room) {
        setError("Room not found or has expired");
        triggerShake(setShakeRoomId);
        setLoading(false);
        return;
      }

      // Ask for password if private
      if (checkData.room.isPrivate && !requiresPassword) {
        setRequiresPassword(true);
        setLoading(false);
        return;
      }

      // Verify password
      if (checkData.room.isPrivate) {
        const verifyResponse = await fetch(`/api/rooms/${roomId}/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });

        const verifyData = await verifyResponse.json();

        if (!verifyData.success) {
          setError("Incorrect password");
          triggerShake(setShakePassword);
          setLoading(false);
          return;
        }
      }

      // Success -> Redirect
      router.push(
        `/room/${roomId}${checkData.room.isPrivate ? `?password=${encodeURIComponent(password)}` : ""}`
      );
    } catch (err) {
      console.error("Error joining room:", err);
      setError("Failed to join room. Please try again.");
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleJoin();
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="bg-dots mask-fade-y pointer-events-none absolute inset-x-0 top-0 h-72 opacity-60" />
      <Navbar />

      <div className="relative flex flex-1 items-center justify-center p-4">
        <Card className="animate-fade-up w-full max-w-md rounded-2xl shadow-sm">
          <CardHeader>
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-muted text-accent-foreground">
              <Lock className="h-4.5 w-4.5" />
            </div>
            <CardTitle className="font-display text-2xl">Join a room</CardTitle>
            <CardDescription>
              Enter a Room ID to hop in and start collaborating.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Room ID */}
            <div className="space-y-2">
              <Label htmlFor="roomId" className="text-[13px]">Room ID</Label>
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
                className={`h-11 rounded-xl ${shakeRoomId ? "animate-shake" : ""}`}
              />
            </div>

            {/* Password field */}
            {requiresPassword && (
              <div className="animate-fade-up space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 text-[13px]">
                  <Lock className="h-3.5 w-3.5" />
                  Room password
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
                  className={`h-11 rounded-xl ${
                    shakePassword ? "animate-shake border-destructive" : ""
                  }`}
                />
                <p className="text-xs text-muted-foreground">
                  This is a private room — the host&apos;s password is required.
                </p>
              </div>
            )}

            {error && (
              <p className="animate-fade-up text-xs font-medium text-destructive">{error}</p>
            )}

            <div className="flex gap-3 rounded-xl bg-secondary/70 p-4">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Paste a full room link and we&apos;ll extract the Room ID for
                you automatically.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-2.5">
            <Button
              onClick={handleJoin}
              disabled={loading || !roomId.trim()}
              className="h-11 w-full rounded-full"
            >
              {loading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              {requiresPassword ? "Verify & join" : "Join room"}
            </Button>

            <Button
              variant="ghost"
              className="w-full rounded-full hover:cursor-pointer"
              onClick={() => router.push("/rooms")}
            >
              Browse active rooms instead
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
