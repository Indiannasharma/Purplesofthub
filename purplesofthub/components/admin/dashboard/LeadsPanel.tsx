import Link from "next/link";

import type { LeadsData } from "@/lib/admin/dashboard";
import { leadSourceLabel } from "@/lib/admin/dashboard";

import { EmptyLine, SectionTitle, UnavailableLine } from "./shared";

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
    <section aria-labelledby="leads-title">
      <SectionTitle
        id="leads-title"
        title="Leads"
        action={
          <Link
            href="/admin/leads"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View all
          </Link>
        }
      />

      <div className="mt-3 border-t border-border/70 pt-3">
        {leads.status === "unavailable" ? (
          <UnavailableLine label="Lead data" />
        ) : leads.total === 0 ? (
          <EmptyLine>No leads yet.</EmptyLine>
        ) : (
          <>
            <p className="text-xs leading-5 text-muted-foreground">
              <span className="font-semibold tabular-nums text-foreground">{leads.newCount}</span>{" "}
              awaiting contact · {leads.total} total · {leadSourceLabel(leads.source)}
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
                      className="h-1 shrink-0 rounded-full bg-primary/60"
                      style={{
                        width: `${maxService > 0 ? Math.max(6, (service.count / maxService) * 40) : 0}px`,
                      }}
                    />
                    <span className="min-w-0 flex-1 truncate text-muted-foreground">
                      {service.label}
                    </span>
                    <span className="shrink-0 font-medium tabular-nums text-foreground">
                      {service.count}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}

            {leads.recent.length > 0 ? (
              <ul className="mt-3 divide-y divide-border/60 border-t border-border/60">
                {leads.recent.slice(0, 4).map((lead) => (
                  <li key={lead.id} className="flex items-baseline justify-between gap-3 py-2">
                    <span className="min-w-0 truncate text-[13px] leading-5 text-foreground">
                      {lead.name}
                      <span className="text-muted-foreground">
                        {" "}
                        · {lead.service ?? "General enquiry"}
                      </span>
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatDate(lead.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}