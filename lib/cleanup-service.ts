import RoomModel from "@/models/room";
import MessageModel from "@/models/message";

/**
 * Cleanup service for expired and inactive rooms
 * This handles cascading deletes and socket notifications
 */
export class CleanupService {
  /**
   * Delete a room and all its associated data
   * @param roomId - The room ID to delete
   * @param notifyCallback - Optional callback to notify connected clients
   */
  static async deleteRoom(
    roomId: string,
    notifyCallback?: (roomId: string) => Promise<void>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Mark room as inactive first
      const room = await RoomModel.findOneAndUpdate(
        { roomId },
        { isActive: false },
        { new: true }
      );

      if (!room) {
        return { success: false, error: "Room not found" };
      }

      // 2. Delete all messages associated with this room
      const messageDeleteResult = await MessageModel.deleteMany({ roomId });
      console.log(
        `🗑️ Deleted ${messageDeleteResult.deletedCount} messages from room ${roomId}`
      );

      // 3. Notify all connected clients via socket (if callback provided)
      if (notifyCallback) {
        await notifyCallback(roomId);
      }

      // 4. Actually delete the room document
      await RoomModel.deleteOne({ roomId });
      console.log(`✅ Room ${roomId} completely deleted`);

      return { success: true };
    } catch (error) {
      console.error(`❌ Error deleting room ${roomId}:`, error);
      return { success: false, error: "Failed to delete room" };
    }
  }

  /**
   * Find and cleanup all expired rooms
   * This should be run periodically (e.g., every minute)
   */
  static async cleanupExpiredRooms(
    notifyCallback?: (roomId: string) => Promise<void>
  ): Promise<number> {
    try {
      const now = new Date();

      // Find all rooms that have expired
      const expiredRooms = await RoomModel.find({
        isActive: true,
        expiresAt: { $exists: true, $lte: now },
      }).lean();

      console.log(`🧹 Found ${expiredRooms.length} expired rooms to cleanup`);

      let cleanedCount = 0;
      for (const room of expiredRooms) {
        const result = await this.deleteRoom(room.roomId, notifyCallback);
        if (result.success) {
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        console.log(`✅ Cleaned up ${cleanedCount} expired rooms`);
      }

      return cleanedCount;
    } catch (error) {
      console.error("❌ Error during cleanup:", error);
      return 0;
    }
  }

  /**
   * Cleanup inactive rooms (no activity for X hours)
   * @param inactiveHours - Number of hours of inactivity before deletion
   */
  static async cleanupInactiveRooms(
    inactiveHours: number = 24,
    notifyCallback?: (roomId: string) => Promise<void>
  ): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - inactiveHours);

      const inactiveRooms = await RoomModel.find({
        isActive: true,
        autoDelete: true,
        lastActivity: { $lte: cutoffDate },
        participants: { $size: 0 }, // Only delete if no one is in the room
      }).lean();

      console.log(`🧹 Found ${inactiveRooms.length} inactive rooms to cleanup`);

      let cleanedCount = 0;
      for (const room of inactiveRooms) {
        const result = await this.deleteRoom(room.roomId, notifyCallback);
        if (result.success) {
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        console.log(`✅ Cleaned up ${cleanedCount} inactive rooms`);
      }

      return cleanedCount;
    } catch (error) {
      console.error("❌ Error during inactive room cleanup:", error);
      return 0;
    }
  }
}
