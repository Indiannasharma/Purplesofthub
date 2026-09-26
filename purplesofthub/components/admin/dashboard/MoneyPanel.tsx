import Link from "next/link";

import type { FinanceData } from "@/lib/admin/dashboard";
import { formatCount, formatCurrencyAmount } from "@/lib/admin/dashboard";
import { Panel, PanelHeader } from "@/components/command-center/primitives";
import { cn } from "@/lib/utils";

import { CurrencyLine, EmptyLine, UnavailableLine } from "./shared";

const COUNT_TONE: Record<string, string> = {
  paid: "text-[var(--cc-success)]",
  pending: "text-[var(--cc-warning)]",
  overdue: "text-[var(--cc-error)]",
};

/**
 * Money — invoice-derived only (`payments` / `transactions` stay untouched
 * because their RLS is unverified).
 *
 * Financial concepts are labelled explicitly and kept apart:
 *   • Outstanding  — unpaid, non-cancelled invoices (money still owed)
 *   • Collected    — invoices marked paid (not a payment-provider figure)
 *   • Invoiced     — every non-cancelled invoice ever raised
 * Amounts stay separated per currency; no invented exchange rate is applied.
 */
export function MoneyPanel({ finance }: { finance: FinanceData }) {
  const totalInvoices =
    finance.paidCount + finance.pendingCount + finance.overdueCount + finance.cancelledCount;

  const counts = [
    { key: "paid", label: "paid", count: finance.paidCount },
    { key: "pending", label: "pending", count: finance.pendingCount },
    { key: "overdue", label: "overdue", count: finance.overdueCount },
  ].filter((row) => row.count > 0);

  return (
    <Panel labelledBy="money-title">
      <PanelHeader
        id="money-title"
        title="Money"
        subtitle="From invoice records only"
        action={
          <Link
            href="/admin/invoices"
            className="text-xs font-semibold text-[var(--cc-accent)] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-accent)]"
          >
            Invoices
          </Link>
        }
      />

      <div className="border-t border-[var(--cc-border)] px-5 py-4">
        {finance.status === "unavailable" ? (
          <UnavailableLine label="Invoice data" />
        ) : totalInvoices === 0 ? (
          <EmptyLine>No invoices yet.</EmptyLine>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-medium text-[var(--cc-text-muted)]">
                Outstanding (unpaid invoices)
              </p>
              <div className="mt-1">
                <CurrencyLine totals={finance.outstanding} format={formatCurrencyAmount} />
              </div>

              {counts.length > 0 ? (
                <p className="mt-2 text-xs leading-5 text-[var(--cc-text-muted)]">
                  {counts.map((row, index) => (
                    <span key={row.key}>
                      {index > 0 ? " · " : ""}
                      <span className={cn("cc-tnum font-semibold", COUNT_TONE[row.key])}>
                        {formatCount(row.count)}
                      </span>{" "}
                      {row.label}
                    </span>
                  ))}
                </p>
              ) : null}
            </div>

            <dl className="space-y-2 border-t border-[var(--cc-border)] pt-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <dt className="text-[11px] font-medium text-[var(--cc-text-muted)]">
                  Collected (invoices marked paid)
                </dt>
                <dd className="cc-tnum text-[13px] font-semibold text-[var(--cc-text)]">
                  {finance.collected.length > 0
                    ? finance.collected
                        .map((total) => formatCurrencyAmount(total.amount, total.currency))
                        .join("  ·  ")
                    : "Nothing collected yet"}
                </dd>
              </div>

              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <dt className="text-[11px] font-medium text-[var(--cc-text-muted)]">
                  Invoiced (all non-cancelled)
                </dt>
                <dd className="cc-tnum text-[13px] font-semibold text-[var(--cc-text)]">
                  {finance.invoiced.length > 0
                    ? finance.invoiced
                        .map((total) => formatCurrencyAmount(total.amount, total.currency))
                        .join("  ·  ")
                    : "Nothing invoiced"}
                </dd>
              </div>

              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <dt className="text-[11px] font-medium text-[var(--cc-text-muted)]">
                  Collected this month
                </dt>
                <dd className="cc-tnum text-[13px] font-semibold text-[var(--cc-text)]">
                  {finance.paidThisMonth.length > 0
                    ? finance.paidThisMonth
                        .map((total) => formatCurrencyAmount(total.amount, total.currency))
                        .join("  ·  ")
                    : "None yet"}
                </dd>
              </div>
            </dl>

            {finance.overdueInvoices.length > 0 ? (
              <ul className="divide-y divide-[var(--cc-border)] border-t border-[var(--cc-border)] pt-1">
                {finance.overdueInvoices.slice(0, 3).map((invoice) => (
                  <li
                    key={invoice.id}
                    className="flex items-center justify-between gap-3 py-2 text-[13px]"
                  >
                    <span className="cc-tnum font-medium text-[var(--cc-text)]">
                      {formatCurrencyAmount(invoice.amount, invoice.currency)}
                    </span>
                    <span className="text-xs text-[var(--cc-error)]">
                      {invoice.daysOverdue === 0 ? "Due today" : `${invoice.daysOverdue}d overdue`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}

            <p className="text-[11px] leading-4 text-[var(--cc-text-muted)]">
              Totals are separated per currency. Payments and transactions are not included.
            </p>
          </div>
        )}
      </div>
    </Panel>
  );
}
