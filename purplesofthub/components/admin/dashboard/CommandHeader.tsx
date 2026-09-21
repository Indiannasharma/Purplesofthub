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
      aria-labelledby="overview-title"
      className="grid gap-4 border-b border-border/70 pb-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"
    >
      <div className="min-w-0">
        <h1
          id="overview-title"
          className="text-balance text-[24px] font-semibold leading-[1.15] tracking-[-0.035em] text-foreground sm:text-[28px]"
        >
          {title}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          <p className="text-sm text-muted-foreground">
            A clear view of the studio right now.
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
