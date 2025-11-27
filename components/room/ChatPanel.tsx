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
  isConnected?: boolean;
}

export default function ChatPanel({
  messages,
  currentUserId,
  onSendMessage,
  isConnected = true,
}: ChatPanelProps) {
  return (
    <Card className="flex flex-col h-full border-l-0 md:border-l rounded-none">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">Chat</h3>
            <p className="text-xs text-muted-foreground">
              {messages.length} {messages.length === 1 ? "message" : "messages"}
            </p>
          </div>
          <Badge
            variant={isConnected ? "default" : "destructive"}
            className="gap-1 text-xs"
          >
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3" />
                <span className="hidden sm:inline">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                <span className="hidden sm:inline">Offline</span>
              </>
            )}
          </Badge>
        </div>
      </div>

      <MessageList messages={messages} currentUserId={currentUserId} />

      <MessageInput onSend={onSendMessage} disabled={!isConnected} />
    </Card>
  );
}
