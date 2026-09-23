import type { ActivityData } from "@/lib/admin/dashboard";

import { EmptyLine, SectionTitle, UnavailableLine } from "./shared";

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

/**
 * Recent activity — the real notifications feed, rendered as a quiet log.
 * No icon tiles; the text and timestamp carry the information.
 */
export function ActivityPanel({ activity }: { activity: ActivityData }) {
  return (
    <section aria-labelledby="activity-title">
      <SectionTitle id="activity-title" title="Recent activity" />

      <div className="mt-3 border-t border-border/70 pt-3">
        {activity.status === "unavailable" ? (
          <UnavailableLine label="Activity" />
        ) : activity.items.length === 0 ? (
          <EmptyLine>No recent activity.</EmptyLine>
        ) : (
          <ul className="divide-y divide-border/60">
            {activity.items.map((item) => (
              <li key={item.id} className="flex items-baseline justify-between gap-4 py-2.5">
                <span className="min-w-0">
                  <span className="text-[13px] font-medium leading-5 text-foreground">
                    {item.title}
                  </span>
                  {item.message ? (
                    <span className="block truncate text-xs leading-4 text-muted-foreground">
                      {item.message}
                    </span>
                  ) : null}
                </span>
                <time
                  dateTime={item.createdAt}
                  className="shrink-0 text-[11px] tabular-nums text-muted-foreground"
                >
                  {formatWhen(item.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}