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
 * Compact command header. The greeting is a page title, not a hero — roughly
 * body-scale, with context kept on one inline muted row.
 */
export function CommandHeader({
  title,
  generatedAt,
}: {
  title: string;
  generatedAt: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <h1 className="text-[15px] font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-xs text-muted-foreground">
          Studio overview ·{" "}
          <time dateTime={generatedAt}>{formatUpdatedAt(generatedAt)}</time>
        </p>
      </div>

      <DashboardCommandActions />
    </div>
  );
}