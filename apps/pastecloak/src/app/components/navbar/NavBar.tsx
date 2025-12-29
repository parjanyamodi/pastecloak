"use client";
import Link from "next/link";
import ThemeSwitcher from "../utils/ThemeSwitcher";
import { Lock, Github, Info } from "lucide-react";

export default function NavBar() {
  return (
    <header className="relative z-50 border-b border-[hsl(220,20%,12%)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-md bg-[hsl(160,100%,40%)] flex items-center justify-center">
            <Lock className="h-4 w-4 text-[hsl(220,20%,4%)]" strokeWidth={2.5} />
          </div>
          <span className="text-base font-semibold tracking-tight">
            <span className="text-foreground">paste</span>
            <span className="text-[hsl(160,100%,45%)]">cloak</span>
          </span>
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-1">
          <Link
            href="/about"
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-[hsl(220,20%,12%)] transition-colors"
            title="About"
          >
            <Info className="h-4 w-4" />
          </Link>
          <a
            href="https://github.com/parjanyamodi/pastecloak"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-[hsl(220,20%,12%)] transition-colors"
            title="GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
