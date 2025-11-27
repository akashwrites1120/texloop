'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ParticipantsListProps {
  participants: string[];
  currentUserId: string;
}

export default function ParticipantsList({ participants, currentUserId }: ParticipantsListProps) {
  const getInitials = (userId: string) => {
    return userId.slice(0, 2).toUpperCase();
  };

  const displayParticipants = participants.slice(0, 5);
  const remainingCount = participants.length - 5;

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <div className="flex -space-x-2">
          {displayParticipants.map((userId) => {
            const isYou = userId === currentUserId;
            return (
              <Tooltip key={userId}>
                <TooltipTrigger>
                  <Avatar className="border-2 border-background h-8 w-8">
                    <AvatarFallback className={isYou ? 'bg-primary text-primary-foreground' : ''}>
                      {getInitials(userId)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isYou ? 'You' : userId}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
          {remainingCount > 0 && (
            <Avatar className="border-2 border-background h-8 w-8">
              <AvatarFallback className="bg-muted text-xs">
                +{remainingCount}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}