import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Shared bits for the Admin Overview, rendered in the Command Center
 * visual language (`--cc-*` tokens from app/styles/command-center.css).
 */

/**
 * Section heading for the overview. Panel-less sections (Signals) use this so
 * the page keeps a quiet hierarchy without carding every fragment.
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
      <h2 id={id} className="cc-display text-[15px] font-semibold leading-6 text-[var(--cc-text)]">
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
  return (
    <p className="text-[13px] leading-5 text-[var(--cc-text-muted)]">{children}</p>
  );
}

/**
 * Localized failure line — one section's query failed, the rest of the
 * dashboard keeps working. Never renders raw errors.
 */
export function UnavailableLine({ label }: { label: string }) {
  return (
    <p role="status" className="text-[13px] leading-5 text-[var(--cc-text-muted)]">
      {label} is temporarily unavailable. Try refreshing shortly.
    </p>
  );
}

/** Accent text link used for "View all"-style section actions. */
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
      className="text-xs font-semibold text-[var(--cc-accent)] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-accent)]"
    >
      {children}
    </a>
  );
}

/**
 * Honest renderer for a currency-separated amount list. Never sums different
 * currencies together and never invents an exchange rate.
 */
export function CurrencyLine({
  totals,
  format,
  emptyLabel = "Nothing outstanding",
}: {
  totals: { currency: string; amount: number }[];
  format: (amount: number, currency: string) => string;
  emptyLabel?: string;
}) {
  if (totals.length === 0) {
    return <p className="text-sm font-semibold text-[var(--cc-text)]">{emptyLabel}</p>;
  }

  return (
    <p className="cc-display cc-tnum text-[20px] font-semibold leading-7 text-[var(--cc-text)]">
      {totals.map((total) => format(total.amount, total.currency)).join("  ·  ")}
    </p>
  );
}
