import Link from "next/link";

import { formatCount, projectStatusLabel, type ProjectsData } from "@/lib/admin/dashboard";
import { cn } from "@/lib/utils";
import { Panel, PanelHeader } from "@/components/command-center/primitives";

import { EmptyLine, UnavailableLine } from "./shared";

const SEGMENT_TONE: Record<string, string> = {
  pending: "bg-[var(--cc-text-muted)]/40",
  in_progress: "bg-[var(--cc-chart-1)]",
  completed: "bg-[var(--cc-success)]",
  on_hold: "bg-[var(--cc-chart-3)]",
  cancelled: "bg-[var(--cc-text-muted)]/20",
};

/**
 * Projects — one segmented status bar instead of a donut chart, with counts as
 * plain inline text. Upcoming deadlines (real `end_date` values) sit beneath.
 */
export function ProjectsPanel({ projects }: { projects: ProjectsData }) {
  const segments = projects.byStatus.filter((row) => row.count > 0);

  return (
    <Panel labelledBy="projects-title">
      <PanelHeader
        id="projects-title"
        title="Projects"
        subtitle={`${formatCount(projects.total)} total`}
        action={
          <Link
            href="/admin/projects"
            className="text-xs font-semibold text-[var(--cc-accent)] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-accent)]"
          >
            View all
          </Link>
        }
      />

      <div className="border-t border-[var(--cc-border)] px-5 py-4">
        {projects.status === "unavailable" ? (
          <UnavailableLine label="Project data" />
        ) : projects.total === 0 ? (
          <EmptyLine>No projects yet.</EmptyLine>
        ) : (
          <>
            <div
              className="cc-progress flex h-1.5 w-full overflow-hidden"
              role="img"
              aria-label={segments.map((row) => `${row.label}: ${row.count}`).join(", ")}
            >
              {segments.map((row) => (
                <span
                  key={row.status}
                  className={cn("h-full", SEGMENT_TONE[row.status] ?? "bg-[var(--cc-accent)]")}
                  style={{
                    width: `${(row.count / Math.max(projects.total, 1)) * 100}%`,
                    borderRadius: 0,
                  }}
                />
              ))}
            </div>

            <p className="mt-2 text-xs leading-5 text-[var(--cc-text-muted)]">
              {segments.map((row, index) => (
                <span key={row.status}>
                  {index > 0 ? " · " : ""}
                  <span className="cc-tnum font-semibold text-[var(--cc-text)]">{row.count}</span>{" "}
                  {row.label.toLowerCase()}
                </span>
              ))}
            </p>

            {projects.upcomingDeadlines.length > 0 ? (
              <ul className="mt-3 divide-y divide-[var(--cc-border)] border-t border-[var(--cc-border)] pt-1">
                {projects.upcomingDeadlines.slice(0, 3).map((deadline) => (
                  <li
                    key={deadline.id}
                    className="flex items-baseline justify-between gap-3 py-2"
                  >
                    <span className="min-w-0 truncate text-[13px] leading-5 text-[var(--cc-text)]">
                      {deadline.title}
                    </span>
                    <span className="cc-tnum shrink-0 text-[11px] text-[var(--cc-text-muted)]">
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
    </Panel>
  );
}
