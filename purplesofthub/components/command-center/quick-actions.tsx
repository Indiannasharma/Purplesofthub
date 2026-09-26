"use client";

import { FolderPlus, ReceiptText, Wrench, PenLine } from "lucide-react";

/** Contextual quick actions — targets are existing admin create routes. */

const actions = [
  { icon: FolderPlus, label: "New project", hint: "/admin/projects/new" },
  { icon: ReceiptText, label: "New invoice", hint: "/admin/invoices/new" },
  { icon: Wrench, label: "New service", hint: "/admin/services/new" },
  { icon: PenLine, label: "New post", hint: "/admin/blog/create" },
];

export function QuickActions() {
  return (
    <section aria-label="Quick actions" className="cc-panel p-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className="flex items-center gap-2.5 rounded-lg border border-[var(--cc-border)] px-3.5 py-3 text-left transition-colors hover:bg-[var(--cc-subtle)]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--cc-accent-soft)]">
              <action.icon className="h-4 w-4 text-[var(--cc-accent)]" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold text-[var(--cc-text)]">
                {action.label}
              </span>
              <span className="block truncate text-[10px] text-[var(--cc-text-muted)]">
                {action.hint}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
