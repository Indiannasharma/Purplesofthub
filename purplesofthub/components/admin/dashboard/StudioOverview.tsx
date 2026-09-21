import { ArrowUpRight, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

import type { AdminDashboardData } from "@/lib/admin/dashboard";

import { AreaChart } from "./charts";
import { EmptyState, UnavailableNotice } from "./shared";

export function StudioOverview({ data }: { data: AdminDashboardData }) {
  const hasGrowth =
    data.clients.status === "ok" &&
    data.clients.growth.some((point) => point.clients > 0);

  return (
    <article className="admin-momentum overflow-hidden rounded-2xl border border-border/80 bg-card">
      <div className="grid lg:grid-cols-[minmax(0,1.8fr)_minmax(250px,0.72fr)]">
        <div className="min-w-0 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                Client momentum
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                New clients across the last {data.clients.growth.length || 12} months
              </p>
            </div>
            <Link
              href="/admin/clients"
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Clients
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {data.clients.status === "unavailable" ? (
            <UnavailableNotice label="Client growth" className="mx-0 mb-0 mt-5" />
          ) : hasGrowth ? (
            <div className="-mx-2 mt-1">
              <AreaChart
                data={data.clients.growth.map((point) => ({
                  label: point.label,
                  value: point.clients,
                }))}
                seriesName="New clients"
                height={172}
              />
            </div>
          ) : (
            <EmptyState
              title="No client growth yet"
              description="The trend will appear after the first client signup."
              className="mx-0 mb-0 mt-5"
            />
          )}
        </div>

        <aside className="border-t border-border/70 bg-muted/35 p-4 sm:p-5 lg:border-l lg:border-t-0">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Operating signals</h3>
              <p className="text-[11px] text-muted-foreground">Derived from current data</p>
            </div>
          </div>

          {data.insights.length === 0 ? (
            <div className="mt-5 flex items-start gap-2.5 text-sm text-muted-foreground">
              <TrendingUp className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Signals will appear as operational data grows.
            </div>
          ) : (
            <ul className="mt-5 divide-y divide-border/60">
              {data.insights.slice(0, 4).map((insight, index) => (
                <li key={insight.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="font-mono text-[10px] font-semibold text-muted-foreground/70">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm leading-5 text-foreground">{insight.text}</p>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </article>
  );
}
