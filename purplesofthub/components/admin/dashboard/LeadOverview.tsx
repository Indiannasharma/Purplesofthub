import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import type { LeadsData } from "@/lib/admin/dashboard";
import { leadSourceLabel } from "@/lib/admin/dashboard";

import { DashboardCard, DashboardCardHeader, EmptyState, UnavailableNotice } from "./shared";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

const STATUS_STYLES: Record<string, string> = {
  new: "border-primary/40 bg-primary/10 text-primary",
  contacted: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  converted: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  lost: "border-border bg-muted text-muted-foreground",
};

/**
 * Leads / Business Development — real `service_interest` totals, a bounded
 * recent list (never emails/phones on the Overview), and a link into the Leads
 * module. The source (contacts vs chat) is named so admins trust the number.
 */
export function LeadOverview({ leads }: { leads: LeadsData }) {
  if (leads.status === "unavailable") {
    return (
      <DashboardCard>
        <DashboardCardHeader title="Leads" description="Business development" />
        <UnavailableNotice label="Lead data" />
      </DashboardCard>
    );
  }

  const maxService = leads.topServices[0]?.count ?? 0;

  return (
    <DashboardCard>
      <DashboardCardHeader
        title="Leads"
        description={`${leadSourceLabel(leads.source)} · ${leads.total} total · ${leads.newCount} awaiting contact`}
        action={
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View all
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        }
      />

      {leads.total === 0 ? (
        <EmptyState
          title="No leads yet"
          description="Enquiries from the contact form and chat assistant will appear here."
        />
      ) : (
        <>
          {leads.topServices.length > 0 ? (
            <div className="px-5 pt-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Top service interest
              </p>
              <ul className="mt-2 grid gap-1.5">
                {leads.topServices.map((service) => (
                  <li key={service.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-1.5 rounded-full bg-primary/70"
                        style={{ width: `${maxService > 0 ? Math.max(8, (service.count / maxService) * 56) : 0}px` }}
                        aria-hidden="true"
                      />
                      <span className="truncate text-sm text-foreground">{service.label}</span>
                    </div>
                    <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                      {service.count}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {leads.recent.length > 0 ? (
            <div className="mt-3 border-t border-border/60">
              <p className="px-5 pt-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Recent
              </p>
              <ul className="divide-y divide-border/50">
                {leads.recent.map((lead) => (
                  <li key={lead.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {lead.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {lead.service ?? "General enquiry"} · {formatDate(lead.createdAt)}
                      </span>
                    </span>
                    {lead.statusLabel ? (
                      <Badge
                        variant="outline"
                        className={STATUS_STYLES[(lead.status ?? "").toLowerCase()] ?? undefined}
                      >
                        {lead.statusLabel}
                      </Badge>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </DashboardCard>
  );
}