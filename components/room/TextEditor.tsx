"use client";

import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { MAX_TEXT_LENGTH } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export default function TextEditor({
  value,
  onChange,
  readOnly,
}: TextEditorProps) {
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCharCount(value.length);
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

  const lineNumbers = value.split("\n").map((_, idx) => idx + 1);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-muted/30">
        <h3 className="font-semibold text-sm">Edit Live</h3>
        <p className="text-xs text-muted-foreground">
          Collaborative real-time text editor
        </p>
      </div>

      {/* Editor Area with Scrollbar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers */}
        <div
          ref={gutterRef}
          className="w-12 bg-muted/40 border-r text-muted-foreground font-mono text-xs px-2 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent"
          style={{ scrollbarGutter: "stable" }}
        >
          {lineNumbers.map((n) => (
            <div key={n} className="leading-6 select-none text-right pr-2">
              {n}
            </div>
          ))}
        </div>

        {/* Text Area with Custom Scrollbar */}
        <div className="flex-1 relative overflow-hidden">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onScroll={handleScroll}
            readOnly={readOnly}
            placeholder="Start typing your text here... Changes are saved and shared in real-time."
            className="w-full h-full resize-none border-0 focus-visible:ring-0 font-mono text-sm p-4 leading-6 whitespace-pre-wrap overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40"
            style={{ fieldSizing: "fixed" } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          {charCount.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()}{" "}
          characters
        </span>
        <span className="hidden sm:inline">
          Real-time collaboration enabled
        </span>
      </div>
    </div>
  );
}
