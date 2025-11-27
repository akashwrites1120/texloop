'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/shared/Navbar';

export default function JoinPage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!roomId.trim()) {
      setError('Please enter a room ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Verify room exists
      const response = await fetch(`/api/rooms/${roomId}`);
      const data = await response.json();

      if (data.success && data.room) {
        router.push(`/room/${roomId}`);
      } else {
        setError('Room not found or has expired');
      }
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoin();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Join Room</CardTitle>
            <CardDescription>
              Enter a Room ID to join and start collaborating.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roomId">Room ID</Label>
              <Input
                id="roomId"
                type="text"
                placeholder="e.g., clever-cat-123"
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value);
                  setError('');
                }}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            <div className="p-4 bg-muted rounded-lg text-sm">
              <p className="font-medium mb-1">💡 Tip</p>
              <p className="text-muted-foreground">
                You can also paste a full room link here. We'll extract the Room ID automatically.
              </p>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              onClick={handleJoin}
              disabled={loading || !roomId.trim()}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Join Room
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}