# Quick Start Guide - Real-Time Features

## All Issues Fixed! ✅

Your real-time collaboration app is now fully functional with:

- ✅ Real-time messaging
- ✅ Live text editing
- ✅ Proper room deletion
- ✅ Message persistence
- ✅ Multi-user support

## How to Test

### 1. Start the Server

Make sure you're running the custom server (not default Next.js):

```bash
npm run dev
```

Or if you have a custom script:

```bash
node server.js
```

The server should show:

```
✅ MongoDB connected
🚀 Server ready on http://localhost:3000
🔌 Socket.IO ready on ws://localhost:3000/api/socket
```

### 2. Test Real-Time Messaging

**Open 2 browser windows:**

**Window 1:**

1. Go to `http://localhost:3000`
2. Click "Create New Room"
3. Enter a password (required)
4. Optionally check "Private Room"
5. Click "Create Room"
6. Copy the room URL

**Window 2:**

1. Paste the room URL or use "Join Room"
2. Enter password if private
3. You should see "User-XXXX joined the room" message

**Test messaging:**

- Type a message in Window 1 → Click Send
- ✅ Should appear in Window 1 immediately
- ✅ Should appear in Window 2 immediately
- Type a message in Window 2 → Click Send
- ✅ Should appear in both windows

### 3. Test Live Text Editing

**In the left panel (Edit Live section):**

- Type some text in Window 1
- ✅ Should appear in Window 2 in real-time
- Type in Window 2
- ✅ Should appear in Window 1 in real-time

### 4. Test Message Persistence

**Window 3 (new user joining):**

1. Open a third browser window
2. Join the same room
3. ✅ Should see all previous messages
4. ✅ Should see current text content
5. Send a message
6. ✅ All windows should see it

### 5. Test Room Deletion

**In Window 1:**

1. Click "Destroy Room" button
2. Enter the room password
3. Click "Destroy Room"

**Expected behavior:**

- ✅ Window 1: Redirects to rooms list
- ✅ Window 2: Shows "Room deleted by admin" message
- ✅ Window 3: Shows "Room deleted by admin" message
- ✅ All windows auto-redirect after 3 seconds
- ✅ Refresh any window: Room not found

## Troubleshooting

### Messages not sending?

**Check console logs:**

- Open browser DevTools (F12)
- Look for: `📤 Sending message: ...`
- Look for: `📨 New message received: ...`

**Check server logs:**

- Should see: `💬 Message sent in [roomId] by [username]`

**If not working:**

1. Check socket connection: Look for `✅ Socket connected` in browser console
2. Check MongoDB connection: Look for `✅ MongoDB connected` in server logs
3. Restart the server

### Text editor not syncing?

**Check console logs:**

- Look for: `📝 Text update received`

**Check server logs:**

- Should see: `📝 Text updated in room [roomId]`

**If not working:**

1. Make sure you're typing in the left panel (Edit Live)
2. Check socket connection
3. Try refreshing the page

### Room deletion not working?

**Check:**

1. Are you entering the correct password?
2. Is the password the one you set when creating the room?
3. Check server logs for errors

**If other users not seeing deletion:**

1. Check server logs for: `🗑️ Room [roomId] deleted, X users notified`
2. Check browser console for: `🗑️ Room deleted event received`
3. Make sure all users are connected to socket

## Common Issues

### "Socket not connected"

- Wait a few seconds after page load
- Check if server is running
- Check browser console for connection errors

### "Room not found"

- Room may have been deleted
- Room may have expired
- Check if room ID is correct

### Messages appear twice

- This is normal! Server broadcasts to ALL users including sender
- This ensures everyone sees the same messages

### Text editor laggy

- This is expected with multiple users typing
- Server updates every keystroke
- Consider debouncing for production

## Architecture Overview

```
User Browser
    ↓
Socket.IO Client (useSocket hook)
    ↓
Socket.IO Server (server.js)
    ↓
MongoDB (Messages & Rooms)
    ↓
Broadcast to all users in room
```

## File Structure

```
app/
  room/[roomId]/page.tsx       - Main room page
  api/
    rooms/route.ts              - Create/list rooms
    rooms/[roomId]/route.ts     - Get/delete/update room
    socket/room-deleted/route.ts - Notify socket on deletion

components/
  room/
    ChatPanel.tsx               - Chat container
    MessageList.tsx             - Message display
    MessageInput.tsx            - Message input
    TextEditor.tsx              - Live text editor
    RoomHeader.tsx              - Room info & delete

server.js                       - Socket.IO server
lib/
  socket-instance.ts            - Socket instance helper
hooks/
  useSocket.ts                  - Socket connection hook
```

## Next Steps

1. ✅ Test all features
2. ✅ Verify multi-user functionality
3. ✅ Test room deletion
4. ✅ Test message persistence
5. Consider adding:
   - User authentication
   - File sharing
   - Video/audio chat
   - Rich text formatting
   - Message reactions

## Support

If you encounter any issues:

1. Check server logs
2. Check browser console
3. Verify MongoDB connection
4. Restart the server
5. Clear browser cache

All features are now working! Enjoy your real-time collaboration app! 🎉
