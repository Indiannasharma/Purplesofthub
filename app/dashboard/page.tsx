import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Project from "@/lib/models/Project";
import Invoice from "@/lib/models/Invoice";
import Service from "@/lib/models/Service";
import MonthlySalesChart from "@/src/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/src/components/ecommerce/StatisticsChart";

export const dynamic = "force-dynamic";

type DbUser = { _id: string };
type InvoiceAgg = { outstanding: number; paid: number };

export default async function ClientDashboardPage() {
  const { userId } = await auth();
  await connectDB();

  const user = (await User.findOne({ clerkId: userId }).select("_id").lean()) as DbUser | null;

  if (!user) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
        Profile not found yet. Please sign out and sign in again.
      </div>
    );
  }

  const [activeProjects, pendingProjects, sharedFiles, activeServices, invoiceTotals] =
    await Promise.all([
      Project.countDocuments({ client: user._id, status: { $ne: "completed" } }),
      Project.countDocuments({ client: user._id, status: "planning" }),
      0,
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

  const totals = invoiceTotals[0] || { outstanding: 0, paid: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-title-md font-semibold text-gray-800 dark:text-white/90">
          Welcome back
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Track your projects, invoices, and delivery progress in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Active Projects" value={String(activeProjects)} />
        <MetricCard label="Planning Projects" value={String(pendingProjects)} />
        <MetricCard label="Outstanding Invoices" value={`N${Number(totals.outstanding || 0).toLocaleString("en-NG")}`} />
        <MetricCard label="Active Services" value={String(activeServices)} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <StatisticsChart />
        <MonthlySalesChart />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Billing Summary</h2>
          <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p>Paid total: N{Number(totals.paid || 0).toLocaleString("en-NG")}</p>
            <p>Outstanding total: N{Number(totals.outstanding || 0).toLocaleString("en-NG")}</p>
            <p>Files shared: {sharedFiles}</p>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Quick Access</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a href="/dashboard/services" className="rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-800 dark:text-gray-300 dark:hover:border-brand-700">Browse Services</a>
            <a href="/dashboard/projects" className="rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-800 dark:text-gray-300 dark:hover:border-brand-700">View Projects</a>
            <a href="/dashboard/invoices" className="rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-800 dark:text-gray-300 dark:hover:border-brand-700">Check Invoices</a>
            <a href="/dashboard/settings" className="rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-800 dark:text-gray-300 dark:hover:border-brand-700">Account Settings</a>
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
