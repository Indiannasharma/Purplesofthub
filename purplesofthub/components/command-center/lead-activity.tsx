"use client";

import { leadsActivity, type LeadRow } from "@/lib/command-center/mock-data";
import { Initials, Panel, PanelHeader, Pill, type PillTone } from "./primitives";

/** Recent client & lead activity — illustrative data. */

const statusMeta: Record<LeadRow["status"], { tone: PillTone; label: string }> = {
  new: { tone: "accent", label: "New" },
  contacted: { tone: "info", label: "Contacted" },
  qualified: { tone: "success", label: "Qualified" },
};

export function LeadActivity() {
  return (
    <Panel labelledBy="cc-leads-title">
      <PanelHeader
        id="cc-leads-title"
        title="Clients & leads"
        subtitle="Latest inbound interest · illustrative"
        action={
          <button type="button" className="text-xs font-semibold text-[var(--cc-accent)]">
            All leads
          </button>
        }
      />
      <ul>
        {leadsActivity.map((lead) => {
          const meta = statusMeta[lead.status];
          return (
            <li key={lead.id} className="cc-hairline-top">
              <button
                type="button"
                className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-[var(--cc-subtle)]"
              >
                <Initials name={lead.name} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-[var(--cc-text)]">
                    {lead.name}
                  </span>
                  <span className="block truncate text-xs text-[var(--cc-text-muted)]">
                    {lead.interest} · {lead.source}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <Pill tone={meta.tone}>{meta.label}</Pill>
                  <span className="text-[10px] text-[var(--cc-text-muted)]">{lead.time}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
