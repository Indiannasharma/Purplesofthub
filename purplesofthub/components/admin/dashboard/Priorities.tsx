import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { AttentionData, AttentionItem } from "@/lib/admin/dashboard";
import { Panel, PanelHeader, Pill, type PillTone } from "@/components/command-center/primitives";

import { EmptyLine } from "./shared";

const SEVERITY_TONE: Record<AttentionItem["severity"], PillTone> = {
  critical: "error",
  warning: "warning",
  info: "muted",
};

const KIND_LABEL: Record<AttentionItem["kind"], string> = {
  invoice: "Invoice",
  project: "Project",
  lead: "Lead",
  recovery: "Recovery",
  content: "Content",
};

/**
 * Needs attention — the real, deterministic work queue as a scannable list.
 * Severity drives the pill tone; the pill text stays factual (the owning
 * module) so nothing is invented about urgency. Every row links into the
 * module that owns the item.
 */
export function Priorities({ attention }: { attention: AttentionData }) {
  const heading =
    attention.items.length > 0
      ? `Needs attention · ${attention.items.length}${attention.truncated ? "+" : ""}`
      : "Needs attention";

  return (
    <Panel labelledBy="priorities-title">
      <PanelHeader id="priorities-title" title={heading} subtitle="Real queue, newest first" />

      <div className="border-t border-[var(--cc-border)] px-5 py-4">
        {attention.items.length === 0 ? (
          <EmptyLine>Nothing needs attention right now.</EmptyLine>
        ) : (
          <ul className="divide-y divide-[var(--cc-border)]">
            {attention.items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="group flex items-center gap-3 py-2.5 first:pt-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-accent)]"
                >
                  <Pill tone={SEVERITY_TONE[item.severity]} className="shrink-0">
                    {KIND_LABEL[item.kind]}
                  </Pill>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium leading-5 text-[var(--cc-text)]">
                      {item.title}
                    </span>
                    <span className="block truncate text-xs leading-4 text-[var(--cc-text-muted)]">
                      {item.description}
                    </span>
                  </span>

                  <ArrowUpRight
                    className="h-3.5 w-3.5 shrink-0 text-[var(--cc-text-muted)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Panel>
  );
}
