import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { formatCount } from "@/lib/admin/dashboard";
import { cn } from "@/lib/utils";

/**
 * One Business Pulse KPI card. `value: null` renders an honest dash — a metric
 * whose query failed is never replaced with a made-up number.
 */
export function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  href,
}: {
  label: string;
  value: number | null;
  note?: string;
  icon: LucideIcon;
  href?: string;
}) {
  const body = (
    <>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          {formatCount(value)}
        </p>
        {note ? <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{note}</p> : null}
      </div>
    </>
  );

  const classes = cn(
    "flex items-center gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-none transition-colors",
    href && "hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {body}
      </Link>
    );
  }

  return <div className={classes}>{body}</div>;
}