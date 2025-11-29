"use client";

import Link from "next/link";
import { MessageSquare, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto lg:px-20 md:px-16 px-4 ">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline">TexLoop</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <Link href="/rooms">
              <Button variant="default">Active Rooms</Button>
            </Link>
            <Link href="/join">
              <Button variant="outline" >Join Room</Button>
            </Link>
            <a
              href="https://github.com/akashwrites1120"
              target="_blank"
              rel="noopener noreferrer"
              className="md:block"
            >
              <Button variant="ghost" size="icon" className=" rounded-full transition-all duration-100
              hover:bg-black hover:text-white" >
                <Github className="h-5 w-5 " />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
