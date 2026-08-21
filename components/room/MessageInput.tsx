"use client";

import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function MessageInput({
  onSend,
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSend(trimmedMessage);
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-background p-2 sm:p-3">
      <div className="flex items-end gap-2 rounded-2xl border bg-muted/40 p-1.5 pl-3 transition-colors focus-within:border-ring/60 focus-within:bg-card">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          disabled={disabled}
          className="max-h-24 min-h-9 flex-1 resize-none border-0 bg-transparent text-xs shadow-none focus-visible:ring-0 sm:text-sm"
          rows={1}
          style={{ overflowWrap: "break-word", wordBreak: "break-word" }}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          size="icon-sm"
          className="shrink-0 rounded-full hover:cursor-pointer"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
      <p className="mt-1.5 hidden text-[10px] text-muted-foreground sm:block">
        Enter to send · Shift+Enter for a new line
      </p>
    </div>
  );
}
