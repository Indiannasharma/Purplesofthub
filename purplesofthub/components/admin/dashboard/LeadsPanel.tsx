import Link from "next/link";

import type { LeadsData } from "@/lib/admin/dashboard";
import { leadSourceLabel } from "@/lib/admin/dashboard";
import { Panel, PanelHeader } from "@/components/command-center/primitives";

import { EmptyLine, UnavailableLine } from "./shared";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}
/**
 * Leads — pipeline health at a glance: awaiting-contact count, real service
 * interest distribution, and the most recent enquiries (names only; contact
 * details stay in the Leads module).
 */
export function LeadsPanel({ leads }: { leads: LeadsData }) {
  const maxService = leads.topServices[0]?.count ?? 0;

  return (
    <Panel labelledBy="leads-title">
      <PanelHeader
        id="leads-title"
        title="Leads"
        subtitle={leadSourceLabel(leads.source)}
        action={
          <Link
            href="/admin/leads"
            className="text-xs font-semibold text-[var(--cc-accent)] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-accent)]"
          >
            View all
          </Link>
        }
      />

      <div className="border-t border-[var(--cc-border)] px-5 py-4">
        {leads.status === "unavailable" ? (
          <UnavailableLine label="Lead data" />
        ) : leads.total === 0 ? (
          <EmptyLine>No leads yet.</EmptyLine>
        ) : (
          <>
            <p className="text-xs leading-5 text-[var(--cc-text-muted)]">
              <span className="cc-tnum font-semibold text-[var(--cc-text)]">{leads.newCount}</span>{" "}
              awaiting contact · {leads.total} total
            </p>

            {leads.topServices.length > 0 ? (
              <ul className="mt-3 grid gap-1.5" aria-label="Top service interest">
                {leads.topServices.slice(0, 4).map((service) => (
                  <li
                    key={service.label}
                    className="flex items-center gap-2.5 text-xs leading-4"
                  >
                    <span
                      aria-hidden="true"
                      className="h-1 shrink-0 rounded-full bg-[var(--cc-chart-1)]"
                      style={{
                        width: `${maxService > 0 ? Math.max(6, (service.count / maxService) * 40) : 0}px`,
                      }}
                    />
                    <span className="min-w-0 flex-1 truncate text-[var(--cc-text-muted)]">
                      {service.label}
                    </span>
                    <span className="cc-tnum shrink-0 font-semibold text-[var(--cc-text)]">
                      {service.count}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}

            {leads.recent.length > 0 ? (
              <ul className="mt-3 divide-y divide-[var(--cc-border)] border-t border-[var(--cc-border)] pt-1">
                {leads.recent.slice(0, 4).map((lead) => (
                  <li key={lead.id} className="flex items-baseline justify-between gap-3 py-2">
                    <span className="min-w-0 truncate text-[13px] leading-5 text-[var(--cc-text)]">
                      {lead.name}
                      <span className="text-[var(--cc-text-muted)]">
                        {" "}
                        · {lead.service ?? "General enquiry"}
                      </span>
                    </span>
                    <span className="cc-tnum shrink-0 text-[11px] text-[var(--cc-text-muted)]">
                      {formatDate(lead.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        )}
      </div>
    </Panel>
  );
}
