import Link from "next/link";

import { formatCount, projectStatusLabel, type ProjectsData } from "@/lib/admin/dashboard";
import { cn } from "@/lib/utils";

import { EmptyLine, SectionTitle, UnavailableLine } from "./shared";

const SEGMENT_TONE: Record<string, string> = {
  pending: "bg-muted-foreground/35",
  in_progress: "bg-primary",
  completed: "bg-emerald-500",
  on_hold: "bg-amber-500",
  cancelled: "bg-muted-foreground/20",
};

/**
 * Projects — one segmented status bar instead of a donut chart, with counts as
 * plain inline text. Upcoming deadlines (real `end_date` values) sit beneath.
 */
export function ProjectsPanel({ projects }: { projects: ProjectsData }) {
  const segments = projects.byStatus.filter((row) => row.count > 0);

  return (
    <section aria-labelledby="projects-title">
      <SectionTitle
        id="projects-title"
        title="Projects"
        action={
          <Link
            href="/admin/projects"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View all
          </Link>
        }
      />

      <div className="mt-3 border-t border-border/70 pt-3">
        {projects.status === "unavailable" ? (
          <UnavailableLine label="Project data" />
        ) : projects.total === 0 ? (
          <EmptyLine>No projects yet.</EmptyLine>
        ) : (
          <>
            <div
              className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted"
              role="img"
              aria-label={segments
                .map((row) => `${row.label}: ${row.count}`)
                .join(", ")}
            >
              {segments.map((row) => (
                <span
                  key={row.status}
                  className={cn("h-full", SEGMENT_TONE[row.status] ?? "bg-primary/50")}
                  style={{ width: `${(row.count / Math.max(projects.total, 1)) * 100}%` }}
                />
              ))}
            </div>

            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {segments.map((row, index) => (
                <span key={row.status}>
                  {index > 0 ? " · " : ""}
                  <span className="font-semibold tabular-nums text-foreground">{row.count}</span>{" "}
                  {row.label.toLowerCase()}
                </span>
              ))}
              {" · "}
              {formatCount(projects.total)} total
            </p>

            {projects.upcomingDeadlines.length > 0 ? (
              <ul className="mt-3 divide-y divide-border/60 border-t border-border/60">
                {projects.upcomingDeadlines.slice(0, 3).map((deadline) => (
                  <li
                    key={deadline.id}
                    className="flex items-baseline justify-between gap-3 py-2"
                  >
                    <span className="min-w-0 truncate text-[13px] leading-5 text-foreground">
                      {deadline.title}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {deadline.daysUntil <= 0 ? "Due today" : `${deadline.daysUntil}d left`} ·{" "}
                      {projectStatusLabel(deadline.status)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}