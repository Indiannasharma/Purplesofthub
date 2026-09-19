import * as React from "react";
import { AlertCircle, Inbox } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
} from "@/components/ui/Card";
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
    <CardHeader
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 space-y-0 p-5 pb-3",
        className
      )}
    >
      <div className="min-w-0">
        <h2 className="text-sm font-semibold leading-5 tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <CardDescription className="mt-0.5 text-xs leading-4 text-muted-foreground">
            {description}
          </CardDescription>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </CardHeader>
  );
}

/**
 * Localized failure state — used when a single section's query failed so the
 * rest of the dashboard keeps working (failure isolation).
 */
export function UnavailableNotice({ label, className }: { label: string; className?: string }) {
  return (
    <div
      role="status"
      className={cn(
        "mx-5 mb-5 flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/[0.07] px-3 py-2.5",
        className
      )}
    >
      <AlertCircle
        className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
        aria-hidden="true"
      />
      <div>
        <p className="text-sm font-medium text-foreground">Temporarily unavailable</p>
        <p className="mt-0.5 text-xs leading-4 text-muted-foreground">
          {label} could not be loaded safely. Try refreshing shortly.
        </p>
      </div>
    </div>
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
    <div
      className={cn(
        "mx-5 mb-5 flex items-start gap-2.5 rounded-lg bg-muted/55 px-3 py-2.5",
        className
      )}
    >
      <Inbox
        className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description ? (
          <p className="mt-0.5 text-xs leading-4 text-muted-foreground">{description}</p>
        ) : null}
      </div>
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
    <Card
      className={cn(
        "min-w-0 gap-0 overflow-hidden rounded-xl border-border/70 bg-card py-0 shadow-[0_1px_2px_rgba(15,23,42,0.035)]",
        className
      )}
    >
      {children}
    </Card>
  );
}
