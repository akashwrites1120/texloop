import { NextResponse } from 'next/server';

// This endpoint is not used when running with custom server (server.js)
// Socket.io is initialized directly in server.js
export async function GET() {
  return NextResponse.json({ 
    message: 'Socket.io is running via custom server',
    status: 'active'
  });
}