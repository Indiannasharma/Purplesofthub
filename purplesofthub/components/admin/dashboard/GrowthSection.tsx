import type { ClientsData } from "@/lib/admin/dashboard";
import { formatCount } from "@/lib/admin/dashboard";

import { Panel, PanelHeader } from "@/components/command-center/primitives";

import { AreaChart } from "./charts";
import { UnavailableLine } from "./shared";

/**
 * Client growth — compact trend, rendered only when real signups exist. A
 * mostly-empty chart never dominates the dashboard: with no growth the whole
 * panel is omitted rather than drawing blank axes.
 *
 * Chart colors resolve from `--cc-chart-1` / `--cc-border` / `--cc-text-muted`,
 * so the graph tracks the Command Center theme in both light and dark.
 */
export function GrowthSection({ clients }: { clients: ClientsData }) {
  if (clients.status === "unavailable") {
    return (
      <Panel labelledBy="growth-title">
        <PanelHeader id="growth-title" title="Client growth" />
        <div className="border-t border-[var(--cc-border)] px-5 py-4">
          <UnavailableLine label="Client growth" />
        </div>
      </Panel>
    );
  }

  const hasGrowth = clients.growth.some((point) => point.clients > 0);
  if (!hasGrowth) return null;

  const totalNew = clients.growth.reduce((sum, point) => sum + point.clients, 0);

  return (
    <Panel labelledBy="growth-title">
      <PanelHeader
        id="growth-title"
        title="Client growth"
        subtitle={`${formatCount(totalNew)} new · last ${clients.growth.length} months`}
      />

      <div className="border-t border-[var(--cc-border)] px-5 py-4">
        <AreaChart
          data={clients.growth.map((point) => ({ label: point.label, value: point.clients }))}
          seriesName="New clients"
          height={132}
        />
      </div>
    </Panel>
  );
}
