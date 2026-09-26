"use client";

import { ChevronRight } from "lucide-react";
import { actionQueue, type Priority } from "@/lib/command-center/mock-data";
import { Panel, PanelHeader, Pill, type PillTone } from "./primitives";

/** Priority action queue — the work that needs attention first. */

const priorityMeta: Record<Priority, { tone: PillTone; label: string }> = {
  high: { tone: "error", label: "High" },
  medium: { tone: "warning", label: "Medium" },
  low: { tone: "muted", label: "Low" },
};

export function ActionQueue() {
  return (
    <Panel labelledBy="cc-queue-title">
      <PanelHeader
        id="cc-queue-title"
        title="Needs attention"
        subtitle={`${actionQueue.length} open items · illustrative`}
        action={
          <button type="button" className="text-xs font-semibold text-[var(--cc-accent)]">
            View all
          </button>
        }
      />
      <ul>
        {actionQueue.map((item) => {
          const meta = priorityMeta[item.priority];
          return (
            <li key={item.id} className="cc-hairline-top">
              <button
                type="button"
                className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-[var(--cc-subtle)]"
              >
                <Pill tone={meta.tone} className="shrink-0">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-current"
                  />
                  {meta.label}
                </Pill>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-[var(--cc-text)]">
                    {item.title}
                  </span>
                  <span className="block truncate text-xs text-[var(--cc-text-muted)]">
                    {item.context}
                  </span>
                </span>
                <span className="hidden shrink-0 text-[11px] font-medium text-[var(--cc-text-muted)] sm:block">
                  {item.due}
                </span>
                <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--cc-accent)]">
                  {item.actionLabel}
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
