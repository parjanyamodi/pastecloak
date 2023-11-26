"use client";

import { Button } from "@nextui-org/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MdWbSunny } from "react-icons/md";
import { IoMdMoon } from "react-icons/io";

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Button
      variant="flat"
      color={theme === "light" ? "default" : "warning"}
      isIconOnly
      onPress={() => (theme === "light" ? setTheme("dark") : setTheme("light"))}
    >
      {theme === "light" ? (
        <IoMdMoon className="shrink-0 text-lg" />
      ) : (
        <MdWbSunny className="shrink-0 text-lg" />
      )}
    </Button>
  );
}
