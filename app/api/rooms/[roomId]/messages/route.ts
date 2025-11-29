import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MessageModel from "@/models/message";
import RoomModel from "@/models/room";
import { CreateMessageInput } from "@/types/message";
import { encryptMessage, decryptMessage } from "@/lib/encryption";

// GET all messages for a room
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await connectDB();

    const { roomId } = await params;

    // Verify room exists
    const room = await RoomModel.findOne({ roomId });
    if (!room) {
      return NextResponse.json(
        { success: false, error: "Room not found" },
        { status: 404 }
      );
    }

    const messages = await MessageModel.find({ roomId })
      .sort({ timestamp: 1 })
      .lean();

    // Decrypt messages before sending to client
    const decryptedMessages = messages.map((msg) => ({
      ...msg,
      message:
        msg.type === "system" ? msg.message : decryptMessage(msg.message),
    }));

    return NextResponse.json({
      success: true,
      messages: decryptedMessages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST create new message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await connectDB();

    const { roomId } = await params;

    const body: CreateMessageInput = await request.json();
    const { userId, username, message, type = "text" } = body;

    // Verify room exists and is active
    const room = await RoomModel.findOne({
      roomId,
      isActive: true,
    });

    if (!room) {
      return NextResponse.json(
        { success: false, error: "Room not found or inactive" },
        { status: 404 }
      );
    }

    // Encrypt message content for privacy (stored encrypted in DB)
    const encryptedMessage = encryptMessage(message);

    const newMessage = await MessageModel.create({
      roomId,
      userId,
      username,
      message: encryptedMessage,
      type,
      timestamp: new Date(),
    });

    // Update room last activity
    await RoomModel.updateOne({ roomId }, { lastActivity: new Date() });

    return NextResponse.json(
      {
        success: true,
        message: newMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create message" },
      { status: 500 }
    );
  }
}
