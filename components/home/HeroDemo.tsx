"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const SCRIPT = [
  "const room = texloop.join('swift-otter-42');",
  "room.share('Deploy notes — see thread');",
  "// synced across every device, instantly",
  "room.expireIn('2h'); // then it vanishes",
];

const BUBBLES = [
  { user: "Mira", text: "got it, editing now", own: false },
  { user: "You", text: "live sync is on", own: true },
  { user: "Dev", text: "clean. shipping it", own: false },
];

function useTypewriter(lines: string[], speed = 34, holdMs = 1500) {
  const [lineIndex, setLineIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = lines[lineIndex % lines.length];
    let timer: ReturnType<typeof setTimeout>;

    if (!deleting && charCount < current.length) {
      timer = setTimeout(() => setCharCount((c) => c + 1), speed);
    } else if (!deleting && charCount === current.length) {
      timer = setTimeout(() => setDeleting(true), holdMs);
    } else if (deleting && charCount > 0) {
      timer = setTimeout(() => setCharCount((c) => c - 1), speed / 2.5);
    } else {
      // Finished deleting — move to the next line
      timer = setTimeout(() => {
        setDeleting(false);
        setLineIndex((i) => (i + 1) % lines.length);
      }, 60);
    }

    return () => clearTimeout(timer);
  }, [charCount, deleting, lineIndex, lines, speed, holdMs]);

  return {
    text: lines[lineIndex % lines.length].slice(0, charCount),
    lineIndex,
  };
}

export default function HeroDemo() {
  const { text, lineIndex } = useTypewriter(SCRIPT);

  // Chat bubbles appear one by one on a loop
  const [visibleBubbles, setVisibleBubbles] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setVisibleBubbles((n) => (n + 1) % (BUBBLES.length + 2)),
      1400
    );
    return () => clearInterval(t);
  }, []);

  const dots = useMemo(
    () => Array.from({ length: SCRIPT.length }, (_, i) => i),
    []
  );

  return (
    <div className="ring-hairline relative w-full overflow-hidden rounded-2xl bg-card">
      {/* Window chrome */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-brand/60" />
        </div>
        <div className="mx-auto flex items-center gap-2 rounded-md bg-muted px-3 py-1 font-mono text-[11px] text-muted-foreground">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping-slow rounded-full bg-brand" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
          </span>
          texloop.app/room/swift-otter-42
        </div>
      </div>

      <div className="grid grid-cols-5">
        {/* Editor pane */}
        <div className="col-span-3 border-r">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              editor
            </span>
            <span className="rounded-full bg-brand-muted px-2 py-0.5 font-mono text-[10px] font-medium text-accent-foreground">
              live sync
            </span>
          </div>
          <div className="min-h-[168px] p-4 font-mono text-[12px] leading-6 sm:text-[13px]">
            <div className="text-muted-foreground/50 select-none">
              {"// paste anything, share the link"}
            </div>
            {dots.map((i) => (
              <div key={i} className="flex gap-3">
                <span className="w-4 shrink-0 text-right text-muted-foreground/40 select-none">
                  {i + 2}
                </span>
                <span className="flex-1 whitespace-pre-wrap break-all">
                  {i === lineIndex ? (
                    <>
                      <span className="text-foreground">{text}</span>
                      <span className="ml-0.5 inline-block h-[14px] w-[7px] translate-y-[2px] animate-caret-blink bg-brand" />
                    </>
                  ) : i < lineIndex ? (
                    <span className="text-foreground/70">{SCRIPT[i]}</span>
                  ) : (
                    ""
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat pane */}
        <div className="col-span-2 hidden bg-muted/30 sm:block">
          <div className="border-b px-4 py-2">
            <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              chat
            </span>
          </div>
          <div className="flex min-h-[168px] flex-col justify-end gap-2 p-3">
            {BUBBLES.map((b, i) => (
              <div
                key={b.user}
                className={cn(
                  "max-w-[85%]",
                  b.own ? "self-end" : "self-start",
                  visibleBubbles > i ? "animate-pop-in" : "opacity-0"
                )}
              >
                <span
                  className={cn(
                    "block rounded-xl px-2.5 py-1.5 text-[11px] leading-snug",
                    b.own
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm border bg-card"
                  )}
                >
                  {b.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer strip */}
      <div className="flex items-center justify-between border-t px-4 py-2 font-mono text-[10px] text-muted-foreground">
        <span>3 participants</span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-warning" />
          expires in 01:59:58
        </span>
      </div>

      {/* Floating chips */}
      <div className="animate-float-y absolute -top-0.5 -right-0.5 hidden rotate-2 items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 shadow-md md:flex">
        <svg className="h-3.5 w-3.5 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
        <span className="text-xs font-medium">Synced</span>
      </div>
      <div
        className="animate-float-y absolute -bottom-3 -left-3 hidden items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 shadow-md md:flex"
        style={{ animationDelay: "-3s" }}
      >
        <span className="font-mono text-[10px] text-muted-foreground">~40ms</span>
        <span className="text-xs font-medium">round-trip</span>
      </div>
    </div>
  );
}
