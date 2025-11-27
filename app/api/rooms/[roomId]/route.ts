import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RoomModel from '@/models/Room';

// GET specific room by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await connectDB();
    
    const { roomId } = await params;

    const room = await RoomModel.findOne({ roomId }).lean();

    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      );
    }

    // Check if room has expired
    if (room.expiresAt && new Date(room.expiresAt) < new Date()) {
      await RoomModel.updateOne(
        { roomId },
        { isActive: false }
      );

      return NextResponse.json(
        { success: false, error: 'Room has expired' },
        { status: 410 }
      );
    }

    // Update last activity
    await RoomModel.updateOne(
      { roomId },
      { lastActivity: new Date() }
    );

    return NextResponse.json({
      success: true,
      room,
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch room' },
      { status: 500 }
    );
  }
}

// DELETE room
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await connectDB();
    
    const { roomId } = await params;

    const room = await RoomModel.findOne({ roomId });

    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      );
    }

    await RoomModel.updateOne(
      { roomId },
      { isActive: false }
    );

    return NextResponse.json({
      success: true,
      message: 'Room deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete room' },
      { status: 500 }
    );
  }
}

// PATCH update room text content
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await connectDB();
    
    const { roomId } = await params;

    const { textContent } = await request.json();

    const room = await RoomModel.findOneAndUpdate(
      { roomId },
      { 
        textContent,
        lastActivity: new Date()
      },
      { new: true }
    );

    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      room,
    });
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update room' },
      { status: 500 }
    );
  }
}