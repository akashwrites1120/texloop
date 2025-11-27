import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RoomModel from '@/models/Room';
import { verifyPassword } from '@/lib/encryption';

// POST verify room password
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await connectDB();
    
    const { roomId } = await params;
    const { password } = await request.json();

    const room = await RoomModel.findOne({ roomId, isActive: true });

    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      );
    }

    if (!room.isPrivate) {
      return NextResponse.json({
        success: true,
        message: 'Room is public, no password required',
      });
    }

    if (!room.passwordHash) {
      return NextResponse.json(
        { success: false, error: 'Room has no password set' },
        { status: 400 }
      );
    }

    const isValid = await verifyPassword(password, room.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password verified',
    });
  } catch (error) {
    console.error('Error verifying password:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify password' },
      { status: 500 }
    );
  }
}