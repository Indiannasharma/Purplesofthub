import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Section heading for the overview. Plain typography, no card chrome —
 * information is grouped through spacing and hairline rules instead.
 */
export function SectionTitle({
  id,
  title,
  action,
  className,
}: {
  id?: string;
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-3", className)}>
      <h2 id={id} className="text-xs font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      {action}
    </div>
  );
}

/**
 * Single-line empty state. Empty data must never create empty dashboard real
 * estate — one muted line replaces the whole section body.
 */
export function EmptyLine({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] leading-5 text-muted-foreground">{children}</p>;
}

/**
 * Localized failure line — one section's query failed, the rest of the
 * dashboard keeps working. Never renders raw errors.
 */
export function UnavailableLine({ label }: { label: string }) {
  return (
    <p role="status" className="text-[13px] leading-5 text-muted-foreground">
      {label} is temporarily unavailable. Try refreshing shortly.
    </p>
  );
}

/** Text link used for "View all"-style section actions. */
export function SectionLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </a>
  );
}