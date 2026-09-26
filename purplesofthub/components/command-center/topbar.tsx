"use client";

import { useEffect, useState } from "react";
import { Command, Menu, Moon, Search, Sun } from "lucide-react";
import { CommandPalette } from "./command-palette";
import { NotificationsMenu } from "./notifications-menu";
import { UserMenu } from "./user-menu";

export function CcTopbar({
  theme,
  onToggleTheme,
  onOpenMobileNav,
}: {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onOpenMobileNav: () => void;
}) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <header
        aria-label="Command Center header"
        className="cc-hairline-bottom flex h-12 shrink-0 items-center justify-between gap-3 bg-[var(--cc-surface)] px-4"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Open navigation drawer"
            onClick={onOpenMobileNav}
            className="cc-icon-btn lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="flex h-8 items-center gap-2 rounded-lg border border-[var(--cc-border)] bg-[var(--cc-subtle)] px-2.5 text-xs text-[var(--cc-text-muted)] transition-colors hover:border-[var(--cc-border-strong)] hover:text-[var(--cc-text)]"
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Search or jump to...</span>
            <span className="sm:hidden">Search...</span>
            <kbd className="hidden rounded border border-[var(--cc-border)] bg-[var(--cc-surface)] px-1 py-0.5 text-[10px] font-medium sm:inline-flex items-center gap-0.5">
              <Command className="h-2.5 w-2.5" aria-hidden="true" />K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            onClick={onToggleTheme}
            className="cc-icon-btn"
          >
            {theme === "light" ? (
              <Moon className="h-[18px] w-[18px]" aria-hidden="true" />
            ) : (
              <Sun className="h-[18px] w-[18px]" aria-hidden="true" />
            )}
          </button>

          <NotificationsMenu />

          <div aria-hidden="true" className="mx-1 h-5 w-px bg-[var(--cc-border)]" />

          <UserMenu />
        </div>
      </header>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
