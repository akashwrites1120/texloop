'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TimerProps {
  expiresAt: Date | null;
  className?: string;
}

export default function Timer({ expiresAt, className }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!expiresAt) {
      setTimeLeft('No expiration');
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt) {
    return null;
  }

  const isExpired = timeLeft === 'Expired';
  const isUrgent = expiresAt && new Date(expiresAt).getTime() - new Date().getTime() < 5 * 60 * 1000; // Less than 5 minutes

  return (
    <Badge
      variant={isExpired ? 'destructive' : isUrgent ? 'default' : 'secondary'}
      className={className}
    >
      <Clock className="h-3 w-3 mr-1" />
      {timeLeft}
    </Badge>
  );
}