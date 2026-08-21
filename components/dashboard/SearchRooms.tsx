'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchRoomsProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchRooms({ value, onChange }: SearchRoomsProps) {
  return (
    <div className="group relative">
      <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand" />
      <Input
        type="text"
        placeholder="Search rooms by ID…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-full bg-card pr-4 pl-11 shadow-sm transition-shadow focus-visible:ring-brand/30"
      />
    </div>
  );
}
