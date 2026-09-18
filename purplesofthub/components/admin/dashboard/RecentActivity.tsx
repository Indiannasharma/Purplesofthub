import { AlertTriangle, CreditCard, FilePlus, FolderPlus, Music4, UserCheck } from "lucide-react";

import type { ActivityData } from "@/lib/admin/dashboard";
import { cn } from "@/lib/utils";

import { DashboardCard, DashboardCardHeader, EmptyState, UnavailableNotice } from "./shared";

const TYPE_ICONS: Record<string, typeof CreditCard> = {
  payment: CreditCard,
  signup: UserCheck,
  project: FolderPlus,
  music_campaign: Music4,
  recovery: AlertTriangle,
  general: FilePlus,
};

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
 * Recent Activity — consumes the real `notifications` rows the bell already
 * subscribes to, reusing existing architecture instead of inventing a new
 * activity-log system.
 */
export function RecentActivity({ activity }: { activity: ActivityData }) {
  if (activity.status === "unavailable") {
    return (
      <DashboardCard>
        <DashboardCardHeader title="Recent activity" description="From studio notifications" />
        <UnavailableNotice label="Activity" />
      </DashboardCard>
    );
  }

  return (
    <DashboardCard>
      <DashboardCardHeader title="Recent activity" description="From studio notifications" />

      {activity.items.length === 0 ? (
        <EmptyState title="No recent activity" description="Events from across the studio will appear here." />
      ) : (
        <ul className="mt-2 divide-y divide-border/50">
          {activity.items.map((item) => {
            const Icon = TYPE_ICONS[item.type] ?? FilePlus;
            return (
              <li key={item.id} className="flex items-start gap-3 px-5 py-3">
                <span
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
                    "border-border bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                  {item.message ? (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.message}</p>
                  ) : null}
                </div>
                <time className="shrink-0 text-[11px] text-muted-foreground" dateTime={item.createdAt}>
                  {formatWhen(item.createdAt)}
                </time>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardCard>
  );
}