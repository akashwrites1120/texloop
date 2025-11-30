"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Users,
  AlertCircle,
  Lock,
  Copy,
  Check,
  LogOut,
} from "lucide-react";
import { Room } from "@/types/room";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Timer from "@/components/shared/Timer";
import { Badge } from "@/components/ui/badge";
import { copyToClipboard } from "@/lib/utils";

interface RoomHeaderProps {
  room: Room;
  roomPassword?: string;
}

export default function RoomHeader({ room, roomPassword }: RoomHeaderProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shakePassword, setShakePassword] = useState(false);

  const triggerShake = () => {
    setShakePassword(true);
    setTimeout(() => setShakePassword(false), 500);
  };

  const handleDelete = async () => {
    if (!deletePassword.trim()) {
      setDeleteError("Password is required to delete this room");
      triggerShake();
      return;
    }

    setDeleting(true);
    setDeleteError("");

    try {
      const response = await fetch(`/api/rooms/${room.roomId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: deletePassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push("/rooms");
      } else {
        setDeleteError(data.error || "Failed to delete room");
        triggerShake();
        setDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      setDeleteError("Failed to delete room");
      triggerShake();
      setDeleting(false);
    }
  };

  const handleCopy = async () => {
    try {
      await copyToClipboard(
        `${process.env.NEXT_PUBLIC_APP_URL}/room/${room.roomId}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur shrink-0">
      <div className="px-3 sm:px-4 md:px-6">
        <div className="flex items-center justify-between py-2 sm:py-3 md:py-4 gap-2 sm:gap-4">
          {/* Room Info */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg md:text-xl font-bold truncate">
                  {room.roomId}
                </h1>
                {room.isPrivate && (
                  <Badge
                    variant="secondary"
                    className="gap-1 text-[10px] sm:text-xs shrink-0"
                  >
                    <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span className="hidden xs:inline">Private</span>
                  </Badge>
                )}
                {room.expiresAt && (
                  <Timer expiresAt={room.expiresAt} className="shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 sm:gap-3 mt-0.5 sm:mt-1 flex-wrap">
                <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <span className="hidden xs:inline">
                    {room.participants.length} participant
                    {room.participants.length !== 1 ? "s" : ""}
                  </span>
                  <span className="xs:hidden">{room.participants.length}</span>
                </p>
                {room.autoDelete && (
                  <Badge
                    variant="outline"
                    className="text-[9px] xs:text-[10px] sm:text-xs shrink-0"
                  >
                    <span className="hidden sm:inline">Auto-delete</span>
                    <span className="sm:hidden">Auto</span>
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Copy Button - Icon only on mobile */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-8 sm:h-9 gap-1.5 sm:gap-2 px-2 sm:px-3 hover:cursor-pointer"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
              <span className="hidden sm:inline text-xs sm:text-sm">
                {copied ? "Copied!" : "Copy Link"}
              </span>
            </Button>

            {/* Exit Room Button - Icon only on mobile */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/rooms")}
              className="h-8 sm:h-9 gap-1.5 sm:gap-2 px-2 sm:px-3 hover:cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline text-xs sm:text-sm">
                Exit Room
              </span>
            </Button>

            {/* Delete Button - Icon only on smallest screens */}
            <AlertDialog
              open={showDeleteDialog}
              onOpenChange={setShowDeleteDialog}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 sm:h-9 gap-1.5 sm:gap-2 px-2 sm:px-3 hover:cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline text-xs sm:text-sm">
                    Destroy
                  </span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive shrink-0" />
                    <span>Destroy Room?</span>
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-xs sm:text-sm">
                    This action cannot be undone. This will permanently delete
                    the room and all its messages. All participants will be
                    disconnected.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                {/* Password required for ALL rooms */}
                <div className="space-y-2 py-3 sm:py-4">
                  <Label
                    htmlFor="deletePassword"
                    className="flex items-center gap-2 text-sm"
                  >
                    <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Room Password
                  </Label>
                  <Input
                    id="deletePassword"
                    type="password"
                    placeholder="Enter room password to confirm"
                    value={deletePassword}
                    onChange={(e) => {
                      setDeletePassword(e.target.value);
                      setDeleteError("");
                    }}
                    disabled={deleting}
                    className={`h-10 sm:h-11 text-sm sm:text-base ${
                      shakePassword ? "animate-shake border-destructive" : ""
                    }`}
                  />
                  {deleteError && (
                    <p className="text-xs sm:text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      {deleteError}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Password is required to delete this room
                  </p>
                </div>

                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel
                    onClick={() => {
                      setDeletePassword("");
                      setDeleteError("");
                    }}
                    className="w-full sm:w-auto m-0 hover:cursor-pointer"
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete();
                    }}
                    disabled={deleting || !deletePassword.trim()}
                    className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:cursor-pointer"
                  >
                    {deleting ? "Destroying..." : "Destroy Room"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
