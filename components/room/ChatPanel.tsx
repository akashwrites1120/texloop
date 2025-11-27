'use client';

import { Message } from '@/types/message';
import { Card } from '@/components/ui/card';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Separator } from '@/components/ui/separator';

interface ChatPanelProps {
  messages: Message[];
  currentUserId: string;
  onSendMessage: (message: string) => void;
}

export default function ChatPanel({ messages, currentUserId, onSendMessage }: ChatPanelProps) {
  return (
    <Card className="flex flex-col h-full border-l rounded-none">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Chat</h3>
        <p className="text-sm text-muted-foreground">
          {messages.length} messages
        </p>
      </div>
      
      <MessageList messages={messages} currentUserId={currentUserId} />
      
      <MessageInput onSend={onSendMessage} />
    </Card>
  );
}