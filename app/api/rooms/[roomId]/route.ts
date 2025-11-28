import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import RoomModel from "@/models/Room";
import MessageModel from "@/models/Message";
import { verifyPassword } from "@/lib/encryption";
import { DeleteRoomInput } from "@/types/room";

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
        { success: false, error: "Room not found" },
        { status: 404 }
      );
    }

    // Check if room has expired or is inactive
    if (
      !room.isActive ||
      (room.expiresAt && new Date(room.expiresAt) < new Date())
    ) {
      await RoomModel.updateOne({ roomId }, { isActive: false });

      return NextResponse.json(
        { success: false, error: "Room has expired or been deleted" },
        { status: 410 }
      );
    }

    // Don't send password hash to client
    const { passwordHash, ...roomWithoutPassword } = room;

    // If private room, indicate it requires password
    if (room.isPrivate) {
      return NextResponse.json({
        success: true,
        room: roomWithoutPassword,
        requiresPassword: true,
      });
    }

    // Update last activity
    await RoomModel.updateOne({ roomId }, { lastActivity: new Date() });

    return NextResponse.json({
      success: true,
      room: roomWithoutPassword,
    });
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch room" },
      { status: 500 }
    );
  }
}

// DELETE room (requires password for ALL rooms)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await connectDB();

    const { roomId } = await params;
    const body: DeleteRoomInput = await request.json();

    const room = await RoomModel.findOne({ roomId });

    if (!room) {
      return NextResponse.json(
        { success: false, error: "Room not found" },
        { status: 404 }
      );
    }

    // All rooms require password to delete
    if (!body.password) {
      return NextResponse.json(
        { success: false, error: "Password required to delete this room" },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(body.password, room.passwordHash!);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Incorrect password" },
        { status: 403 }
      );
    }

    // Use cleanup service for proper deletion
    const { CleanupService } = await import("@/lib/cleanup-service");

    const notifyCallback = async (roomId: string) => {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/socket/room-deleted`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId }),
          }
        );
      } catch (error) {
        console.error("Error notifying socket server:", error);
      }
    };

    const result = await CleanupService.deleteRoom(roomId, notifyCallback);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to delete room" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete room" },
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
        lastActivity: new Date(),
      },
      { new: true }
    );

    if (!room) {
      return NextResponse.json(
        { success: false, error: "Room not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      room,
    });
  } catch (error) {
    console.error("Error updating room:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update room" },
      { status: 500 }
    );
  }
}
