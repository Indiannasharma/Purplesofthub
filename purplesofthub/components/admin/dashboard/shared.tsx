import * as React from "react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

/** Title/description pair shared by every Command Center card. */
export function DashboardCardHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-2 px-5 pt-5", className)}>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/**
 * Localized failure state — used when a single section's query failed so the
 * rest of the dashboard keeps working (failure isolation).
 */
export function UnavailableNotice({ label, className }: { label: string; className?: string }) {
  return (
    <p
      role="status"
      className={cn("px-5 pb-5 pt-2 text-sm text-muted-foreground", className)}
    >
      {label} is currently unavailable.
    </p>
  );
}

/** Concise empty state — no illustrations, no decoration. */
export function EmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("px-5 pb-6 pt-2", className)}>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

/** Shared card shell with consistent padding rhythm. */
export function DashboardCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn("min-w-0 gap-0 overflow-hidden rounded-xl py-0 shadow-none", className)}>
      {children}
    </Card>
  );
}