import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Project from "@/lib/models/Project";
import Invoice from "@/lib/models/Invoice";
import Service from "@/lib/models/Service";
import MonthlySalesChart from "@/src/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/src/components/ecommerce/StatisticsChart";
import ComponentCard from "@/src/components/common/ComponentCard";
import PageBreadcrumb from "@/src/components/common/PageBreadCrumb";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type DbUser = { _id: string };
type InvoiceAgg = { outstanding: number; paid: number };

export default async function ClientDashboardPage() {
  let userId: string | null = null;
  let user: DbUser | null = null;
  let activeProjects = 0;
  let pendingProjects = 0;
  const sharedFiles = 0;
  let activeServices = 0;
  let invoiceTotals: InvoiceAgg[] = [];
  let dbError = false;

  try {
    ({ userId } = await auth());
  } catch {
    redirect("/sign-in");
  }

  if (!userId) {
    redirect("/sign-in");
  }

  try {
    await connectDB();
    user = (await User.findOne({ clerkId: userId }).select("_id").lean()) as DbUser | null;

    if (user) {
      [activeProjects, pendingProjects, activeServices, invoiceTotals] =
        await Promise.all([
          Project.countDocuments({ client: user._id, status: { $ne: "completed" } }),
          Project.countDocuments({ client: user._id, status: "planning" }),
          Service.countDocuments({ isActive: true }),
          Invoice.aggregate<InvoiceAgg>([
            { $match: { client: user._id } },
            {
              $group: {
                _id: null,
                outstanding: {
                  $sum: {
                    $cond: [{ $in: ["$status", ["draft", "sent", "overdue"]] }, "$total", 0],
                  },
                },
                paid: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$total", 0] } },
              },
            },
          ]),
        ]);
    }
  } catch {
    dbError = true;
  }

  if (!dbError && !user) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
        Profile not found yet. Please sign out and sign in again.
      </div>
    );
  }

  const totals = invoiceTotals[0] || { outstanding: 0, paid: 0 };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Client Dashboard" />
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ComponentCard title="Active Projects">
          <div className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
            {String(activeProjects)}
          </div>
        </ComponentCard>
        
        <ComponentCard title="Planning Projects">
          <div className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
            {String(pendingProjects)}
          </div>
        </ComponentCard>
        
        <ComponentCard title="Outstanding Invoices">
          <div className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
            N{Number(totals.outstanding || 0).toLocaleString("en-NG")}
          </div>
        </ComponentCard>
        
        <ComponentCard title="Active Services">
          <div className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
            {String(activeServices)}
          </div>
        </ComponentCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ComponentCard title="Statistics">
          <StatisticsChart />
        </ComponentCard>
        <ComponentCard title="Monthly Sales">
          <MonthlySalesChart />
        </ComponentCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ComponentCard title="Billing Summary">
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p>Paid total: N{Number(totals.paid || 0).toLocaleString("en-NG")}</p>
            <p>Outstanding total: N{Number(totals.outstanding || 0).toLocaleString("en-NG")}</p>
            <p>Files shared: {sharedFiles}</p>
          </div>
        </ComponentCard>
        
        <ComponentCard title="Quick Access">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a href="/dashboard/services" className="rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-800 dark:text-gray-300 dark:hover:border-brand-700">Browse Services</a>
            <a href="/dashboard/projects" className="rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-800 dark:text-gray-300 dark:hover:border-brand-700">View Projects</a>
            <a href="/dashboard/invoices" className="rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-800 dark:text-gray-300 dark:hover:border-brand-700">Check Invoices</a>
            <a href="/dashboard/settings" className="rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-800 dark:text-gray-300 dark:hover:border-brand-700">Account Settings</a>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}