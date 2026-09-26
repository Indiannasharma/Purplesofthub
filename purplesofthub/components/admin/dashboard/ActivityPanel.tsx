import type { ActivityData } from "@/lib/admin/dashboard";
import { Panel, PanelHeader } from "@/components/command-center/primitives";

import { EmptyLine, UnavailableLine } from "./shared";

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

/** Marker colour per notification type — presentation only. */
const TYPE_COLOR: Record<string, string> = {
  payment: "var(--cc-success)",
  signup: "var(--cc-accent)",
  recovery: "var(--cc-warning)",
  project: "var(--cc-info)",
  music_campaign: "var(--cc-chart-3)",
};

/**
 * Recent activity — the real notifications feed rendered as a quiet timeline.
 * Timestamps come from the row's own `created_at`; nothing is synthesised.
 */
export function ActivityPanel({ activity }: { activity: ActivityData }) {
  return (
    <Panel labelledBy="activity-title">
      <PanelHeader id="activity-title" title="Recent activity" subtitle="Studio-wide events" />

      <div className="border-t border-[var(--cc-border)] px-5 py-4">
        {activity.status === "unavailable" ? (
          <UnavailableLine label="Activity" />
        ) : activity.items.length === 0 ? (
          <EmptyLine>No recent activity.</EmptyLine>
        ) : (
          <ol>
            {activity.items.map((item, index) => (
              <li key={item.id} className="relative flex gap-3.5 pb-4 last:pb-0">
                {index < activity.items.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-[5px] top-4 h-full w-px bg-[var(--cc-border)]"
                  />
                ) : null}

                <span
                  aria-hidden="true"
                  className="mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-[var(--cc-surface)]"
                  style={{ background: TYPE_COLOR[item.type] ?? "var(--cc-text-muted)" }}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-[13px] font-medium text-[var(--cc-text)]">
                      {item.title}
                    </p>
                    <time
                      dateTime={item.createdAt}
                      className="cc-tnum shrink-0 text-[11px] text-[var(--cc-text-muted)]"
                    >
                      {formatWhen(item.createdAt)}
                    </time>
                  </div>
                  {item.message ? (
                    <p className="mt-0.5 truncate text-xs text-[var(--cc-text-muted)]">
                      {item.message}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Panel>
  );
}
