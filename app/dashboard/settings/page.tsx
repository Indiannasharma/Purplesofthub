import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";

export const dynamic = "force-dynamic";

type ClientUser = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  country?: string;
  isActive?: boolean;
};

export default async function DashboardSettingsPage() {
  const { userId } = await auth();
  await connectDB();

  const user = (await User.findOne({ clerkId: userId }).lean()) as ClientUser | null;
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Client";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-title-md font-semibold text-gray-800 dark:text-white/90">
          Account Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your profile details and account preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900 xl:col-span-2">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Profile
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Full Name
              </p>
              <p className="mt-1 text-sm text-gray-800 dark:text-white/90">{fullName}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Email
              </p>
              <p className="mt-1 text-sm text-gray-800 dark:text-white/90">
                {user?.email || "No email"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Phone
              </p>
              <p className="mt-1 text-sm text-gray-800 dark:text-white/90">
                {user?.phone || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Company
              </p>
              <p className="mt-1 text-sm text-gray-800 dark:text-white/90">
                {user?.company || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Country
              </p>
              <p className="mt-1 text-sm text-gray-800 dark:text-white/90">
                {user?.country || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Status
              </p>
              <p className="mt-1 text-sm text-gray-800 dark:text-white/90">
                {user?.isActive === false ? "Inactive" : "Active"}
              </p>
            </div>
          </div>
        </section>

        <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Account Actions
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Use the profile menu at the top-right to update password, connected accounts, and
            security settings.
          </p>
          <div className="mt-4 space-y-3">
            <a
              href="/dashboard/projects"
              className="inline-flex w-full items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-brand-600"
            >
              View Projects
            </a>
            <a
              href="/dashboard/invoices"
              className="inline-flex w-full items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-brand-600"
            >
              View Invoices
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
