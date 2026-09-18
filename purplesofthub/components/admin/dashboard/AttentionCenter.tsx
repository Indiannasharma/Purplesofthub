import Link from "next/link";
import { AlertTriangle, CalendarClock, FileText, FolderKanban, Inbox, UserPlus } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import type { AttentionData, AttentionKind } from "@/lib/admin/dashboard";
import { cn } from "@/lib/utils";

import { DashboardCard, DashboardCardHeader, EmptyState } from "./shared";

const KIND_ICONS: Record<AttentionKind, typeof Inbox> = {
  invoice: FileText,
  project: FolderKanban,
  lead: UserPlus,
  recovery: AlertTriangle,
  content: FileText,
};

const SEVERITY_STYLES: Record<string, string> = {
  critical: "border-destructive/40 bg-destructive/10 text-destructive",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  info: "border-border bg-muted text-muted-foreground",
};

/**
 * Needs Attention — deterministic operational queue. Every item is derived
 * from a real rule (overdue invoice, uncontacted lead, upcoming deadline,
 * pending recovery, draft content). Nothing is fabricated.
 */
export function AttentionCenter({ attention }: { attention: AttentionData }) {
  return (
    <DashboardCard>
      <DashboardCardHeader
        title="Needs attention"
        description="Deterministic operational queue — highest severity first"
        action={
          attention.truncated ? (
            <Badge variant="outline" className="text-[11px]">
              + more
            </Badge>
          ) : undefined
        }
      />

      {attention.items.length === 0 ? (
        <EmptyState
          title="Nothing needs attention"
          description="No overdue invoices, uncontacted leads, or open recovery requests."
        />
      ) : (
        <ul className="mt-3 divide-y divide-border/60">
          {attention.items.map((item) => {
            const Icon = KIND_ICONS[item.kind] ?? Inbox;
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
                      SEVERITY_STYLES[item.severity]
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {item.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex items-center gap-1.5 border-t border-border/60 px-5 py-2.5 text-[11px] text-muted-foreground">
        <CalendarClock className="h-3 w-3" aria-hidden="true" />
        Deterministic rules only — no AI heuristics.
      </div>
    </DashboardCard>
  );
}