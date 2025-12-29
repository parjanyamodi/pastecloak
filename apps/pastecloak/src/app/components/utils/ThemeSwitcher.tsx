"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="p-2 rounded-md text-muted-foreground" disabled>
        <Sun className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      onClick={() => (theme === "light" ? setTheme("dark") : setTheme("light"))}
      className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-[hsl(220,20%,12%)] transition-colors"
      title="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </button>
  );
}
