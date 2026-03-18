export default function ClientDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-title-md font-semibold text-gray-800 dark:text-white/90">
          Welcome back
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Track your projects, invoices, and files here.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active Projects", value: "—" },
          { label: "Pending Invoices", value: "—" },
          { label: "Files Shared", value: "—" },
          { label: "Music Campaigns", value: "—" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {card.label}
            </p>
            <h2 className="mt-2 text-title-sm font-semibold text-gray-800 dark:text-white/90">
              {card.value}
            </h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Projects Snapshot
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Your latest project updates will appear here.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Next Steps
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { label: "Browse Services", href: "/dashboard/services" },
              { label: "View Projects", href: "/dashboard/projects" },
              { label: "Check Invoices", href: "/dashboard/invoices" },
              { label: "Upload Files", href: "/dashboard/files" },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-800 dark:text-gray-300 dark:hover:border-brand-700"
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
