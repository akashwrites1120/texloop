"use client";

import Link from "next/link";
import { Infinity as InfinityIcon, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Navbar({ className }: { className?: string }) {
  return (
    <nav
      className={cn(
        "fixed top-0 left-0 z-50 w-full border-b border-transparent",
        className
      )}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform duration-300 group-hover:rotate-180">
              <InfinityIcon className="h-4.5 w-4.5" strokeWidth={2.2} />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              TexLoop
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link href="/rooms" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="hover:cursor-pointer">
                Active rooms
              </Button>
            </Link>
            <Link href="/join">
              <Button size="sm" className="hover:cursor-pointer">
                Join a room
              </Button>
            </Link>
            <a
              href="https://github.com/akashwrites1120/texloop"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Button variant="ghost" size="icon-sm" className="rounded-full hover:cursor-pointer">
                <Github className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
    </nav>
  );
}
