"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Settings, User } from "lucide-react";
import { Initials } from "./primitives";
import { useDismiss } from "./use-dismiss";

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useDismiss<HTMLDivElement>(() => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="User account menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg p-1 hover:bg-[var(--cc-subtle)]"
      >
        <Initials name="Ama Sharma" />
        <span className="hidden text-xs font-semibold text-[var(--cc-text)] sm:block">Ama</span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="User account options"
          className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-[var(--cc-border)] bg-[var(--cc-surface)] p-1.5 shadow-xl"
        >
          <div className="px-2.5 py-2">
            <p className="text-xs font-semibold text-[var(--cc-text)]">Ama Sharma</p>
            <p className="truncate text-[11px] text-[var(--cc-text-muted)]">admin@purplesofthub.com</p>
          </div>
          <div className="my-1 h-px bg-[var(--cc-border)]" />
          <Link
            href="/admin/settings"
            role="menuitem"
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[var(--cc-text-secondary)] hover:bg-[var(--cc-subtle)] hover:text-[var(--cc-text)]"
          >
            <User className="h-3.5 w-3.5" aria-hidden="true" />
            Profile
          </Link>
          <Link
            href="/admin/settings"
            role="menuitem"
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[var(--cc-text-secondary)] hover:bg-[var(--cc-subtle)] hover:text-[var(--cc-text)]"
          >
            <Settings className="h-3.5 w-3.5" aria-hidden="true" />
            Settings
          </Link>
          <div className="my-1 h-px bg-[var(--cc-border)]" />
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[var(--cc-error)] hover:bg-[var(--cc-subtle)]"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
