"use client";
import Link from "next/link";
import ThemeSwitcher from "../utils/ThemeSwitcher";
import { Shield, Github } from "lucide-react";

export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-2xl mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-lg tracking-tight">
            PasteCloak
          </span>
        </Link>
        
        <div className="flex items-center gap-1">
          <a
            href="https://github.com/parjanyamodi/pastecloak"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Github className="h-[18px] w-[18px]" />
          </a>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
