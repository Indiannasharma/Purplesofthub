import Link from "next/link";

import type { AdminDashboardData } from "@/lib/admin/dashboard";
import { formatCount } from "@/lib/admin/dashboard";

type Metric = {
  label: string;
  value: number | null;
  note?: string;
  href: string;
};

/**
 * Metrics strip — the four highest-signal operational numbers presented as a
 * single hairline-divided row. No cards, no icons, no colored tiles: the
 * numbers themselves carry the hierarchy. Null values render an honest dash.
 */
export function MetricsStrip({ data }: { data: AdminDashboardData }) {
  const { overview } = data;

  const metrics: Metric[] = [
    {
      label: "Clients",
      value: overview.totalClients,
      note:
        overview.newClientsThisMonth !== null && overview.newClientsThisMonth > 0
          ? `+${overview.newClientsThisMonth} this month`
          : undefined,
      href: "/admin/clients",
    },
    {
      label: "Active projects",
      value: overview.activeProjects,
      note:
        overview.totalProjects !== null ? `${formatCount(overview.totalProjects)} total` : undefined,
      href: "/admin/projects",
    },
    {
      label: "New leads",
      value: overview.newLeads,
      note:
        overview.totalLeads !== null ? `${formatCount(overview.totalLeads)} total` : undefined,
      href: "/admin/leads",
    },
    {
      label: "Outstanding invoices",
      value: overview.outstandingInvoiceCount,
      note: overview.overdueCount !== null && overview.overdueCount > 0
        ? `${overview.overdueCount} overdue`
        : undefined,
      href: "/admin/invoices",
    },
  ];

  return (
    <section
      aria-label="Key metrics"
      className="grid grid-cols-2 gap-x-6 gap-y-4 border-y border-border/70 py-4 md:grid-cols-4 md:py-5"
    >
      {metrics.map((metric) => (
        <Link
          key={metric.label}
          href={metric.href}
          className="group min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <p className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">
            {metric.label}
          </p>
          <p className="mt-1 text-xl font-semibold leading-none tabular-nums tracking-tight text-foreground">
            {formatCount(metric.value)}
          </p>
          {metric.note ? (
            <p className="mt-1 truncate text-[11px] leading-4 text-muted-foreground">
              {metric.note}
            </p>
          ) : null}
        </Link>
      ))}
    </section>
  );
}