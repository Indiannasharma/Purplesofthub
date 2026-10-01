import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type WorkspaceKind = "customer" | "admin";

/** Composition only: authentication and the viewport scroll owner stay in route layouts. */
export function WorkspaceRoot({ kind, children, className }: { kind: WorkspaceKind; children: ReactNode; className?: string }) {
  return <div data-workspace-kind={kind} className={cn("cc-root cc-theme-site workspace-root", className)}>{children}</div>;
}

export function WorkspacePage({ kind = "admin", className, children }: { kind?: WorkspaceKind; className?: string; children: ReactNode }) {
  return <div className={cn(kind === "admin" ? "admin-page mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-4 py-5 pb-24 sm:px-6 sm:py-6 sm:pb-24 lg:px-8" : "ws-page ws-page-customer", className)}>{children}</div>;
}

export function WorkspaceActions({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("ws-actions flex flex-wrap items-center gap-2", className)}>{children}</div>;
}

export function WorkspaceSectionHeader({ title, description, actions, id }: { title: string; description?: string; actions?: ReactNode; id?: string }) {
  return <div className="ws-section-header"><div className="min-w-0"><h2 id={id}>{title}</h2>{description ? <p>{description}</p> : null}</div>{actions ? <WorkspaceActions>{actions}</WorkspaceActions> : null}</div>;
}
