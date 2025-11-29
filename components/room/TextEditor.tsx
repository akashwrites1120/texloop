"use client";

import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { MAX_TEXT_LENGTH } from "@/lib/constants";
import {
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  Copy,
  Check,
  Lock,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { copyToClipboard } from "@/lib/utils";
import { useSocket } from "@/hooks/useSocket";
import { useYjsEditor } from "@/hooks/useYjsEditor";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  liveSyncEnabled: boolean;
  onLiveSyncToggle: (enabled: boolean) => void;
  roomPassword?: string;
  roomId: string;
}

export default function TextEditor({
  value,
  onChange,
  readOnly,
  liveSyncEnabled,
  onLiveSyncToggle,
  roomPassword,
  roomId,
}: TextEditorProps) {
  const [charCount, setCharCount] = useState(0);
  const [lineCount, setLineCount] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Copy text state
  const [copied, setCopied] = useState(false);

  // Password verification state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Get socket connection
  const { socket, isConnected } = useSocket();

  // Y.js collaborative editing
  const { updateText } = useYjsEditor({
    roomId,
    socket,
    isConnected,
    liveSyncEnabled,
    initialValue: value,
    onUpdate: (text) => {
      // Update parent component when Y.js text changes
      if (text !== value) {
        onChange(text);
      }
    },
  });

  useEffect(() => {
    setCharCount(value.length);
    setLineCount(value.split("\n").length);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_TEXT_LENGTH) {
      if (liveSyncEnabled) {
        // Use Y.js for collaborative editing
        updateText(newValue);
      } else {
        // Regular update without Y.js
        onChange(newValue);
      }
    }
  };

  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleCopyText = async () => {
    try {
      await copyToClipboard(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const handleLiveSyncToggle = (enabled: boolean) => {
    if (enabled) {
      // Always show password dialog for verification when enabling
      setShowPasswordDialog(true);
    } else {
      // No password required when turning off
      onLiveSyncToggle(enabled);
    }
  };

  const handlePasswordVerify = async () => {
    if (!verifyPassword.trim()) {
      setPasswordError("Password is required");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    setIsVerifying(true);
    setPasswordError("");

    try {
      let isValid = false;

      if (roomPassword) {
        // Private room: we have the password in state, verify locally
        isValid = verifyPassword.trim() === roomPassword;
      } else {
        // Public room: verify against server
        const response = await fetch(`/api/rooms/${roomId}/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: verifyPassword }),
        });
        const data = await response.json();
        isValid = data.success;
      }

      if (isValid) {
        setShowPasswordDialog(false);
        setVerifyPassword("");
        setPasswordError("");
        onLiveSyncToggle(true);
      } else {
        setPasswordError("Incorrect password");
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
    } catch (error) {
      console.error("Verification error:", error);
      setPasswordError("Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);
  const usagePercent = (charCount / MAX_TEXT_LENGTH) * 100;
  const isNearLimit = usagePercent > 90;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Live Sync Toggle */}
      <div className="px-3 py-2 sm:px-4 sm:py-2.5 border-b bg-muted/30 shrink-0">
        <div className="flex items-center justify-between gap-2">
          {/* Left side - Title and Sync Status */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h3 className="font-semibold text-xs sm:text-sm shrink-0">
              Live Editor
            </h3>
            <div className="flex items-center gap-1.5">
              {liveSyncEnabled ? (
                <Wifi className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-500 shrink-0" />
              ) : (
                <WifiOff className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground shrink-0" />
              )}
              <span className="text-[9px] sm:text-[10px] text-muted-foreground  xs:inline">
                Live Sync {liveSyncEnabled ? "On" : "Off"}
              </span>
            </div>
          </div>

          {/* Right side - Copy, Toggle and Line Count */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Copy Text Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyText}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:cursor-pointer"
              title="Copy text to clipboard"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
            </Button>

            <Switch
              checked={liveSyncEnabled}
              onCheckedChange={handleLiveSyncToggle}
              className="scale-75 sm:scale-100 hover:cursor-pointer"
            />
            <div className="text-[10px] xs:text-xs text-muted-foreground">
              {lineCount.toLocaleString()} {lineCount === 1 ? "line" : "lines"}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden relative">
        {/* Line Numbers - hidden scrollbar, syncs with textarea */}
        <div
          ref={gutterRef}
          className="w-9 xs:w-10 sm:w-12 bg-muted/40 border-r text-muted-foreground/70 font-mono text-[10px] xs:text-xs px-1.5 sm:px-2 py-3 sm:py-4 overflow-y-scroll no-scrollbar select-none shrink-0"
          style={{ overscrollBehavior: "contain" }}
        >
          {lineNumbers.map((n) => (
            <div
              key={n}
              className="leading-6 xs:leading-[1.6rem] sm:leading-6 text-right pr-1"
            >
              {n}
            </div>
          ))}
        </div>

        {/* Text Area - visible scrollbar */}
        <div className="flex-1 relative overflow-hidden">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onScroll={handleScroll}
            readOnly={readOnly}
            placeholder="Start typing... Toggle Live Sync to collaborate in real-time..."
            className="w-full h-full resize-none border-0 focus-visible:ring-0 font-mono text-xs xs:text-[13px] sm:text-sm p-3 sm:p-4 leading-6 xs:leading-[1.6rem] sm:leading-6 whitespace-pre-wrap overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/50 bg-transparent placeholder:text-muted-foreground/40"
            style={
              {
                fieldSizing: "fixed",
                overscrollBehavior: "contain",
              } as React.CSSProperties
            }
          />
        </div>
      </div>

      {/* Footer with Progress Bar */}
      <div className="border-t bg-muted/30 shrink-0">
        {/* Character Usage Progress Bar */}
        <div className="h-0.5 sm:h-1 bg-muted/50 relative overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isNearLimit
                ? "bg-gradient-to-r from-yellow-500 to-red-500"
                : "bg-gradient-to-r from-primary/60 to-primary"
            }`}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          />
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] xs:text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="flex items-center gap-1 font-medium">
              {isNearLimit ? (
                <AlertCircle className="w-3 h-3 text-yellow-500 shrink-0" />
              ) : (
                <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
              )}
              <span
                className={
                  isNearLimit
                    ? "text-yellow-600 dark:text-yellow-500"
                    : "text-muted-foreground"
                }
              >
                {charCount.toLocaleString()}
                <span className="hidden xs:inline">
                  {" "}
                  / {MAX_TEXT_LENGTH.toLocaleString()}
                </span>
              </span>
            </span>
            <span className="text-muted-foreground/60 hidden sm:inline">•</span>
            <span className="text-muted-foreground/80 hidden sm:inline">
              {usagePercent.toFixed(1)}% used
            </span>
          </div>
          <span className="text-muted-foreground/60 hidden xs:inline text-[10px]">
            {liveSyncEnabled ? "Real-time" : "Auto-save"}
          </span>
        </div>
      </div>

      {/* Password Verification Dialog */}
      <AlertDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
      >
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
              <span>Enable Live Sync</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Enter the room password to enable live editing. This allows
              real-time collaboration.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 py-3 sm:py-4">
            <Label
              htmlFor="verifyPassword"
              className="flex items-center gap-2 text-sm"
            >
              <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Room Password
            </Label>
            <Input
              id="verifyPassword"
              type="password"
              placeholder="Enter room password"
              value={verifyPassword}
              onChange={(e) => {
                setVerifyPassword(e.target.value);
                setPasswordError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handlePasswordVerify()}
              className={`h-10 sm:h-11 text-sm sm:text-base ${
                isShaking ? "animate-shake border-destructive" : ""
              }`}
              autoFocus
            />
            {passwordError && (
              <p className="text-xs sm:text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {passwordError}
              </p>
            )}
          </div>

          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              onClick={() => {
                setVerifyPassword("");
                setPasswordError("");
              }}
              className="w-full sm:w-auto m-0"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handlePasswordVerify();
              }}
              disabled={!verifyPassword.trim() || isVerifying}
              className="w-full sm:w-auto"
            >
              {isVerifying ? "Verifying..." : "Enable Live Sync"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Shake Animation Style */}
      <style jsx global>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          20%,
          60% {
            transform: translateX(-4px);
          }
          40%,
          80% {
            transform: translateX(4px);
          }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>
    </div>
  );
}
