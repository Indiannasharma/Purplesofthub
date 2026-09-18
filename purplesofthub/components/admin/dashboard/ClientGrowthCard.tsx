import { AreaChart } from "./charts";
import { DashboardCard, DashboardCardHeader, EmptyState, UnavailableNotice } from "./shared";
import type { ClientsData } from "@/lib/admin/dashboard";

/**
 * Client Growth — real monthly aggregation (server-computed), never raw
 * profiles sent to the browser. A zero for a month is honest, not filled.
 */
export function ClientGrowthCard({ clients }: { clients: ClientsData }) {
  if (clients.status === "unavailable") {
    return (
      <DashboardCard>
        <DashboardCardHeader title="Client growth" description="New clients per month" />
        <UnavailableNotice label="Client data" />
      </DashboardCard>
    );
  }

  const hasData = clients.growth.some((point) => point.clients > 0);

  return (
    <DashboardCard className="lg:col-span-2">
      <DashboardCardHeader
        title="Client growth"
        description={`New clients per month · last ${clients.growth.length} months`}
      />
      {!hasData ? (
        <EmptyState title="No client growth yet" description="Client signups will chart here as they happen." />
      ) : (
        <div className="px-2 pb-2">
          <AreaChart
            data={clients.growth.map((point) => ({ label: point.label, value: point.clients }))}
            seriesName="New clients"
          />
        </div>
      )}
    </DashboardCard>
  );
}