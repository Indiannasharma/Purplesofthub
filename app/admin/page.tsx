import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Project from "@/lib/models/Project";
import Invoice from "@/lib/models/Invoice";
import Service from "@/lib/models/Service";
import StatisticsChart from "@/src/components/ecommerce/StatisticsChart";
import MonthlySalesChart from "@/src/components/ecommerce/MonthlySalesChart";

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
      <div>
        <h1 className="text-title-md font-semibold text-gray-800 dark:text-white/90">
          Admin Overview
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Monitor clients, projects, invoices, and growth from one dashboard.
        </p>
        {dbError && (
          <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
            Live data is temporarily unavailable. Showing fallback values.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total Clients" value={String(totalClients)} />
        <MetricCard label="Active Projects" value={String(activeProjects)} />
        <MetricCard label="Invoices Sent" value={String(invoicesSent)} />
        <MetricCard label="Active Services" value={String(activeServices)} />
        <MetricCard label="Revenue (NGN)" value={`N${Number(paidRevenue).toLocaleString("en-NG")}`} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <StatisticsChart />
        <MonthlySalesChart />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Quick Actions</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a href="/admin/projects/new" className="rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-800 dark:text-gray-300 dark:hover:border-brand-700">Create Project</a>
            <a href="/admin/invoices/new" className="rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-800 dark:text-gray-300 dark:hover:border-brand-700">Create Invoice</a>
            <a href="/admin/services/new" className="rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-800 dark:text-gray-300 dark:hover:border-brand-700">Add Service</a>
            <a href="/admin/clients" className="rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-800 dark:text-gray-300 dark:hover:border-brand-700">View Clients</a>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Operational Notes</h2>
          <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p>Use Services to control what clients can order.</p>
            <p>Keep project updates frequent so clients see progress in real time.</p>
            <p>Send invoices immediately after delivery milestones.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <h2 className="mt-2 text-title-sm font-semibold text-gray-800 dark:text-white/90">{value}</h2>
    </div>
  );
}
