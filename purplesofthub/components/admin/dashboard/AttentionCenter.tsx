import Link from "next/link";
import { AlertTriangle, ArrowUpRight, FileText, FolderKanban, Inbox, UserPlus } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import type { AttentionData, AttentionKind } from "@/lib/admin/dashboard";
import { cn } from "@/lib/utils";

import { EmptyState } from "./shared";

const KIND_ICONS: Record<AttentionKind, typeof Inbox> = {
  invoice: FileText,
  project: FolderKanban,
  lead: UserPlus,
  recovery: AlertTriangle,
  content: FileText,
};

const SEVERITY_STYLES: Record<string, string> = {
  critical: "border-destructive/30 bg-destructive/10 text-destructive",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  info: "border-border bg-muted text-muted-foreground",
};

export function AttentionCenter({ attention }: { attention: AttentionData }) {
  return (
    <aside className={cn("admin-attention rounded-2xl border border-border/80 bg-card p-2", attention.items.length > 0 && "h-full")}>
      <div className="flex items-start justify-between gap-3 px-3 pb-2 pt-2">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Priorities</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">What needs a decision next</p>
        </div>
        {attention.truncated ? <Badge variant="outline" className="text-[11px]">+ more</Badge> : null}
      </div>

      {attention.items.length === 0 ? (
        <EmptyState
          title="Nothing needs attention"
          description="No overdue invoices, uncontacted leads, or open recovery requests."
        />
      ) : (
        <ul className="divide-y divide-border/60">
          {attention.items.map((item) => {
            const Icon = KIND_ICONS[item.kind] ?? Inbox;
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="group flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  <span className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border", SEVERITY_STYLES[item.severity])}>
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">{item.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
                  </span>
                  <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
