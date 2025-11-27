"use client";

import Link from "next/link";
import { Users, Lock } from "lucide-react";
import { Room } from "@/types/room";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
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
  const isExpired = room.expiresAt && new Date(room.expiresAt) < new Date();

  return (
    <Card
      className={`hover:shadow-lg transition-shadow ${isExpired ? "opacity-50" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg truncate">{room.roomId}</h3>
              {room.isPrivate && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Lock className="h-3 w-3" />
                  Private
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Created {createdAgo}
            </p>
          </div>
          {room.expiresAt && <Timer expiresAt={room.expiresAt} />}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{room.participants.length} active</span>
          </div>
          {room.autoDelete && (
            <Badge variant="outline" className="text-xs">
              Auto-delete
            </Badge>
          )}
        </div>

        {room.textContent && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {room.textContent}
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <Link href={`/room/${room.roomId}`} className="flex-1">
          <Button className="w-full" disabled={isExpired}>
            {isExpired ? "Expired" : "Join Room"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
