import { Clock3 } from "lucide-react";

import { DashboardCommandActions } from "./DashboardCommandActions";

function formatUpdatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Updated just now";

  return `Updated ${date.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function CommandHeader({
  title,
  generatedAt,
}: {
  title: string;
  generatedAt: string;
}) {
  return (
    <section
      aria-labelledby="command-center-title"
      className="grid gap-5 border-b border-border/70 pb-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"
    >
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
          Admin command center
        </div>
        <h1
          id="command-center-title"
          className="text-balance text-[28px] font-semibold leading-[1.15] tracking-[-0.035em] text-foreground sm:text-[32px]"
        >
          {title}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          <p className="text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening at PurpleSoftHub.
          </p>
          <time
            dateTime={generatedAt}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            {formatUpdatedAt(generatedAt)}
          </time>
        </div>
      </div>

      <DashboardCommandActions />
    </section>
  );
}
