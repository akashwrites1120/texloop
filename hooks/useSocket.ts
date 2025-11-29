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
    // Initialize socket connection with optimized options
    const socketInstance: TypedSocket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000",
      {
        path: "/api/socket",
        addTrailingSlash: false,
        transports: ["polling", "websocket"], // Start with polling, upgrade to websocket
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true,
        forceNew: false,
        multiplex: true,
      }
    );

    socketInstance.on("connect", () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;
    });

    socketInstance.on("disconnect", (reason) => {
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
      reconnectAttempts.current++;

      // Only log error in development after 3 failed attempts to reduce noise
      if (
        process.env.NODE_ENV === "development" &&
        reconnectAttempts.current >= 3
      ) {
        console.error(
          "Socket connection error after",
          reconnectAttempts.current,
          "attempts:",
          error.message
        );
      }

      if (reconnectAttempts.current >= maxReconnectAttempts) {
        setIsConnected(false);
        if (process.env.NODE_ENV === "development") {
          console.error(
            "Max reconnection attempts reached. Please check your server."
          );
        }
      }
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.removeAllListeners();
      socketInstance.disconnect();
    };
  }, []);

  // Provide manual reconnect function
  const reconnect = () => {
    if (socketRef.current) {
      socketRef.current.connect();
    }
  };

  return { socket, isConnected, reconnect };
}
