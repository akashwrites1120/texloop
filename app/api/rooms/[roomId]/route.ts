import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import RoomModel from "@/models/room";
import { verifyPassword } from "@/lib/encryption";
import { DeleteRoomInput } from "@/types/room";
import { MAX_TEXT_LENGTH } from "@/lib/constants";

// GET specific room by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await connectDB();

    const { roomId } = await params;
    const password = request.nextUrl.searchParams.get("password") ?? undefined;

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
    const roomWithoutPassword = { ...room };
    delete (roomWithoutPassword as Record<string, unknown>).passwordHash;

    // Private rooms only expose full data with a valid password
    if (room.isPrivate) {
      const authorized = password
        ? await verifyPassword(password, room.passwordHash ?? "")
        : false;

      if (!authorized) {
        return NextResponse.json({
          success: true,
          requiresPassword: true,
          room: {
            roomId: room.roomId,
            name: room.name,
            isPrivate: true,
            autoDelete: room.autoDelete,
            createdAt: room.createdAt,
            expiresAt: room.expiresAt,
          },
        });
      }
    }

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
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/notify/room-deleted`,
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

// PATCH update room text content (password required)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await connectDB();

    const { roomId } = await params;

    const body = await request.json();
    const { textContent, password } = body;

    if (typeof textContent !== "string" || textContent.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          error: `textContent must be a string of at most ${MAX_TEXT_LENGTH} characters`,
        },
        { status: 400 }
      );
    }

    const room = await RoomModel.findOne({ roomId });

    if (!room) {
      return NextResponse.json(
        { success: false, error: "Room not found" },
        { status: 404 }
      );
    }

    if (typeof password !== "string" || !password) {
      return NextResponse.json(
        { success: false, error: "Password required to update this room" },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, room.passwordHash ?? "");
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Incorrect password" },
        { status: 403 }
      );
    }

    await RoomModel.updateOne(
      { roomId },
      {
        textContent,
        lastActivity: new Date(),
      }
    );

    return NextResponse.json({
      success: true,
      message: "Room updated successfully",
    });
  } catch (error) {
    console.error("Error updating room:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update room" },
      { status: 500 }
    );
  }
}
