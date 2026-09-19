import { redirect } from "next/navigation";

import { getAuthenticatedProfile } from "@/lib/auth";
import {
  getAdminDashboardData,
  getGreeting,
} from "@/lib/admin/dashboard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPage } from "@/components/admin/AdminPage";
import { BusinessPulse } from "@/components/admin/dashboard/BusinessPulse";
import { ProjectOverview } from "@/components/admin/dashboard/ProjectOverview";
import { AttentionCenter } from "@/components/admin/dashboard/AttentionCenter";
import { LeadOverview } from "@/components/admin/dashboard/LeadOverview";
import { FinancialSnapshot } from "@/components/admin/dashboard/FinancialSnapshot";
import { RecentActivity } from "@/components/admin/dashboard/RecentActivity";
import { QuickActions } from "@/components/admin/dashboard/QuickActions";
import { ClientGrowthCard } from "@/components/admin/dashboard/ClientGrowthCard";
import { BusinessInsights } from "@/components/admin/dashboard/BusinessInsights";
import { RefreshButton } from "@/components/admin/dashboard/RefreshButton";

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
  const subtitle = "Here's what's happening at PurpleSoftHub.";

  return (
    <AdminPage>
      <AdminPageHeader
        title={`${greeting}, ${firstName}`}
        description={subtitle}
        actions={<RefreshButton />}
      />

      <BusinessPulse data={dashboard} />

      <section aria-label="Primary operations" className="grid items-start gap-5 lg:grid-cols-12">
        <div
          className={
            dashboard.projects.status === "unavailable"
              ? "lg:col-span-5"
              : "lg:col-span-7 xl:col-span-8"
          }
        >
          <ProjectOverview projects={dashboard.projects} />
        </div>
        <div
          className={
            dashboard.projects.status === "unavailable"
              ? "lg:col-span-7"
              : "lg:col-span-5 xl:col-span-4"
          }
        >
          <AttentionCenter attention={dashboard.attention} />
        </div>
      </section>

      <section aria-label="Business development and finance" className="grid items-start gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7 xl:col-span-8">
          <LeadOverview leads={dashboard.leads} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
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

      <section aria-label="Analytics and insights" className="grid items-start gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7 xl:col-span-8">
          <ClientGrowthCard clients={dashboard.clients} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <BusinessInsights insights={dashboard.insights} />
        </div>
      </section>
    </AdminPage>
  );
}
