import {
  FolderKanban,
  ReceiptText,
  UserPlus,
  Users,
} from "lucide-react";

import type { AdminDashboardData } from "@/lib/admin/dashboard";
import { formatCurrencyAmount } from "@/lib/admin/dashboard";

import { MetricCard } from "./MetricCard";

/**
 * Business Pulse — the four highest-signal operational KPIs. Each card links
 * to the module that owns the metric. "Revenue this month" is intentionally
 * absent: payment-related RLS is unverified, so the only trustworthy money
 * figure is the invoice-derived outstanding total, shown in the note.
 */
export function BusinessPulse({ data }: { data: AdminDashboardData }) {
  const { overview, finance } = data;

  const outstandingNote =
    finance.status === "ok" && finance.outstanding.length > 0
      ? finance.outstanding
          .map((total) => formatCurrencyAmount(total.amount, total.currency))
          .join("  ·  ")
      : undefined;

  return (
    <section aria-labelledby="business-pulse-title" className="admin-pulse overflow-hidden rounded-2xl border border-border/80 bg-card">
      <div className="flex items-center justify-between gap-3 px-4 pb-1 pt-4 sm:px-5">
        <h2 id="business-pulse-title" className="text-sm font-semibold tracking-tight text-foreground">Business at a glance</h2>
        <p className="hidden text-xs text-muted-foreground sm:block">Live operational totals</p>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total clients"
          value={overview.totalClients}
          note={
            overview.newClientsThisMonth !== null
              ? `${overview.newClientsThisMonth} joined this month`
              : undefined
          }
          icon={Users}
          href="/admin/clients"
          className="border-b border-r xl:border-b-0"
        />
        <MetricCard
          label="Active projects"
          value={overview.activeProjects}
          note={
            overview.totalProjects !== null ? `${overview.totalProjects} total` : undefined
          }
          icon={FolderKanban}
          href="/admin/projects"
          tone="sky"
          className="border-b xl:border-b-0 xl:border-r"
        />
        <MetricCard
          label="New leads"
          value={overview.newLeads}
          note={
            overview.totalLeads !== null
              ? `${overview.totalLeads} total · awaiting contact`
              : undefined
          }
          icon={UserPlus}
          href="/admin/leads"
          tone="emerald"
          className="border-r xl:border-r"
        />
        <MetricCard
          label="Outstanding invoices"
          value={overview.outstandingInvoiceCount}
          note={outstandingNote ?? "Awaiting payment"}
          icon={ReceiptText}
          href="/admin/invoices"
          tone="amber"
        />
      </div>
    </section>
  );
}
