"use client";

import Link from "next/link";
import { Users, Lock, Clock, Trash2, ArrowRight } from "lucide-react";
import { Room } from "@/types/room";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Timer from "@/components/shared/Timer";
import { formatDistanceToNow } from "date-fns";

interface RoomCardProps {
  room: Room;
}

export default function RoomCard({ room }: RoomCardProps) {
  const createdAgo = formatDistanceToNow(new Date(room.createdAt), {
    addSuffix: true,
  });

  return (
    <Card
      className="
        relative overflow-hidden rounded-xl border 
        bg-gradient-to-br from-muted/30 via-background to-background
        transition-all duration-300 
        hover:shadow-lg hover:-translate-y-[2px]
      "
    >
      <CardHeader className="pb-4 space-y-2 px-5 pt-5">
        <div className="flex items-start justify-between gap-4">
          {/* Room Title */}
          <div className="flex-1 space-y-2 min-w-0">
            <h3 className="text-lg font-semibold tracking-tight truncate">
              {room.roomId}
            </h3>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {room.isPrivate && (
                <Badge variant="secondary" className="gap-1.5 text-xs py-0.5">
                  <Lock className="h-3 w-3" />
                  Private
                </Badge>
              )}

              {room.autoDelete && (
                <Badge variant="outline" className="gap-1.5 text-xs py-0.5">
                  <Trash2 className="h-3 w-3" />
                  Auto-delete
                </Badge>
              )}
            </div>
          </div>

          {/* Timer */}
          {room.expiresAt && (
            <div className="shrink-0">
              <Timer expiresAt={room.expiresAt} />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 space-y-4">
        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="font-medium">{room.participants.length}</span>
            <span className="text-xs opacity-70">
              {room.participants.length === 1 ? "participant" : "participants"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-xs">{createdAgo}</span>
          </div>
        </div>

        {/* Join Button */}
        <Link href={`/room/${room.roomId}`} className="block">
          <Button
            size="lg"
            className="
              w-full font-medium group
              transition-all duration-200
              hover:scale-[1.01] hover:shadow-md hover:cursor-pointer active:scale-[1]
            "
          >
            Join Room
            <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
