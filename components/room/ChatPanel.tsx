"use client";

import { Message } from "@/types/message";
import { Card } from "@/components/ui/card";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

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
      <div className="shrink-0 border-b bg-muted/40 px-3 py-2 sm:px-4 sm:py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-[11px] font-semibold tracking-wide uppercase">
              Chat
            </h3>
            <span className="font-mono text-[10px] text-muted-foreground">
              {messages.length} {messages.length === 1 ? "msg" : "msgs"}
            </span>
          </div>
          <span
            className={`inline-flex h-5 items-center gap-1.5 rounded-full border px-2 text-[10px] font-medium ${
              isConnected
                ? "border-brand/30 bg-brand-muted text-accent-foreground"
                : "border-destructive/30 bg-destructive/10 text-destructive"
            }`}
          >
            <span
              className={`relative flex h-1.5 w-1.5 ${
                isConnected ? "" : ""
              }`}
            >
              {isConnected && (
                <span className="absolute inline-flex h-full w-full animate-ping-slow rounded-full bg-brand" />
              )}
              <span
                className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                  isConnected ? "bg-brand" : "bg-destructive"
                }`}
              />
            </span>
            {isConnected ? "Online" : "Offline"}
          </span>
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
