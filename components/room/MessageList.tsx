"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/types/message";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onSelectMessage?: (message: Message) => void;
}

export default function MessageList({
  messages,
  currentUserId,
  onSelectMessage,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getInitials = (username: string) => {
    return username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isMessageLong = (text: string) => {
    return text.split("\n").length > 4 || text.length > 200;
  };

  if (messages.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <p className="text-sm text-muted-foreground text-center">
          No messages yet. Start the conversation!
        </p>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 p-3 sm:p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/50"
      ref={scrollRef}
      style={{ overscrollBehavior: "contain" }}
    >
      <div className="space-y-3 sm:space-y-4">
        {messages.map((message) => {
          const isSystem = message.type === "system";
          const isOwn = message.userId === currentUserId;

          if (isSystem) {
            return (
              <div key={message._id} className="flex justify-center py-1">
                <div className="bg-muted/50 px-3 py-1 rounded-full">
                  <p className="text-[10px] xs:text-xs text-muted-foreground text-center">
                    {message.message}
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div
              key={message._id}
              className={cn(
                "flex gap-2 items-end",
                isOwn ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* Avatar */}
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
                <AvatarFallback
                  className={cn(
                    "text-[10px] xs:text-xs",
                    isOwn && "bg-primary text-primary-foreground"
                  )}
                >
                  {getInitials(message.username)}
                </AvatarFallback>
              </Avatar>

              {/* Message Bubble */}
              <div
                className={cn(
                  "flex flex-col max-w-[75%] sm:max-w-[70%]",
                  isOwn ? "items-end" : "items-start"
                )}
              >
                {/* Username - only show for others' messages */}
                {!isOwn && (
                  <span className="text-[10px] xs:text-xs font-medium text-muted-foreground mb-0.5 px-1">
                    {message.username}
                  </span>
                )}

                {/* Message Content */}
                <div
                  className={cn(
                    "px-3 py-2 sm:px-3 sm:py-2 rounded-2xl cursor-pointer transition-all hover:opacity-90 active:scale-[0.98] break-words",
                    isOwn
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  )}
                  onClick={() => onSelectMessage && onSelectMessage(message)}
                >
                  <p
                    className={cn(
                      "text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed",
                      isMessageLong(message.message) && "line-clamp-4"
                    )}
                  >
                    {message.message}
                  </p>

                  {/* Show More Button */}
                  {isMessageLong(message.message) && (
                    <button
                      className={cn(
                        "text-[10px] xs:text-xs mt-1 font-medium hover:underline",
                        isOwn
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      )}
                    >
                      Show more
                    </button>
                  )}

                  {/* Timestamp */}
                  <p
                    className={cn(
                      "text-[9px] xs:text-[10px] mt-1 text-right",
                      isOwn
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground/70"
                    )}
                  >
                    {format(new Date(message.timestamp), "HH:mm")}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
