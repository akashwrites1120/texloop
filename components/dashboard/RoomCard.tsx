"use client";

import Link from "next/link";
import { Users, Lock, ArrowRight } from "lucide-react";
import { Room } from "@/types/room";
import Timer from "@/components/shared/Timer";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface RoomCardProps {
  room: Room;
  index?: number;
}

export default function RoomCard({ room, index = 0 }: RoomCardProps) {
  const createdAgo = formatDistanceToNow(new Date(room.createdAt), {
    addSuffix: true,
  });

  return (
    <Link
      href={`/room/${room.roomId}`}
      className={cn(
        "group ring-hairline relative flex animate-fade-up flex-col rounded-2xl bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        "[animation-delay:calc(var(--stagger)*70ms)]"
      )}
      style={{ "--stagger": index } as React.CSSProperties}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary font-mono text-xs font-semibold text-secondary-foreground transition-colors duration-300 group-hover:bg-brand-muted group-hover:text-accent-foreground">
          {room.roomId.slice(0, 2).toUpperCase()}
        </div>
        {room.expiresAt && (
          <div className="shrink-0">
            <Timer expiresAt={room.expiresAt} />
          </div>
        )}
      </div>

      {/* Title + badges */}
      <div className="mt-4 min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-semibold tracking-tight">
          {room.roomId}
        </h3>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {room.isPrivate && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground">
              <Lock className="h-3 w-3" />
              Private
            </span>
          )}
          {room.autoDelete && (
            <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              Auto-delete
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {room.participants.length}{" "}
          {room.participants.length === 1 ? "person" : "people"} ·{" "}
          {createdAgo}
        </span>
        <span className="flex items-center gap-1 font-medium text-foreground transition-all duration-300 group-hover:gap-2 group-hover:text-brand">
          Join
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
