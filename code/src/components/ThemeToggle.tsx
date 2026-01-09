"use client";

import { useEffect, useMemo, useState } from "react";

const THEME_KEY = "portfolio:theme:v1";

type ThemeMode = "light" | "dark" | "system";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.dataset.theme = mode;
  const effective = mode === "system" ? getSystemTheme() : mode;
  root.classList.toggle("dark", effective === "dark");
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "system";
    try {
      const saved = window.localStorage.getItem(THEME_KEY) as ThemeMode | null;
      return saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
    } catch {
      return "system";
    }
  });

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (mode === "system") applyTheme("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [mode]);

  const label = useMemo(() => {
    if (mode === "light") return "Light";
    if (mode === "dark") return "Dark";
    return "System";
  }, [mode]);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
      <span className="px-2">Theme</span>
      <select
        aria-label="Theme"
        className="rounded-full bg-transparent px-2 py-1 text-xs outline-none"
        value={mode}
        onChange={(e) => {
          const next = e.target.value as ThemeMode;
          setMode(next);
          try {
            window.localStorage.setItem(THEME_KEY, next);
          } catch {
            // ignore
          }
          applyTheme(next);
        }}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      <span className="sr-only">Current: {label}</span>
    </div>
  );
}
