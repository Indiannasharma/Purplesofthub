import Link from "next/link";

import type { FinanceData } from "@/lib/admin/dashboard";
import { formatCount, formatCurrencyAmount } from "@/lib/admin/dashboard";
import { cn } from "@/lib/utils";

import { EmptyLine, SectionTitle, UnavailableLine } from "./shared";

const COUNT_TONE: Record<string, string> = {
  paid: "text-emerald-600 dark:text-emerald-400",
  pending: "text-amber-600 dark:text-amber-400",
  overdue: "text-destructive",
  cancelled: "text-muted-foreground",
};

/**
 * Money — invoice-derived only (payments/transactions stay untouched; their
 * RLS is unverified). Outstanding amounts stay currency-separated; no invented
 * exchange rate.
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
    <section aria-labelledby="money-title">
      <SectionTitle
        id="money-title"
        title="Money"
        action={
          <Link
            href="/admin/invoices"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Invoices
          </Link>
        }
      />

      <div className="mt-3 border-t border-border/70 pt-3">
        {finance.status === "unavailable" ? (
          <UnavailableLine label="Invoice data" />
        ) : totalInvoices === 0 ? (
          <EmptyLine>No invoices yet.</EmptyLine>
        ) : (
          <>
            <p className="text-[11px] leading-4 text-muted-foreground">Outstanding</p>
            {finance.outstanding.length === 0 ? (
              <p className="mt-1 text-sm font-medium text-foreground">Nothing outstanding</p>
            ) : (
              <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                {finance.outstanding
                  .map((total) => formatCurrencyAmount(total.amount, total.currency))
                  .join("  ·  ")}
              </p>
            )}

            {counts.length > 0 ? (
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {counts.map((row, index) => (
                  <span key={row.key}>
                    {index > 0 ? " · " : ""}
                    <span className={cn("font-semibold tabular-nums", COUNT_TONE[row.key])}>
                      {formatCount(row.count)}
                    </span>{" "}
                    {row.label}
                  </span>
                ))}
              </p>
            ) : null}

            {finance.paidThisMonth.length > 0 ? (
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Paid this month:{" "}
                <span className="font-medium text-foreground">
                  {finance.paidThisMonth
                    .map((total) => formatCurrencyAmount(total.amount, total.currency))
                    .join("  ·  ")}
                </span>
              </p>
            ) : null}

            {finance.overdueInvoices.length > 0 ? (
              <ul className="mt-3 divide-y divide-border/60 border-t border-border/60">
                {finance.overdueInvoices.slice(0, 3).map((invoice) => (
                  <li
                    key={invoice.id}
                    className="flex items-center justify-between gap-3 py-2 text-[13px]"
                  >
                    <span className="font-medium tabular-nums text-foreground">
                      {formatCurrencyAmount(invoice.amount, invoice.currency)}
                    </span>
                    <span className="text-xs text-destructive">
                      {invoice.daysOverdue === 0 ? "Due today" : `${invoice.daysOverdue}d overdue`}
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