"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DESTRUCTION_TIMERS } from "@/lib/constants";

export default function CreateRoomDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roomNameError, setRoomNameError] = useState("");
  const [shakeInput, setShakeInput] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    destructionTimer: "none",
    autoDelete: true,
    isPrivate: false,
    password: "",
  });

  const handleCreate = async () => {
    // Validate password
    if (!formData.password.trim()) {
      alert("Please set a password. Password is required to delete the room.");
      return;
    }

    // Clear previous errors
    setRoomNameError("");
    setLoading(true);

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name || undefined,
          destructionTimer:
            formData.destructionTimer !== "none"
              ? parseInt(formData.destructionTimer)
              : undefined,
          autoDelete: formData.autoDelete,
          isPrivate: formData.isPrivate,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success && data.room) {
        setOpen(false);
        router.push(`/room/${data.room.roomId}`);
      } else {
        // Check if it's a room name conflict error
        if (response.status === 409 && formData.name) {
          setRoomNameError(data.error || "Room with this name already exists");
          setShakeInput(true);
          setTimeout(() => setShakeInput(false), 500);
        } else {
          alert(data.error || "Failed to create room");
        }
      }
    } catch (error) {
      alert("Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Create New Room
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create a New Room</DialogTitle>
          <DialogDescription>
            Configure your temporary sharing space.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Room Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Custom Room Name (Optional)</Label>
            <Input
              id="name"
              placeholder="e.g., project-delta-review"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setRoomNameError(""); // Clear error on change
              }}
              className={`${shakeInput ? "animate-shake" : ""} ${
                roomNameError ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
            />
            {roomNameError && (
              <p className="text-sm text-red-500 font-medium">
                {roomNameError}
              </p>
            )}
            {!roomNameError && (
              <p className="text-sm text-muted-foreground">
                Leave empty for auto-generated name
              </p>
            )}
          </div>

          {/* Password - Required for ALL rooms */}
          <div className="grid gap-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Room Password *
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter a secure password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
            <p className="text-sm text-muted-foreground">
              Required to delete this room. Keep it safe!
            </p>
          </div>

          {/* Private Room Toggle */}
          <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/50">
            <input
              type="checkbox"
              id="isPrivate"
              checked={formData.isPrivate}
              onChange={(e) =>
                setFormData({ ...formData, isPrivate: e.target.checked })
              }
              className="h-4 w-4"
            />
            <div className="flex-1">
              <Label
                htmlFor="isPrivate"
                className="cursor-pointer font-medium flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                Private Room
              </Label>
              <p className="text-sm text-muted-foreground">
                {formData.isPrivate
                  ? "Others will need the password to join this room"
                  : "Anyone with the room ID can join (no password needed)"}
              </p>
            </div>
          </div>

          {/* Destruction Timer */}
          <div className="grid gap-2">
            <Label htmlFor="timer">Destruction Timer</Label>
            <Select
              value={formData.destructionTimer}
              onValueChange={(value) =>
                setFormData({ ...formData, destructionTimer: value })
              }
            >
              <SelectTrigger id="timer">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No timer</SelectItem>
                {DESTRUCTION_TIMERS.map((timer) => (
                  <SelectItem key={timer.value} value={timer.value.toString()}>
                    {timer.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Auto Delete */}
          <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/50">
            <input
              type="checkbox"
              id="autoDelete"
              checked={formData.autoDelete}
              onChange={(e) =>
                setFormData({ ...formData, autoDelete: e.target.checked })
              }
              className="h-4 w-4"
            />
            <div className="flex-1">
              <Label
                htmlFor="autoDelete"
                className="cursor-pointer font-medium"
              >
                Automatic Deletion
              </Label>
              <p className="text-sm text-muted-foreground">
                Delete room after 24 hours of inactivity
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
