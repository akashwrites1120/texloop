import { NextRequest, NextResponse } from "next/server";

// This endpoint is called when a room is deleted to notify all connected users
export async function POST(request: NextRequest) {
  try {
    const { roomId } = await request.json();

    if (!roomId) {
      return NextResponse.json(
        { success: false, error: "Room ID required" },
        { status: 400 }
      );
    }

    // Import the socket server dynamically to avoid issues
    const { getSocketIO } = await import("@/lib/socket-instance");
    const io = getSocketIO();

    if (io) {
      // Emit room:deleted event to all users in the room
      io.to(roomId).emit("room:deleted", {
        message: "This room has been deleted by the admin.",
      });

      // Disconnect all sockets in this room
      const sockets = await io.in(roomId).fetchSockets();
      for (const socket of sockets) {
        socket.leave(roomId);
      }

      console.log(
        `🗑️ Room ${roomId} deleted, ${sockets.length} users notified`
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error notifying room deletion:", error);
    return NextResponse.json(
      { success: false, error: "Failed to notify users" },
      { status: 500 }
    );
  }
}
