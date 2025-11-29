import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { Socket } from "socket.io-client";

interface UseYjsEditorProps {
  roomId: string;
  socket: Socket | null;
  isConnected: boolean;
  liveSyncEnabled: boolean;
  initialValue: string;
  onUpdate: (text: string) => void;
}

export function useYjsEditor({
  roomId,
  socket,
  isConnected,
  liveSyncEnabled,
  initialValue,
  onUpdate,
}: UseYjsEditorProps) {
  const ydocRef = useRef<Y.Doc | null>(null);
  const ytextRef = useRef<Y.Text | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize Y.Doc and Y.Text
    if (!ydocRef.current) {
      ydocRef.current = new Y.Doc();
      ytextRef.current = ydocRef.current.getText("content");

      // Set initial value
      if (initialValue && ytextRef.current.length === 0) {
        ytextRef.current.insert(0, initialValue);
      }

      setIsInitialized(true);
    }

    return () => {
      // Cleanup on unmount
      if (ydocRef.current) {
        ydocRef.current.destroy();
        ydocRef.current = null;
        ytextRef.current = null;
        setIsInitialized(false);
      }
    };
  }, [initialValue]);

  useEffect(() => {
    if (
      !socket ||
      !isConnected ||
      !liveSyncEnabled ||
      !ydocRef.current ||
      !ytextRef.current
    ) {
      return;
    }

    const ydoc = ydocRef.current;
    const ytext = ytextRef.current;

    // Listen for local changes and broadcast to other clients
    const updateHandler = (update: Uint8Array, origin: any) => {
      // Don't broadcast updates that came from the network
      if (origin !== "network") {
        socket.emit("yjs:update", {
          roomId,
          update: Array.from(update), // Convert Uint8Array to regular array for JSON
        });
      }
    };

    // Listen for text changes to update the parent component
    const textObserver = () => {
      const text = ytext.toString();
      onUpdate(text);
    };

    ydoc.on("update", updateHandler);
    ytext.observe(textObserver);

    // Listen for updates from other clients
    const handleRemoteUpdate = ({ update }: { update: number[] }) => {
      try {
        // Apply remote update with 'network' origin to prevent echo
        Y.applyUpdate(ydoc, new Uint8Array(update), "network");
      } catch (error) {
        console.error("Error applying Y.js update:", error);
      }
    };

    // Request initial state when joining
    socket.emit("yjs:sync-request", { roomId });

    // Listen for sync response with full state
    const handleSyncResponse = ({ state }: { state: number[] }) => {
      try {
        if (state && state.length > 0) {
          Y.applyUpdate(ydoc, new Uint8Array(state), "network");
        }
      } catch (error) {
        console.error("Error applying Y.js sync:", error);
      }
    };

    socket.on("yjs:update", handleRemoteUpdate);
    socket.on("yjs:sync-response", handleSyncResponse);

    return () => {
      ydoc.off("update", updateHandler);
      ytext.unobserve(textObserver);
      socket.off("yjs:update", handleRemoteUpdate);
      socket.off("yjs:sync-response", handleSyncResponse);
    };
  }, [socket, isConnected, liveSyncEnabled, roomId, onUpdate]);

  const updateText = (newText: string) => {
    if (!ytextRef.current || !liveSyncEnabled) {
      // If Y.js is not enabled, just update normally
      onUpdate(newText);
      return;
    }

    const ytext = ytextRef.current;
    const currentText = ytext.toString();

    if (currentText !== newText) {
      // Calculate the diff and apply minimal changes
      // This is a simple implementation - Y.js will handle conflicts
      ydocRef.current?.transact(() => {
        ytext.delete(0, currentText.length);
        ytext.insert(0, newText);
      });
    }
  };

  return {
    isInitialized,
    updateText,
    ytext: ytextRef.current,
    ydoc: ydocRef.current,
  };
}
