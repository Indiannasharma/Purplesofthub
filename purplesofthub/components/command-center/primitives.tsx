import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Original Command Center primitives — Phase 1 design preview only. */

export type PillTone =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "accent"
  | "muted";

const toneClass: Record<PillTone, string> = {
  success: "cc-pill-success",
  warning: "cc-pill-warning",
  error: "cc-pill-error",
  info: "cc-pill-info",
  accent: "cc-pill-accent",
  muted: "cc-pill-muted",
};

export function Pill({
  tone = "muted",
  children,
  className,
}: {
  tone?: PillTone;
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn("cc-pill", toneClass[tone], className)}>{children}</span>;
}

export function Panel({
  children,
  className,
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  labelledBy?: string;
}) {
  return (
    <section aria-labelledby={labelledBy} className={cn("cc-panel", className)}>
      {children}
    </section>
  );
}

export function PanelHeader({
  id,
  title,
  subtitle,
  action,
}: {
  id: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4 px-5 pt-4 pb-3">
      <div className="min-w-0">
        <h2
          id={id}
          className="cc-display text-[15px] font-semibold leading-6 text-[var(--cc-text)]"
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-[var(--cc-text-muted)]">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}

/** Initials avatar chip — no real user photos in the prototype. */
export function Initials({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
        "bg-[var(--cc-accent-soft)] text-[11px] font-semibold text-[var(--cc-accent)]",
        className
      )}
    >
      {initials}
    </span>
  );
}
