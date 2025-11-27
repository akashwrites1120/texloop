'use client';

import { useEffect, useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { MAX_TEXT_LENGTH } from '@/lib/constants';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export default function TextEditor({ value, onChange, readOnly }: TextEditorProps) {
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCharCount(value.length);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_TEXT_LENGTH) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        readOnly={readOnly}
        placeholder="Start typing your text here... Changes are saved and shared in real-time."
        className="flex-1 resize-none border-0 focus-visible:ring-0 font-mono text-sm p-4"
      />
      <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
        <span>
          {charCount.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()} characters
        </span>
        <span>Real-time collaboration enabled</span>
      </div>
    </div>
  );
}