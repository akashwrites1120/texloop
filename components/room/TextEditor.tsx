"use client";

import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { MAX_TEXT_LENGTH } from "@/lib/constants";

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
      <div className="flex-1 grid grid-cols-[3rem_1fr]">
        <div
          ref={gutterRef}
          className="bg-muted/40 border-r text-muted-foreground font-mono text-xs px-2 py-4 overflow-y-auto no-scrollbar"
        >
          {lineNumbers.map((n) => (
            <div key={n} className="leading-6 select-none">
              {n}
            </div>
          ))}
        </div>
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onScroll={handleScroll}
          readOnly={readOnly}
          placeholder="Start typing your text here... Changes are saved and shared in real-time."
          className="flex-1 resize-none border-0 focus-visible:ring-0 font-mono text-sm p-4 leading-6 whitespace-pre-wrap h-full overflow-y-auto"
          style={{ fieldSizing: "fixed" } as React.CSSProperties}
        />
      </div>
      <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
        <span>
          {charCount.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()}{" "}
          characters
        </span>
        <span>Real-time collaboration enabled</span>
      </div>
    </div>
  );
}
