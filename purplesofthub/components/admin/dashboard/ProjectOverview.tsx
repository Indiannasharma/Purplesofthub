import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { formatCount, projectStatusLabel, type ProjectsData } from "@/lib/admin/dashboard";
import { cn } from "@/lib/utils";

import { DashboardCard, DashboardCardHeader, EmptyState, UnavailableNotice } from "./shared";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-slate-400",
  in_progress: "bg-primary",
  completed: "bg-emerald-500",
  on_hold: "bg-amber-500",
  cancelled: "bg-muted-foreground/40",
};

/** Compact project distribution and real upcoming deadlines. */
export function ProjectOverview({ projects }: { projects: ProjectsData }) {
  if (projects.status === "unavailable") {
    return (
      <DashboardCard>
        <DashboardCardHeader title="Project snapshot" description="Work across the studio" />
        <UnavailableNotice label="Project data" />
      </DashboardCard>
    );
  }

  const largestStatus = Math.max(...projects.byStatus.map((row) => row.count), 1);

  return (
    <DashboardCard>
      <DashboardCardHeader
        title="Project snapshot"
        description={`${formatCount(projects.total)} projects · ${formatCount(projects.active)} active`}
        action={
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View all
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        }
      />

      {projects.byStatus.length === 0 ? (
        <EmptyState title="No projects yet" description="Projects will appear here as they are created." />
      ) : (
        <div className="px-5 pb-4">
          <ul className="grid gap-3" aria-label="Project status breakdown">
            {projects.byStatus.map((row) => (
              <li key={row.status}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                  <span className="truncate text-muted-foreground">{row.label}</span>
                  <span className="font-semibold tabular-nums text-foreground">{row.count}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                  <div
                    className={cn("h-full rounded-full", STATUS_COLORS[row.status] ?? "bg-primary/60")}
                    style={{ width: `${Math.max(8, (row.count / largestStatus) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {projects.upcomingDeadlines.length > 0 ? (
        <div className="border-t border-border/60">
          <p className="px-5 pt-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Upcoming deadlines
          </p>
          <ul className="divide-y divide-border/50">
            {projects.upcomingDeadlines.slice(0, 3).map((deadline) => (
              <li key={deadline.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                <span className="min-w-0 truncate text-sm text-foreground">{deadline.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {deadline.daysUntil <= 0 ? "Today" : `${deadline.daysUntil}d`} ·{" "}
                  {projectStatusLabel(deadline.status)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </DashboardCard>
  );
}
