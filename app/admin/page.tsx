import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Project from "@/lib/models/Project";
import Invoice from "@/lib/models/Invoice";
import Service from "@/lib/models/Service";
import StatisticsChart from "@/src/components/ecommerce/StatisticsChart";
import MonthlySalesChart from "@/src/components/ecommerce/MonthlySalesChart";
import ComponentCard from "@/src/components/common/ComponentCard";
import PageBreadcrumb from "@/src/components/common/PageBreadCrumb";

export const dynamic = "force-dynamic";

type RevenueAgg = { paidRevenue: number };

export default async function AdminDashboardPage() {
  let totalClients = 0;
  let activeProjects = 0;
  let invoicesSent = 0;
  let activeServices = 0;
  let revenueResult: RevenueAgg[] = [];
  let dbError = false;

  try {
    await connectDB();
    [totalClients, activeProjects, invoicesSent, activeServices, revenueResult] =
      await Promise.all([
        User.countDocuments({ role: "client" }),
        Project.countDocuments({ status: { $ne: "completed" } }),
        Invoice.countDocuments({ status: { $in: ["sent", "paid", "overdue"] } }),
        Service.countDocuments({ isActive: true }),
        Invoice.aggregate<RevenueAgg>([
          { $match: { status: "paid" } },
          { $group: { _id: null, paidRevenue: { $sum: "$total" } } },
        ]),
      ]);
  } catch {
    dbError = true;
  }

  const paidRevenue = revenueResult[0]?.paidRevenue || 0;

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Admin Overview" />
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <ComponentCard title="Total Clients">
          <div className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
            {String(totalClients)}
          </div>
          {dbError && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              Live data unavailable
            </p>
          )}
        </ComponentCard>
        
        <ComponentCard title="Active Projects">
          <div className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
            {String(activeProjects)}
          </div>
        </ComponentCard>
        
        <ComponentCard title="Invoices Sent">
          <div className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
            {String(invoicesSent)}
          </div>
        </ComponentCard>
        
        <ComponentCard title="Active Services">
          <div className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
            {String(activeServices)}
          </div>
        </ComponentCard>
        
        <ComponentCard title="Revenue (NGN)">
          <div className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
            N{Number(paidRevenue).toLocaleString("en-NG")}
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
        <ComponentCard title="Quick Actions">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a href="/admin/projects/new" className="rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-800 dark:text-gray-300 dark:hover:border-brand-700">Create Project</a>
            <a href="/admin/invoices/new" className="rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-800 dark:text-gray-300 dark:hover:border-brand-700">Create Invoice</a>
            <a href="/admin/services/new" className="rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-800 dark:text-gray-300 dark:hover:border-brand-700">Add Service</a>
            <a href="/admin/clients" className="rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-800 dark:text-gray-300 dark:hover:border-brand-700">View Clients</a>
          </div>
        </ComponentCard>
        
        <ComponentCard title="Operational Notes">
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p>Use Services to control what clients can order.</p>
            <p>Keep project updates frequent so clients see progress in real time.</p>
            <p>Send invoices immediately after delivery milestones.</p>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
