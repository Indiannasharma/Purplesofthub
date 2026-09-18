import Link from "next/link";

import type { FinanceData } from "@/lib/admin/dashboard";
import { formatCurrencyAmount, formatCount } from "@/lib/admin/dashboard";
import { cn } from "@/lib/utils";

import { DashboardCard, DashboardCardHeader, EmptyState, UnavailableNotice } from "./shared";

const ROW_STYLES: Record<string, string> = {
  paid: "text-emerald-600 dark:text-emerald-400",
  pending: "text-amber-600 dark:text-amber-400",
  overdue: "text-destructive",
  cancelled: "text-muted-foreground",
};

/**
 * Financial Snapshot — invoice-derived only. `payments`/`transactions` are
 * deliberately not queried (RLS unverified). Amounts stay currency-separated;
 * no invented exchange rate is applied.
 */
export function FinancialSnapshot({ finance }: { finance: FinanceData }) {
  if (finance.status === "unavailable") {
    return (
      <DashboardCard>
        <DashboardCardHeader title="Financial snapshot" description="Invoices" />
        <UnavailableNotice label="Invoice data" />
      </DashboardCard>
    );
  }

  const rows = [
    { label: "Paid", count: finance.paidCount, key: "paid" },
    { label: "Pending", count: finance.pendingCount, key: "pending" },
    { label: "Overdue", count: finance.overdueCount, key: "overdue" },
    { label: "Cancelled", count: finance.cancelledCount, key: "cancelled" },
  ].filter((row) => row.count > 0);

  const hasInvoices = finance.paidCount + finance.pendingCount + finance.overdueCount + finance.cancelledCount > 0;

  return (
    <DashboardCard>
      <DashboardCardHeader
        title="Financial snapshot"
        description="Derived from invoices · currency-separated"
        action={
          <Link
            href="/admin/invoices"
            className="text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Invoices
          </Link>
        }
      />

      {!hasInvoices ? (
        <EmptyState title="No invoices yet" description="Invoice activity will appear here once billing starts." />
      ) : (
        <>
          <ul className="grid gap-1 px-5 pb-2 pt-1">
            {rows.map((row) => (
              <li key={row.key} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{row.label}</span>
                <span className={cn("font-semibold tabular-nums", ROW_STYLES[row.key])}>
                  {formatCount(row.count)}
                </span>
              </li>
            ))}
          </ul>

          <div className="border-t border-border/60 px-5 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Outstanding
            </p>
            {finance.outstanding.length === 0 ? (
              <p className="mt-1 text-sm text-foreground">Nothing outstanding</p>
            ) : (
              <ul className="mt-1 grid gap-0.5">
                {finance.outstanding.map((total) => (
                  <li key={total.currency} className="text-lg font-semibold tracking-tight text-foreground">
                    {formatCurrencyAmount(total.amount, total.currency)}
                  </li>
                ))}
              </ul>
            )}

            {finance.paidThisMonth.length > 0 ? (
              <>
                <p className="mt-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Paid this month
                </p>
                <ul className="mt-1 grid gap-0.5">
                  {finance.paidThisMonth.map((total) => (
                    <li key={total.currency} className="text-sm font-medium text-foreground">
                      {formatCurrencyAmount(total.amount, total.currency)}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>

          {finance.overdueInvoices.length > 0 ? (
            <div className="border-t border-border/60">
              <p className="px-5 pt-3 text-[11px] font-medium uppercase tracking-wider text-destructive">
                Overdue
              </p>
              <ul className="divide-y divide-border/50">
                {finance.overdueInvoices.map((invoice) => (
                  <li key={invoice.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                    <span className="min-w-0 truncate text-sm font-medium text-foreground">
                      {formatCurrencyAmount(invoice.amount, invoice.currency)}
                    </span>
                    <span className="shrink-0 text-xs text-destructive">
                      {invoice.daysOverdue === 0 ? "Due today" : `${invoice.daysOverdue}d overdue`}
                    </span>
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