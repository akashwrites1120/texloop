"use client";

import { useEffect, useState } from "react";

const PHRASES = [
  "in real time.",
  "with just a link.",
  "without an account.",
  "then let it vanish.",
];

export default function RotatingPhrase() {
  const [index, setIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = PHRASES[index];
    let timer: ReturnType<typeof setTimeout>;

    if (!deleting && charCount < current.length) {
      timer = setTimeout(() => setCharCount((c) => c + 1), 45);
    } else if (!deleting && charCount === current.length) {
      timer = setTimeout(() => setDeleting(true), 2100);
    } else if (deleting && charCount > 0) {
      timer = setTimeout(() => setCharCount((c) => c - 1), 20);
    } else {
      // Finished deleting — advance to the next phrase
      timer = setTimeout(() => {
        setDeleting(false);
        setIndex((i) => (i + 1) % PHRASES.length);
      }, 60);
    }

    return () => clearTimeout(timer);
  }, [charCount, deleting, index]);

  return (
    <span className="text-brand">
      {PHRASES[index].slice(0, charCount)}
      <span className="ml-1 inline-block h-[0.82em] w-[3px] translate-y-[2px] animate-caret-blink bg-brand align-baseline" />
    </span>
  );
}
