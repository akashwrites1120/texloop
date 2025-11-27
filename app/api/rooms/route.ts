import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RoomModel from '@/models/room';
import { generateRoomId } from '@/lib/utils';
import { CreateRoomInput } from '@/types/room';

// GET all active rooms
export async function GET() {
  try {
    await connectDB();

    const rooms = await RoomModel.find({
      isActive: true,
      $or: [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      success: true,
      rooms,
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

// POST create new room
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body: CreateRoomInput = await request.json();
    const { name, destructionTimer, autoDelete } = body;

    // Generate unique room ID
    let roomId = name || generateRoomId();
    let exists = await RoomModel.findOne({ roomId });
    
    // If custom name exists, append random number
    while (exists) {
      roomId = `${roomId}-${Math.floor(Math.random() * 1000)}`;
      exists = await RoomModel.findOne({ roomId });
    }

    // Calculate expiration date if timer is set
    let expiresAt = null;
    if (destructionTimer) {
      expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + destructionTimer);
    }

    const room = await RoomModel.create({
      roomId,
      name: name || null,
      createdBy: 'Guest',
      createdAt: new Date(),
      expiresAt,
      lastActivity: new Date(),
      isActive: true,
      destructionTimer,
      autoDelete,
      participants: [],
      textContent: '',
    });

    return NextResponse.json({
      success: true,
      room,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create room' },
      { status: 500 }
    );
  }
}