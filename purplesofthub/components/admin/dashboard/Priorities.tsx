import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { AttentionData } from "@/lib/admin/dashboard";
import { cn } from "@/lib/utils";

import { EmptyLine, SectionTitle } from "./shared";

const SEVERITY_DOT: Record<string, string> = {
  critical: "bg-destructive",
  warning: "bg-amber-500",
  info: "bg-muted-foreground/40",
};

/**
 * Needs attention — the deterministic work queue, rendered as a scannable
 * hairline list. Severity is a dot, not a colored tile. Every row links into
 * the module that owns the item.
 */
export function Priorities({ attention }: { attention: AttentionData }) {
  return (
    <section aria-labelledby="priorities-title">
      <SectionTitle
        id="priorities-title"
        title={
          attention.items.length > 0
            ? `Needs attention · ${attention.items.length}${attention.truncated ? "+" : ""}`
            : "Needs attention"
        }
      />

      <div className="mt-3 border-t border-border/70 pt-3">
        {attention.items.length === 0 ? (
          <EmptyLine>Nothing needs attention right now.</EmptyLine>
        ) : (
          <ul className="divide-y divide-border/60">
            {attention.items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="group flex items-center gap-3 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      SEVERITY_DOT[item.severity] ?? SEVERITY_DOT.info
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="text-[13px] font-medium leading-5 text-foreground transition-colors group-hover:text-primary">
                      {item.title}
                    </span>
                    <span className="block truncate text-xs leading-4 text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}