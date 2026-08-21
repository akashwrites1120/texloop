'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TimerProps {
  expiresAt: Date | null;
  className?: string;
}

export default function Timer({ expiresAt, className }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      setIsUrgent(diff < 5 * 60 * 1000);

      if (diff <= 0) {
        setTimeLeft('expired');
        setIsExpired(true);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const pad = (n: number) => n.toString().padStart(2, '0');

      if (hours > 0) {
        setTimeLeft(`${hours}:${pad(minutes)}:${pad(seconds)}`);
      } else {
        setTimeLeft(`${minutes}:${pad(seconds)}`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt || isExpired) {
    return null;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[11px] font-medium tabular-nums',
        isUrgent
          ? 'border-warning/40 bg-warning/10 text-warning'
          : 'bg-secondary text-secondary-foreground',
        className
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          isUrgent ? 'animate-pulse bg-warning' : 'bg-brand'
        )}
      />
      {timeLeft}
    </span>
  );
}
