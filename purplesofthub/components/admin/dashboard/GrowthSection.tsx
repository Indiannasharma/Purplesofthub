import type { ClientsData } from "@/lib/admin/dashboard";
import { formatCount } from "@/lib/admin/dashboard";

import { AreaChart } from "./charts";
import { SectionTitle, UnavailableLine } from "./shared";

/**
 * Client growth — compact trend, rendered only when real signups exist. A
 * mostly-empty chart never dominates the dashboard: with no growth the whole
 * section is omitted rather than drawing blank axes.
 */
export function GrowthSection({ clients }: { clients: ClientsData }) {
  if (clients.status === "unavailable") {
    return (
      <section aria-labelledby="growth-title">
        <SectionTitle id="growth-title" title="Client growth" />
        <div className="mt-3 border-t border-border/70 pt-3">
          <UnavailableLine label="Client growth" />
        </div>
      </section>
    );
  }

  const hasGrowth = clients.growth.some((point) => point.clients > 0);
  if (!hasGrowth) return null;

  const totalNew = clients.growth.reduce((sum, point) => sum + point.clients, 0);

  return (
    <section aria-labelledby="growth-title">
      <SectionTitle
        id="growth-title"
        title="Client growth"
        action={
          <span className="text-xs tabular-nums text-muted-foreground">
            {formatCount(totalNew)} new · last {clients.growth.length} months
          </span>
        }
      />
      <div className="mt-3 border-t border-border/70 pt-3">
        <AreaChart
          data={clients.growth.map((point) => ({ label: point.label, value: point.clients }))}
          seriesName="New clients"
          height={132}
        />
      </div>
    </section>
  );
}