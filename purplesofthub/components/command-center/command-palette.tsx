"use client";

import { useEffect, useRef, useState } from "react";
import { Search, CornerDownLeft, Users, FolderKanban, ReceiptText } from "lucide-react";
import { useDismiss } from "./use-dismiss";

const PALETTE_GROUPS = [
  {
    title: "Quick actions",
    items: [
      { label: "New project", hint: "Create", icon: FolderKanban },
      { label: "New invoice", hint: "Create", icon: ReceiptText },
      { label: "New client", hint: "CRM", icon: Users },
    ],
  },
  {
    title: "Navigate",
    items: [
      { label: "Go to Clients", hint: "/admin/clients", icon: Users },
      { label: "Go to Pipeline", hint: "/admin/projects", icon: FolderKanban },
      { label: "Go to Invoices", hint: "/admin/invoices", icon: ReceiptText },
    ],
  },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useDismiss<HTMLDivElement>(onClose);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-[80] flex items-start justify-center bg-black/50 p-4 pt-[12vh]"
    >
      <div
        ref={containerRef}
        className="w-full max-w-lg overflow-hidden rounded-xl border border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-2xl"
      >
        <div className="cc-hairline-bottom flex items-center gap-2.5 px-4 py-3">
          <Search className="h-4 w-4 text-[var(--cc-text-muted)]" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search (illustrative preview)..."
            className="flex-1 bg-transparent text-sm text-[var(--cc-text)] outline-none placeholder:text-[var(--cc-text-muted)]"
          />
          <kbd className="rounded border border-[var(--cc-border)] bg-[var(--cc-subtle)] px-1.5 py-0.5 text-[10px] text-[var(--cc-text-muted)]">
            ESC
          </kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {PALETTE_GROUPS.map((group) => (
            <div key={group.title} className="mb-2 last:mb-0">
              <p className="px-2.5 py-1 text-[11px] font-semibold text-[var(--cc-text-muted)]">
                {group.title}
              </p>
              {group.items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={onClose}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-[var(--cc-text-secondary)] hover:bg-[var(--cc-subtle)] hover:text-[var(--cc-text)]"
                >
                  <item.icon className="h-4 w-4 text-[var(--cc-text-muted)]" aria-hidden="true" />
                  <span className="flex-1">{item.label}</span>
                  <span className="text-[11px] text-[var(--cc-text-muted)]">{item.hint}</span>
                  <CornerDownLeft className="h-3 w-3 text-[var(--cc-text-muted)]" aria-hidden="true" />
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
