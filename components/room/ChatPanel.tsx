"use client";

import { Message } from "@/types/message";
import { Card } from "@/components/ui/card";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

interface ChatPanelProps {
  messages: Message[];
  currentUserId: string;
  onSendMessage: (message: string) => void;
  onSelectMessage?: (message: Message) => void;
  isConnected?: boolean;
}

export default function ChatPanel({
  messages,
  currentUserId,
  onSendMessage,
  onSelectMessage,
  isConnected = true,
}: ChatPanelProps) {
  return (
    <Card className="flex flex-col h-full border-l-0 md:border-l rounded-none overflow-hidden">
      {/* Compact Header - matching TextEditor style */}
      <div className="px-3 py-2 sm:px-4 sm:py-2.5 border-b bg-muted/30 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-xs sm:text-sm">Chat</h3>
            <span className="text-[10px] xs:text-xs text-muted-foreground">
              {messages.length} {messages.length === 1 ? "msg" : "msgs"}
            </span>
          </div>
          <Badge
            variant={isConnected ? "default" : "destructive"}
            className="gap-1 text-[9px] sm:text-[10px] h-5 px-1.5"
          >
            {isConnected ? (
              <>
                <Wifi className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="inline">Offline</span>
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Message List - flex-1 with overflow-hidden to enable scrolling */}
      {/* Message List - flex-1 with relative positioning for absolute child */}
      <div className="flex-1 min-h-0 relative overflow-hidden bg-background">
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          onSelectMessage={onSelectMessage}
        />
      </div>

      {/* Message Input - shrink-0 to prevent compression */}
      <div className="shrink-0">
        <MessageInput onSend={onSendMessage} disabled={!isConnected} />
      </div>
    </Card>
  );
}
