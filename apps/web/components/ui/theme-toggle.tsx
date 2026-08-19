"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** Alternância de tema claro/escuro do header. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // next-themes só sabe o tema real depois do mount (evita mismatch de SSR).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
          onClick={() => setTheme(isDark ? "light" : "dark")}
        >
          {mounted ? isDark ? <Sun /> : <Moon /> : <Moon className="opacity-0" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{isDark ? "Tema claro" : "Tema escuro"}</TooltipContent>
    </Tooltip>
  );
}
