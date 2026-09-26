import type { ClientsData } from "@/lib/admin/dashboard";
import { formatCount } from "@/lib/admin/dashboard";

import { Panel, PanelHeader } from "@/components/command-center/primitives";

import { AreaChart } from "./charts";
import { EmptyLine, UnavailableLine } from "./shared";

/**
 * The principal analytics surface. It only charts the authorized 12-month
 * client series supplied by the server; when that series has no signal, the
 * card becomes a concise explanation rather than an empty plot.
 */
export function GrowthSection({ clients }: { clients: ClientsData }) {
  if (clients.status === "unavailable") {
    return (
      <Panel labelledBy="growth-title">
        <PanelHeader id="growth-title" title="Client growth" subtitle="New client accounts" />
        <div className="border-t border-[var(--cc-border)] px-5 py-4">
          <UnavailableLine label="Client growth" />
        </div>
      </Panel>
    );
  }

  const hasGrowth = clients.growth.some((point) => point.clients > 0);
  const totalNew = clients.growth.reduce((sum, point) => sum + point.clients, 0);

  return (
    <Panel labelledBy="growth-title" className="overflow-hidden">
      <PanelHeader
        id="growth-title"
        title="Client growth"
        subtitle="New client accounts over the last 12 months"
        action={
          <div className="hidden items-center gap-5 text-right sm:flex">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--cc-text-muted)]">
                This month
              </p>
              <p className="cc-display cc-tnum mt-0.5 text-base font-semibold text-[var(--cc-text)]">
                {formatCount(clients.newThisMonth)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--cc-text-muted)]">
                Period total
              </p>
              <p className="cc-display cc-tnum mt-0.5 text-base font-semibold text-[var(--cc-text)]">
                {formatCount(totalNew)}
              </p>
            </div>
          </div>
        }
      />

      <div className="border-t border-[var(--cc-border)] px-4 pb-3 pt-4 sm:px-5">
        {hasGrowth ? (
          <AreaChart
            data={clients.growth.map((point) => ({ label: point.label, value: point.clients }))}
            seriesName="New clients"
            height={218}
          />
        ) : (
          <div className="px-1 py-2">
            <EmptyLine>No client signups have been recorded in this reporting period.</EmptyLine>
          </div>
        )}
      </div>
    </Panel>
  );
}
