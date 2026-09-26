"use client";

import { activityTimeline, type ActivityKind } from "@/lib/command-center/mock-data";
import { Panel, PanelHeader } from "./primitives";

/** Recent activity timeline — illustrative data. */

const kindColor: Record<ActivityKind, string> = {
  payment: "var(--cc-success)",
  client: "var(--cc-accent)",
  project: "var(--cc-info)",
  content: "var(--cc-warning)",
  system: "var(--cc-text-muted)",
};

export function ActivityTimeline() {
  return (
    <Panel labelledBy="cc-activity-title">
      <PanelHeader
        id="cc-activity-title"
        title="Recent activity"
        subtitle="Studio-wide events · illustrative"
        action={
          <button type="button" className="text-xs font-semibold text-[var(--cc-accent)]">
            Full log
          </button>
        }
      />
      <ol className="px-5 pb-4">
        {activityTimeline.map((event, index) => (
          <li key={event.id} className="relative flex gap-3.5 pb-4 last:pb-0">
            {/* Rail */}
            {index < activityTimeline.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute left-[5px] top-4 h-full w-px bg-[var(--cc-border)]"
              />
            )}
            <span
              aria-hidden="true"
              className="mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-[var(--cc-surface)]"
              style={{ background: kindColor[event.kind] }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="truncate text-[13px] font-medium text-[var(--cc-text)]">
                  {event.title}
                </p>
                <time className="cc-tnum shrink-0 text-[11px] text-[var(--cc-text-muted)]">
                  {event.time}
                </time>
              </div>
              <p className="mt-0.5 truncate text-xs text-[var(--cc-text-muted)]">{event.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
