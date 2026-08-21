"use client";

import { useState, type ReactNode } from "react";
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
import { Switch } from "@/components/ui/switch";
import { DESTRUCTION_TIMERS } from "@/lib/constants";

export default function CreateRoomDialog({ children }: { children?: ReactNode }) {
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
    if (!formData.password.trim()) {
      alert("Please set a password. Password is required to delete the room.");
      return;
    }

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
        {children ? (
          children
        ) : (
          <Button size="lg" className="group h-11 rounded-full px-6 hover:cursor-pointer">
            <Plus className="transition-transform duration-300 group-hover:rotate-90" />
            <span className="sm:hidden">New room</span>
            <span className="hidden sm:inline">Create new room</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Create a new room</DialogTitle>
          <DialogDescription>
            Configure your temporary sharing space.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          {/* Room Name */}
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-[13px]">
              Custom room name{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., project-delta-review"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setRoomNameError("");
              }}
              className={`rounded-xl ${
                shakeInput ? "animate-shake" : ""
              } ${roomNameError ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
            />
            {roomNameError ? (
              <p className="text-xs font-medium text-destructive">{roomNameError}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Leave empty for an auto-generated name
              </p>
            )}
          </div>

          {/* Password */}
          <div className="grid gap-2">
            <Label htmlFor="password" className="flex items-center gap-1.5 text-[13px]">
              <Lock className="h-3.5 w-3.5" />
              Room password <span className="text-destructive">*</span>
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
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              Required to delete this room later. Keep it safe.
            </p>
          </div>

          {/* Private Room */}
          <div className="flex items-center justify-between gap-4 rounded-xl border bg-muted/40 p-4">
            <div className="flex-1">
              <Label htmlFor="isPrivate" className="text-[13px] font-medium">
                Private room
              </Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formData.isPrivate
                  ? "A password will be required to join"
                  : "Anyone with the link can join"}
              </p>
            </div>
            <Switch
              id="isPrivate"
              checked={formData.isPrivate}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isPrivate: checked })
              }
            />
          </div>

          {/* Destruction Timer */}
          <div className="grid gap-2">
            <Label htmlFor="timer" className="text-[13px]">
              Destruction timer
            </Label>
            <Select
              value={formData.destructionTimer}
              onValueChange={(value) =>
                setFormData({ ...formData, destructionTimer: value })
              }
            >
              <SelectTrigger id="timer" className="w-full rounded-xl">
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
          <div className="flex items-center justify-between gap-4 rounded-xl border bg-muted/40 p-4">
            <div className="flex-1">
              <Label htmlFor="autoDelete" className="text-[13px] font-medium">
                Automatic deletion
              </Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Delete after 24 hours of inactivity
              </p>
            </div>
            <Switch
              id="autoDelete"
              checked={formData.autoDelete}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, autoDelete: checked })
              }
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" className="rounded-full hover:cursor-pointer" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={loading || !formData.password.trim()}
            className="rounded-full hover:cursor-pointer"
          >
            {loading && <Loader2 className="animate-spin" />}
            Create room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
