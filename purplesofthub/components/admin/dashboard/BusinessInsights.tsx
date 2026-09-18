import { Sparkles } from "lucide-react";

import type { BusinessInsight } from "@/lib/admin/dashboard";

import { DashboardCard, DashboardCardHeader, EmptyState } from "./shared";

/**
 * PurpleSoftHub Insights — deterministic observations only. Each statement is
 * computed from real dashboard data (overdue count, top service, new clients,
 * deadline count). No generative AI is invoked.
 */
export function BusinessInsights({ insights }: { insights: BusinessInsight[] }) {
  return (
    <DashboardCard>
      <DashboardCardHeader
        title="PurpleSoftHub Insights"
        description="Deterministic observations from current data"
        action={<Sparkles className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
      />
      {insights.length === 0 ? (
        <EmptyState title="No insights yet" description="Insights appear once real operational data is present." />
      ) : (
        <ul className="mt-2 grid gap-2 px-5 pb-5">
          {insights.map((insight) => (
            <li key={insight.id} className="flex items-start gap-2 text-sm text-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              <span>{insight.text}</span>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}