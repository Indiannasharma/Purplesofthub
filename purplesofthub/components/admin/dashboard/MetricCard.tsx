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
  tone = "primary",
}: {
  label: string;
  value: number | null;
  note?: string;
  icon: LucideIcon;
  href?: string;
  tone?: "primary" | "sky" | "emerald" | "amber";
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    sky: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  };

  const body = (
    <>
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", tones[tone])}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold leading-none tracking-tight text-foreground tabular-nums">
          {formatCount(value)}
        </p>
        {note ? <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{note}</p> : null}
      </div>
    </>
  );

  const classes = cn(
    "flex min-h-[88px] items-center gap-3 rounded-xl border border-border/70 bg-card p-4 text-card-foreground shadow-[0_1px_2px_rgba(15,23,42,0.035)] transition-[border-color,box-shadow,transform]",
    href && "hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
