import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RoomModel from '@/models/Room';
import MessageModel from '@/models/Message';
import { INACTIVITY_THRESHOLD_HOURS } from '@/lib/constants';

// POST cleanup expired and inactive rooms
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const now = new Date();
    const inactivityThreshold = new Date(
      now.getTime() - INACTIVITY_THRESHOLD_HOURS * 60 * 60 * 1000
    );

    // Find rooms to delete
    const roomsToDelete = await RoomModel.find({
      $or: [
        // Expired rooms with timer
        {
          expiresAt: { $ne: null, $lt: now },
        },
        // Inactive rooms with auto-delete enabled
        {
          autoDelete: true,
          lastActivity: { $lt: inactivityThreshold },
        },
      ],
    }).lean();

    const roomIds = roomsToDelete.map(room => room.roomId);

    if (roomIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No rooms to cleanup',
        deletedCount: 0,
      });
    }

    // Delete rooms
    const roomsDeleted = await RoomModel.deleteMany({
      roomId: { $in: roomIds },
    });

    // Delete associated messages
    const messagesDeleted = await MessageModel.deleteMany({
      roomId: { $in: roomIds },
    });

    console.log(`🗑️ Cleanup completed:
      - Rooms deleted: ${roomsDeleted.deletedCount}
      - Messages deleted: ${messagesDeleted.deletedCount}
    `);

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed successfully',
      deletedCount: roomsDeleted.deletedCount,
      messagesDeleted: messagesDeleted.deletedCount,
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    return NextResponse.json(
      { success: false, error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}

// GET cleanup status (for debugging)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const now = new Date();
    const inactivityThreshold = new Date(
      now.getTime() - INACTIVITY_THRESHOLD_HOURS * 60 * 60 * 1000
    );

    const expiredRooms = await RoomModel.countDocuments({
      expiresAt: { $ne: null, $lt: now },
    });

    const inactiveRooms = await RoomModel.countDocuments({
      autoDelete: true,
      lastActivity: { $lt: inactivityThreshold },
    });

    return NextResponse.json({
      success: true,
      expiredRooms,
      inactiveRooms,
      totalToCleanup: expiredRooms + inactiveRooms,
    });
  } catch (error) {
    console.error('Error checking cleanup status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check status' },
      { status: 500 }
    );
  }
}