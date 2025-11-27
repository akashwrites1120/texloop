"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Users, AlertCircle, Lock } from "lucide-react";
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
import CopyButton from "@/components/shared/CopyButton";
import { Badge } from "@/components/ui/badge";

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

  const handleDelete = async () => {
    // All rooms require password to delete
    if (!deletePassword.trim()) {
      setDeleteError("Password is required to delete this room");
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
        setDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      setDeleteError("Failed to delete room");
      setDeleting(false);
    }
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Room Info */}
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{room.roomId}</h1>
                {room.isPrivate && (
                  <Badge variant="secondary" className="gap-1">
                    <Lock className="h-3 w-3" />
                    Private
                  </Badge>
                )}
                {room.expiresAt && <Timer expiresAt={room.expiresAt} />}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {room.participants.length} participant
                  {room.participants.length !== 1 ? "s" : ""}
                </p>
                {room.autoDelete && (
                  <Badge variant="outline" className="text-xs">
                    Auto-delete enabled
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <CopyButton
              text={`${process.env.NEXT_PUBLIC_APP_URL}/room/${room.roomId}`}
              label="Copy Link"
            />

            <AlertDialog
              open={showDeleteDialog}
              onOpenChange={setShowDeleteDialog}
            >
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Destroy Room
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    Destroy Room?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the room and all its messages. All participants will be
                    disconnected.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                {/* Password required for ALL rooms */}
                <div className="space-y-2 py-4">
                  <Label
                    htmlFor="deletePassword"
                    className="flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
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
                  />
                  {deleteError && (
                    <p className="text-sm text-destructive">{deleteError}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Password is required to delete this room
                  </p>
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => {
                      setDeletePassword("");
                      setDeleteError("");
                    }}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete();
                    }}
                    disabled={deleting || !deletePassword.trim()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
