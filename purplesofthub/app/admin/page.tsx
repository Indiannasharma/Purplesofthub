import { redirect } from "next/navigation";

import { getAuthenticatedProfile } from "@/lib/auth";
import { getAdminDashboardData, getGreeting } from "@/lib/admin/dashboard";
import { AdminPage } from "@/components/admin/AdminPage";
import { CommandHeader } from "@/components/admin/dashboard/CommandHeader";
import { MetricsStrip } from "@/components/admin/dashboard/MetricsStrip";
import { Priorities } from "@/components/admin/dashboard/Priorities";
import { ActivityPanel } from "@/components/admin/dashboard/ActivityPanel";
import { GrowthSection } from "@/components/admin/dashboard/GrowthSection";
import { MoneyPanel } from "@/components/admin/dashboard/MoneyPanel";
import { LeadsPanel } from "@/components/admin/dashboard/LeadsPanel";
import { ProjectsPanel } from "@/components/admin/dashboard/ProjectsPanel";
import { QuickActions } from "@/components/admin/dashboard/QuickActions";

export const metadata = { title: "Overview" };

/**
 * PurpleSoftHub Admin Overview.
 *
 * Composition: the Phase 1 Command Center layout — greeting + KPI strip first,
 * then a 7/5 column grid of panels (attention queue and activity on the left;
 * money, leads, projects and signals on the right), with quick actions last.
 * Surfaces are `.cc-panel` cards divided by hairlines, all driven by `--cc-*`
 * tokens from app/styles/command-center.css.
 *
 * The root carries `cc-overview`, which is the scope for the narrow
 * `!important` restorations that keep globals.css's marketing rules from
 * flattening these panels.
 *
 * Server Component: all data is fetched server-side inside the authenticated
 * admin context (lib/admin/dashboard.ts).
 */
export default async function AdminOverviewPage() {
  const auth = await getAuthenticatedProfile();

  if (!auth.ok) {
    redirect(auth.response.status === 401 ? "/sign-in" : "/dashboard");
  }

  if (auth.role !== "admin") redirect("/dashboard");

  const dashboard = await getAdminDashboardData(auth.userId);

  const greeting = getGreeting();
  const firstName = auth.fullName?.split(" ")[0] || "there";

  return (
    <AdminPage className="cc-overview gap-6">
      <CommandHeader
        title={`${greeting}, ${firstName}`}
        generatedAt={dashboard.generatedAt}
      />

      <MetricsStrip data={dashboard} />

      <section aria-label="Executive analytics" className="grid items-start gap-4 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-8">
          <GrowthSection clients={dashboard.clients} />
        </div>
        <div className="min-w-0 xl:col-span-4">
          <Priorities attention={dashboard.attention} />
        </div>
      </section>

      <section aria-label="Operational insights" className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="md:col-span-2 xl:col-span-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--cc-text-muted)]">
            Operational health
          </p>
          <h2 className="cc-display mt-1 text-lg font-semibold tracking-[-0.02em] text-[var(--cc-text)]">
            Studio operations at a glance
          </h2>
        </div>
        <LeadsPanel leads={dashboard.leads} />
        <ProjectsPanel projects={dashboard.projects} />
        <div className="md:col-span-2 xl:col-span-1">
          <MoneyPanel finance={dashboard.finance} />
        </div>
      </section>

      <section aria-label="Activity and shortcuts" className="grid items-start gap-4 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-8">
          <ActivityPanel activity={dashboard.recentActivity} />
        </div>
        <div className="min-w-0 xl:col-span-4">
          <QuickActions />
        </div>
      </section>
    </AdminPage>
  );
}
