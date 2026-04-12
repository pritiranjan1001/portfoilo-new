"use client";

import { useCallback, useEffect, useState } from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme-script";

function startViewTransitionIfSupported(fn: () => void) {
  const d = document as Document & {
    startViewTransition?: (callback: () => void) => unknown;
  };
  if (typeof d.startViewTransition === "function") {
    d.startViewTransition(fn);
  } else {
    fn();
  }
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const applyTheme = useCallback((next: boolean) => {
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    } catch {
      /* ignore */
    }
    setIsDark(next);
  }, []);

  const setLight = useCallback(() => {
    if (isDark === false) return;
    startViewTransitionIfSupported(() => applyTheme(false));
  }, [applyTheme, isDark]);

  const setDark = useCallback(() => {
    if (isDark === true) return;
    startViewTransitionIfSupported(() => applyTheme(true));
  }, [applyTheme, isDark]);

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="relative inline-flex h-10 shrink-0 items-stretch rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface-elevated)_92%,transparent)] p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] backdrop-blur-sm dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.04)]"
    >
      <span
        className={`pointer-events-none absolute inset-y-1 rounded-full bg-[color-mix(in_oklab,var(--foreground)_11%,transparent)] ring-1 ring-[color-mix(in_oklab,var(--foreground)_14%,transparent)] transition-[left,right] duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] ${
          isDark === true
            ? "left-[calc(50%+2px)] right-1"
            : "left-1 right-[calc(50%+2px)]"
        }`}
        aria-hidden
      />

      <button
        type="button"
        onClick={setLight}
        aria-pressed={isDark === false}
        aria-label="Use light theme"
        title="Light"
        className={`relative z-10 flex w-11 items-center justify-center rounded-full outline-none transition-[color,opacity] duration-300 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${
          isDark === false || isDark === null
            ? "text-[var(--foreground)]"
            : "text-[var(--muted)] opacity-50 hover:opacity-85"
        }`}
      >
        <IconSun className="h-[1.15rem] w-[1.15rem]" />
      </button>

      <button
        type="button"
        onClick={setDark}
        aria-pressed={isDark === true}
        aria-label="Use dark theme"
        title="Dark"
        className={`relative z-10 flex w-11 items-center justify-center rounded-full outline-none transition-[color,opacity] duration-300 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${
          isDark === true
            ? "text-[var(--foreground)]"
            : "text-[var(--muted)] opacity-50 hover:opacity-85"
        }`}
      >
        <IconMoon className="h-[1.15rem] w-[1.15rem]" />
      </button>
    </div>
  );
}

function IconSun({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function IconMoon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
