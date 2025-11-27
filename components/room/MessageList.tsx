'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/types/message';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export default function MessageList({ messages, currentUserId }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      <div className="space-y-4">
        {messages.map((message) => {
          const isSystem = message.type === 'system';
          const isOwn = message.userId === currentUserId;

          if (isSystem) {
            return (
              <div
                key={message._id}
                className="text-center text-sm text-muted-foreground py-2"
              >
                {message.message}
              </div>
            );
          }

          return (
            <div
              key={message._id}
              className={cn(
                'flex gap-3',
                isOwn && 'flex-row-reverse'
              )}
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className={cn(
                  'text-xs',
                  isOwn && 'bg-primary text-primary-foreground'
                )}>
                  {getInitials(message.username)}
                </AvatarFallback>
              </Avatar>

              <div className={cn(
                'flex-1 space-y-1',
                isOwn && 'items-end'
              )}>
                <div className={cn(
                  'flex items-baseline gap-2 text-xs',
                  isOwn && 'flex-row-reverse'
                )}>
                  <span className="font-medium">{message.username}</span>
                  <span className="text-muted-foreground">
                    {format(new Date(message.timestamp), 'HH:mm')}
                  </span>
                </div>
                <div
                  className={cn(
                    'inline-block px-3 py-2 rounded-lg max-w-[80%] break-words',
                    isOwn
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  {message.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}