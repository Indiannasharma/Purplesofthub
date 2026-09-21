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
  className,
}: {
  label: string;
  value: number | null;
  note?: string;
  icon: LucideIcon;
  href?: string;
  tone?: "primary" | "sky" | "emerald" | "amber";
  className?: string;
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    sky: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  };

  const body = (
    <>
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", tones[tone])}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1.5 text-[26px] font-semibold leading-none tracking-[-0.03em] text-foreground tabular-nums">
          {formatCount(value)}
        </p>
        {note ? <p className="mt-1 truncate text-xs text-muted-foreground">{note}</p> : null}
      </div>
    </>
  );

  const classes = cn(
    "flex min-h-[86px] items-start gap-3 border-border/70 px-4 py-3.5 text-card-foreground transition-colors sm:px-5",
    href && "hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
    className
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
