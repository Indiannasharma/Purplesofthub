import { redirect } from "next/navigation";

import { getAuthenticatedProfile } from "@/lib/auth";
import { getAdminBreadcrumbs } from "@/lib/admin-navigation";
import {
  getAdminDashboardData,
  getGreeting,
} from "@/lib/admin/dashboard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <AdminPageHeader
        title={`${greeting}, ${firstName}`}
        description={subtitle}
        breadcrumbs={getAdminBreadcrumbs("/admin")}
        actions={<RefreshButton />}
      />

      <BusinessPulse data={dashboard} />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProjectOverview projects={dashboard.projects} />
        </div>
        <AttentionCenter attention={dashboard.attention} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LeadOverview leads={dashboard.leads} />
        </div>
        <FinancialSnapshot finance={dashboard.finance} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity activity={dashboard.recentActivity} />
        </div>
        <QuickActions />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <ClientGrowthCard clients={dashboard.clients} />
        <BusinessInsights insights={dashboard.insights} />
      </div>
    </div>
  );
}