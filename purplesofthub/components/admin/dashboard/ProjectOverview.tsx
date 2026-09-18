import { formatCount, projectStatusLabel, type ProjectsData } from "@/lib/admin/dashboard";
import { cn } from "@/lib/utils";

import { DonutChart } from "./charts";
import { DashboardCard, DashboardCardHeader, EmptyState, UnavailableNotice } from "./shared";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-slate-400",
  in_progress: "bg-primary",
  completed: "bg-emerald-500",
  on_hold: "bg-amber-500",
  cancelled: "bg-muted-foreground/40",
};

/**
 * Project / Work Overview — donut + textual legend (status is never color-only)
 * + upcoming deadlines from the real `end_date` field.
 */
export function ProjectOverview({ projects }: { projects: ProjectsData }) {
  if (projects.status === "unavailable") {
    return (
      <DashboardCard>
        <DashboardCardHeader title="Projects" description="Work across the studio" />
        <UnavailableNotice label="Project data" />
      </DashboardCard>
    );
  }

  const chartData = projects.byStatus.map((row) => ({
    label: row.label,
    value: row.count,
  }));

  return (
    <DashboardCard>
      <DashboardCardHeader
        title="Projects"
        description={
          projects.total !== undefined
            ? `${formatCount(projects.total)} projects · ${formatCount(projects.active)} active`
            : "Work across the studio"
        }
      />

      {projects.byStatus.length === 0 ? (
        <EmptyState title="No projects yet" description="Projects will appear here as they are created." />
      ) : (
        <div className="grid gap-2 px-2 pb-2 sm:grid-cols-[minmax(0,1fr)_180px] sm:items-center">
          <div className="min-w-0">
            <DonutChart data={chartData} />
          </div>
          <ul className="grid gap-1.5 px-3 pb-4 sm:pb-0" aria-label="Project status breakdown">
            {projects.byStatus.map((row) => (
              <li key={row.status} className="flex items-center gap-2 text-sm">
                <span
                  className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_COLORS[row.status] ?? "bg-primary/60")}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{row.label}</span>
                <span className="shrink-0 font-semibold tabular-nums text-foreground">
                  {row.count}
                </span>
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
            {projects.upcomingDeadlines.slice(0, 4).map((deadline) => (
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