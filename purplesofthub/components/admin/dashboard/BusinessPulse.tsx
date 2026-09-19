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
    <section aria-label="Business pulse">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
