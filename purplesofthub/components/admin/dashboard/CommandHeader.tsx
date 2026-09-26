import { DashboardCommandActions } from "./DashboardCommandActions";

function formatUpdatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Updated just now";

  return `Updated ${date.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

/**
 * Command header — greeting at Command Center display scale (22–26px), with
 * the generated timestamp on one quiet muted row beneath it. The header stays
 * un-panelled so the KPI strip below is the first surface.
 */
export function CommandHeader({
  title,
  generatedAt,
}: {
  title: string;
  generatedAt: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      <div className="min-w-0">
        <h1 className="cc-display text-[22px] font-semibold leading-8 text-[var(--cc-text)] sm:text-[26px]">
          {title}
        </h1>
        <p className="mt-1 text-[13px] text-[var(--cc-text-muted)]">
          Studio overview ·{" "}
          <time className="cc-tnum" dateTime={generatedAt}>
            {formatUpdatedAt(generatedAt)}
          </time>
        </p>
      </div>

      <DashboardCommandActions />
    </div>
  );
}
