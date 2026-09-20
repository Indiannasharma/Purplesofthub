import { redirect } from "next/navigation";

import { getAuthenticatedProfile } from "@/lib/auth";
import {
  getAdminDashboardData,
  getGreeting,
} from "@/lib/admin/dashboard";
import { AdminPage } from "@/components/admin/AdminPage";
import { CommandHeader } from "@/components/admin/dashboard/CommandHeader";
import { BusinessPulse } from "@/components/admin/dashboard/BusinessPulse";
import { StudioOverview } from "@/components/admin/dashboard/StudioOverview";
import { ProjectOverview } from "@/components/admin/dashboard/ProjectOverview";
import { AttentionCenter } from "@/components/admin/dashboard/AttentionCenter";
import { LeadOverview } from "@/components/admin/dashboard/LeadOverview";
import { FinancialSnapshot } from "@/components/admin/dashboard/FinancialSnapshot";
import { RecentActivity } from "@/components/admin/dashboard/RecentActivity";
import { QuickActions } from "@/components/admin/dashboard/QuickActions";

export const metadata = { title: "Command Center" };

/**
 * PurpleSoftHub Admin Overview � the Command Center.
 *
 * Server Component: all dashboard data is fetched server-side inside an
 * authenticated admin context. No browser Supabase queries, no fake numbers,
 * no hardcoded revenue. Charts are isolated to small client components.
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
    <AdminPage className="gap-6">
      <CommandHeader
        title={`${greeting}, ${firstName}`}
        generatedAt={dashboard.generatedAt}
      />

      <BusinessPulse data={dashboard} />

      <section aria-label="Studio overview and priorities" className="grid items-start gap-5 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <StudioOverview data={dashboard} />
        </div>
        <div className="xl:col-span-4">
          <AttentionCenter attention={dashboard.attention} />
        </div>
      </section>

      <section aria-label="Operational snapshots" className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <ProjectOverview projects={dashboard.projects} />
        </div>
        <div>
          <LeadOverview leads={dashboard.leads} />
        </div>
        <div className="md:col-span-2 xl:col-span-1">
          <FinancialSnapshot finance={dashboard.finance} />
        </div>
      </section>

      <section aria-label="Recent activity and shortcuts" className="grid items-start gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7 xl:col-span-8">
          <RecentActivity activity={dashboard.recentActivity} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <QuickActions />
        </div>
      </section>
    </AdminPage>
  );
}
