"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "@/types/socket";

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function useSocket() {
  const [socket, setSocket] = useState<TypedSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<TypedSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;

  useEffect(() => {
    // Initialize socket connection with better options
    const socketInstance: TypedSocket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000",
      {
        path: "/api/socket",
        addTrailingSlash: false,
        transports: ["polling", "websocket"], // Try polling first, then upgrade to websocket
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true,
      }
    );

    socketInstance.on("connect", () => {
      console.log("✅ Socket connected:", socketInstance.id);
      setIsConnected(true);
      reconnectAttempts.current = 0;
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setIsConnected(false);

      // Auto-reconnect for certain disconnect reasons
      if (reason === "io server disconnect") {
        // Server disconnected the socket, manually reconnect
        setTimeout(() => {
          socketInstance.connect();
        }, 1000);
      }
    });

    socketInstance.on("connect_error", (error) => {
      console.error("🔴 Socket connection error:", error.message);
      reconnectAttempts.current++;

      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error("Max reconnection attempts reached");
        setIsConnected(false);
      }
    });

    socketInstance.on("reconnect", (attemptNumber) => {
      console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      reconnectAttempts.current = 0;
    });

    socketInstance.on("reconnect_attempt", (attemptNumber) => {
      console.log(
        `🔄 Reconnection attempt ${attemptNumber}/${maxReconnectAttempts}`
      );
    });

    socketInstance.on("reconnect_error", (error) => {
      console.error("🔴 Reconnection error:", error.message);
    });

    socketInstance.on("reconnect_failed", () => {
      console.error("❌ Reconnection failed after maximum attempts");
      setIsConnected(false);
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up socket connection");
      socketInstance.removeAllListeners();
      socketInstance.disconnect();
    };
  }, []);

  // Provide manual reconnect function
  const reconnect = () => {
    if (socketRef.current) {
      console.log("🔄 Manual reconnection triggered");
      socketRef.current.connect();
    }
  };

  return { socket, isConnected, reconnect };
}
