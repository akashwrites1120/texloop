"use client";

import { useEffect, useRef, useState } from "react";
import { Message } from "@/types/message";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { MessagesSquare } from "lucide-react";

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
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

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
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <MessagesSquare className="h-4.5 w-4.5 text-muted-foreground" />
          </div>
          <p className="max-w-[200px] text-xs leading-relaxed text-muted-foreground">
            No messages yet. Say hello — or click any message to load it into
            the editor.
          </p>
        </div>
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
          const isLong = isMessageLong(message.message);
          const isExpanded = expandedIds.has(message._id);

          if (isSystem) {
            return (
              <div
                key={message._id}
                className="flex animate-pop-in justify-center py-1"
              >
                <div className="rounded-full border bg-muted/60 px-3 py-1">
                  <p className="font-mono text-[10px] text-muted-foreground text-center xs:text-xs">
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
                "animate-pop-in flex items-end gap-2",
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
                    "cursor-pointer break-words px-3 py-2 transition-all duration-150 hover:opacity-90 active:scale-[0.98]",
                    isOwn
                      ? "rounded-2xl rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-2xl rounded-bl-sm border bg-card"
                  )}
                  onClick={() => onSelectMessage && onSelectMessage(message)}
                >
                  <p
                    className={cn(
                      "text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed",
                      isLong && !isExpanded && "line-clamp-4"
                    )}
                  >
                    {message.message}
                  </p>

                  {/* Show More Button */}
                  {isLong && (
                    <button
                      className={cn(
                        "text-[10px] xs:text-xs mt-1 font-medium hover:underline",
                        isOwn
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(message._id);
                      }}
                    >
                      {isExpanded ? "Show less" : "Show more"}
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
