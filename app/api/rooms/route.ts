import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import RoomModel from "@/models/Room";
import { CreateRoomInput } from "@/types/room";
import { hashPassword } from "@/lib/encryption";
import { nanoid } from "nanoid";

// POST - Create a new room
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body: CreateRoomInput = await request.json();

    // Validate password is provided
    if (!body.password || !body.password.trim()) {
      return NextResponse.json(
        { success: false, error: "Password is required for all rooms" },
        { status: 400 }
      );
    }

    // Generate unique room ID
    const roomId = body.name || `${nanoid(8)}-${nanoid(4)}`;

    // Hash the password
    const passwordHash = await hashPassword(body.password);

    // Calculate expiration date if destruction timer is set
    let expiresAt: Date | undefined;
    if (body.destructionTimer) {
      expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + body.destructionTimer);
    }

    // Create room
    const room = await RoomModel.create({
      roomId,
      name: body.name,
      createdBy: "anonymous", // You can add user ID here if you have auth
      createdAt: new Date(),
      expiresAt,
      lastActivity: new Date(),
      isActive: true,
      destructionTimer: body.destructionTimer,
      autoDelete: body.autoDelete,
      participants: [],
      textContent: "",
      isPrivate: body.isPrivate,
      passwordHash,
    });

    // Don't send password hash to client
    const { passwordHash: _, ...roomWithoutPassword } = room.toObject();

    return NextResponse.json({
      success: true,
      room: roomWithoutPassword,
    });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create room" },
      { status: 500 }
    );
  }
}

// GET - List all active rooms
export async function GET() {
  try {
    await connectDB();

    const rooms = await RoomModel.find({ isActive: true })
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      success: true,
      rooms,
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}
