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
    <section aria-labelledby="business-pulse-title">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Live business pulse
          </p>
          <h2 id="business-pulse-title" className="sr-only">Business pulse</h2>
        </div>
        <p className="hidden text-xs text-muted-foreground sm:block">Real-time operational totals</p>
      </div>
      <div className="grid overflow-hidden rounded-xl border border-border/70 bg-card shadow-[0_1px_2px_rgba(15,23,42,0.035)] sm:grid-cols-2 xl:grid-cols-4">
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
          className="border-b sm:border-r xl:border-b-0"
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
          className="border-b sm:border-b-0 sm:border-r"
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
