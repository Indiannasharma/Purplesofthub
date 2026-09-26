import Link from "next/link";
import { ArrowUpRight, FolderKanban, ReceiptText, UserPlus, Users } from "lucide-react";

import type { AdminDashboardData } from "@/lib/admin/dashboard";
import { formatCount } from "@/lib/admin/dashboard";
import { cn } from "@/lib/utils";

type Metric = {
  id: string;
  label: string;
  value: number | null;
  note: string;
  href: string;
  icon: typeof Users;
  tone: "accent" | "teal" | "info" | "warning";
};

const TONE_CLASSES: Record<Metric["tone"], string> = {
  accent: "bg-[var(--cc-accent-soft)] text-[var(--cc-accent)]",
  teal: "bg-[color-mix(in_srgb,var(--cc-chart-2)_14%,transparent)] text-[var(--cc-chart-2)]",
  info: "bg-[var(--cc-info-soft)] text-[var(--cc-info)]",
  warning: "bg-[var(--cc-warning-soft)] text-[var(--cc-warning)]",
};

/** Four distinct executive KPI cards. Null is intentionally rendered as an em dash. */
export function MetricsStrip({ data }: { data: AdminDashboardData }) {
  const { overview } = data;
  const metrics: Metric[] = [
    {
      id: "clients",
      label: "Total clients",
      value: overview.totalClients,
      note: overview.newClientsThisMonth === null
        ? "Client activity unavailable"
        : `${formatCount(overview.newClientsThisMonth)} joined this month`,
      href: "/admin/clients",
      icon: Users,
      tone: "accent",
    },
    {
      id: "leads",
      label: "New leads",
      value: overview.newLeads,
      note: overview.totalLeads === null
        ? "Lead activity unavailable"
        : `${formatCount(overview.totalLeads)} total enquiries`,
      href: "/admin/leads",
      icon: UserPlus,
      tone: "teal",
    },
    {
      id: "projects",
      label: "Active projects",
      value: overview.activeProjects,
      note: overview.totalProjects === null
        ? "Project data unavailable"
        : `${formatCount(overview.totalProjects)} across the studio`,
      href: "/admin/projects",
      icon: FolderKanban,
      tone: "info",
    },
    {
      id: "invoices",
      label: "Outstanding invoices",
      value: overview.outstandingInvoiceCount,
      note: overview.overdueCount === null
        ? "Invoice data unavailable"
        : overview.overdueCount > 0
          ? `${formatCount(overview.overdueCount)} overdue`
          : "Nothing overdue",
      href: "/admin/invoices",
      icon: ReceiptText,
      tone: "warning",
    },
  ];

  return (
    <section aria-label="Key business metrics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Link
            key={metric.id}
            href={metric.href}
            className="cc-panel group relative min-h-[142px] overflow-hidden p-5 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-[var(--cc-border-strong)] hover:shadow-[var(--cc-shadow-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-accent)]"
          >
            <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", TONE_CLASSES[metric.tone])}>
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <ArrowUpRight className="absolute right-5 top-5 h-4 w-4 text-[var(--cc-text-muted)] opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.11em] text-[var(--cc-text-muted)]">
              {metric.label}
            </p>
            <p className="cc-display cc-tnum mt-1 text-[30px] font-semibold leading-8 tracking-[-0.035em] text-[var(--cc-text)]">
              {formatCount(metric.value)}
            </p>
            <p className="mt-2 truncate text-xs text-[var(--cc-text-muted)]">{metric.note}</p>
          </Link>
        );
      })}
    </section>
  );
}
