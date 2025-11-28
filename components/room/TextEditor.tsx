"use client";

import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { MAX_TEXT_LENGTH } from "@/lib/constants";
import { CheckCircle2, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  liveSyncEnabled: boolean;
  onLiveSyncToggle: (enabled: boolean) => void;
}

export default function TextEditor({
  value,
  onChange,
  readOnly,
  liveSyncEnabled,
  onLiveSyncToggle,
}: TextEditorProps) {
  const [charCount, setCharCount] = useState(0);
  const [lineCount, setLineCount] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCharCount(value.length);
    setLineCount(value.split("\n").length);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_TEXT_LENGTH) {
      onChange(newValue);
    }
  };

  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
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
            <h3 className="font-semibold text-xs sm:text-sm shrink-0">Live Editor</h3>
            <div className="flex items-center gap-1.5">
              {liveSyncEnabled ? (
                <Wifi className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-500 shrink-0" />
              ) : (
                <WifiOff className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground shrink-0" />
              )}
              <span className="text-[9px] sm:text-[10px] text-muted-foreground hidden xs:inline">
                Live Sync {liveSyncEnabled ? "On" : "Off"}
              </span>
            </div>
          </div>

          {/* Right side - Toggle and Line Count */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Switch
              checked={liveSyncEnabled}
              onCheckedChange={onLiveSyncToggle}
              className="scale-75 sm:scale-100"
            />
            <div className="text-[10px] xs:text-xs text-muted-foreground">
              {lineCount.toLocaleString()} {lineCount === 1 ? "line" : "lines"}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div 
        ref={containerRef}
        className="flex-1 flex overflow-hidden relative"
      >
        {/* Line Numbers - hidden scrollbar, syncs with textarea */}
        <div
          ref={gutterRef}
          className="w-9 xs:w-10 sm:w-12 bg-muted/40 border-r text-muted-foreground/70 font-mono text-[10px] xs:text-xs px-1.5 sm:px-2 py-3 sm:py-4 overflow-y-scroll no-scrollbar select-none shrink-0"
          style={{ overscrollBehavior: "contain" }}
        >
          {lineNumbers.map((n) => (
            <div
              key={n}
              className="leading-[1.5rem] xs:leading-[1.6rem] sm:leading-6 text-right pr-1"
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
            placeholder="Start typing... Toggle Live Sync to collaborate in real-time."
            className="w-full h-full resize-none border-0 focus-visible:ring-0 font-mono text-xs xs:text-[13px] sm:text-sm p-3 sm:p-4 leading-[1.5rem] xs:leading-[1.6rem] sm:leading-6 whitespace-pre-wrap overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/50 bg-transparent placeholder:text-muted-foreground/40"
            style={{ 
              fieldSizing: "fixed",
              overscrollBehavior: "contain"
            } as React.CSSProperties}
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
                <span className="hidden xs:inline"> / {MAX_TEXT_LENGTH.toLocaleString()}</span>
              </span>
            </span>
            <span className="text-muted-foreground/60 hidden sm:inline">•</span>
            <span className="text-muted-foreground/80 hidden sm:inline">
              {usagePercent.toFixed(1)}% used
            </span>
          </div>
          <span className="text-muted-foreground/60 hidden xs:inline text-[10px]">
            Auto-save
          </span>
        </div>
      </div>
    </div>
  );
}