"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { kpis, type Trend } from "@/lib/command-center/mock-data";
import { cn } from "@/lib/utils";

/** Executive KPI strip — one hairline-divided panel, no nested cards. */

const trendMeta: Record<Trend, { icon: typeof Minus; pill: string }> = {
  up: { icon: TrendingUp, pill: "cc-pill-success" },
  down: { icon: TrendingDown, pill: "cc-pill-error" },
  flat: { icon: Minus, pill: "cc-pill-muted" },
};

export function KpiStrip() {
  return (
    <section
      aria-label="Executive metrics"
      className="cc-panel grid grid-cols-2 lg:grid-cols-4"
    >
      {kpis.map((kpi, index) => {
        const meta = trendMeta[kpi.trend];
        return (
          <div
            key={kpi.id}
            className={cn(
              "px-5 py-4",
              index > 0 && "border-[var(--cc-border)]",
              index % 2 === 1 && "border-l",
              index > 1 && "border-t lg:border-t-0",
              index > 0 && "lg:border-l"
            )}
          >
            <p className="text-xs font-medium text-[var(--cc-text-muted)]">{kpi.label}</p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="cc-display cc-tnum text-[26px] font-semibold leading-8 text-[var(--cc-text)]">
                {kpi.value}
              </span>
              <span className={cn("cc-pill cc-tnum", meta.pill)}>
                <meta.icon className="h-3 w-3" aria-hidden="true" />
                {kpi.delta}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-[var(--cc-text-muted)]">{kpi.hint}</p>
          </div>
        );
      })}
    </section>
  );
}
