"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { ccNotifications } from "@/lib/command-center/mock-data";
import { useDismiss } from "./use-dismiss";

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useDismiss<HTMLDivElement>(() => setOpen(false));
  const unread = ccNotifications.filter((n) => n.unread).length;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`Notifications, ${unread} unread`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="cc-icon-btn relative"
      >
        <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-2 w-2">
            <span className="inline-flex h-full w-full rounded-full bg-[var(--cc-accent)]" />
          </span>
        )}
      </button>

      {open && (
        <div
          role="region"
          aria-label="Recent notifications"
          className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-xl border border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-xl"
        >
          <div className="cc-hairline-bottom flex items-center justify-between px-3.5 py-2.5">
            <p className="text-xs font-semibold text-[var(--cc-text)]">Notifications</p>
            <span className="rounded-full bg-[var(--cc-subtle)] px-2 py-0.5 text-[10px] font-semibold text-[var(--cc-text-muted)]">
              {unread} new
            </span>
          </div>
          <ul className="max-h-72 overflow-y-auto">
            {ccNotifications.map((n) => (
              <li
                key={n.id}
                className="cc-hairline-bottom flex items-start gap-2.5 p-3 text-left last:border-b-0 hover:bg-[var(--cc-subtle)]"
              >
                <span
                  aria-hidden="true"
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                    n.unread ? "bg-[var(--cc-accent)]" : "bg-[var(--cc-text-muted)]/40"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-[var(--cc-text)]">{n.title}</p>
                  <p className="truncate text-[11px] text-[var(--cc-text-muted)]">{n.detail}</p>
                </div>
                <time className="text-[10px] text-[var(--cc-text-muted)]">{n.time}</time>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
