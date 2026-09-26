"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/context/ThemeContext";

/**
 * Admin theme toggle — Command Center presentation.
 *
 * A single light/dark toggle (the approved Phase 1 control). It drives the
 * site-wide next-themes provider, so `html.dark` flips, the whole Admin shell
 * re-themes instantly and the choice persists in the existing
 * `purplesofthub-theme` storage key. No reload, no second theme source.
 *
 * The icon is chosen purely in CSS from `html.dark` (the project's
 * class-based `dark:` variant) instead of from React state, which keeps the
 * server and client markup identical — no hydration mismatch, no mounted
 * guard and no effect.
 */
export function AdminThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="cc-icon-btn cc-icon-btn-sm"
      aria-label="Toggle light or dark theme"
      title="Toggle light or dark theme"
    >
      <Moon className="h-[18px] w-[18px] dark:hidden" aria-hidden="true" />
      <Sun className="hidden h-[18px] w-[18px] dark:block" aria-hidden="true" />
    </button>
  );
}
