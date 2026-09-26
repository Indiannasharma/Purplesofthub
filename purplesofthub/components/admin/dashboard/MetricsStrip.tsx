import Link from "next/link";

import type { AdminDashboardData } from "@/lib/admin/dashboard";
import { formatCount } from "@/lib/admin/dashboard";
import { cn } from "@/lib/utils";

type Metric = {
  id: string;
  label: string;
  value: number | null;
  note?: string;
  href: string;
};

/**
 * Executive KPI strip — one hairline-divided panel, no nested cards.
 *
 * Every value is real. `null` (the section could not be read) renders an
 * honest em dash via formatCount; it is never shown as a zero.
 */
export function MetricsStrip({ data }: { data: AdminDashboardData }) {
  const { overview } = data;

  const metrics: Metric[] = [
    {
      id: "clients",
      label: "Clients",
      value: overview.totalClients,
      note:
        overview.newClientsThisMonth !== null && overview.newClientsThisMonth > 0
          ? `+${overview.newClientsThisMonth} this month`
          : "No new clients this month",
      href: "/admin/clients",
    },
    {
      id: "projects",
      label: "Active projects",
      value: overview.activeProjects,
      note:
        overview.totalProjects !== null
          ? `${formatCount(overview.totalProjects)} total`
          : "Total unavailable",
      href: "/admin/projects",
    },
    {
      id: "leads",
      label: "New leads",
      value: overview.newLeads,
      note:
        overview.totalLeads !== null
          ? `${formatCount(overview.totalLeads)} total`
          : "Total unavailable",
      href: "/admin/leads",
    },
    {
      id: "invoices",
      label: "Unpaid invoices",
      value: overview.outstandingInvoiceCount,
      note:
        overview.overdueCount !== null && overview.overdueCount > 0
          ? `${formatCount(overview.overdueCount)} overdue`
          : "Nothing overdue",
      href: "/admin/invoices",
    },
  ];

  return (
    <section aria-label="Key metrics" className="cc-panel grid grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Link
          key={metric.id}
          href={metric.href}
          className={cn(
            "group min-w-0 px-5 py-4 transition-colors hover:bg-[var(--cc-subtle)]",
            index > 0 && "border-[var(--cc-border)]",
            index % 2 === 1 && "border-l",
            index > 1 && "border-t lg:border-t-0",
            index > 0 && "lg:border-l"
          )}
        >
          <p className="text-xs font-medium text-[var(--cc-text-muted)]">{metric.label}</p>
          <p className="cc-display cc-tnum mt-1.5 text-[26px] font-semibold leading-8 text-[var(--cc-text)]">
            {formatCount(metric.value)}
          </p>
          <p className="mt-1 truncate text-[11px] text-[var(--cc-text-muted)]">{metric.note}</p>
        </Link>
      ))}
    </section>
  );
}
