export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-title-md font-semibold text-gray-800 dark:text-white/90">
          Admin Overview
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Monitor clients, projects, and revenue in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Clients", value: "—" },
          { label: "Active Projects", value: "—" },
          { label: "Invoices Sent", value: "—" },
          { label: "Revenue (NGN)", value: "—" },
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
            Quick Actions
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { label: "Create Project", href: "/admin/projects/new" },
              { label: "Create Invoice", href: "/admin/invoices/new" },
              { label: "Add Service", href: "/admin/services/new" },
              { label: "View Clients", href: "/admin/clients" },
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

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Activity Feed
          </h2>
          <div className="mt-4 space-y-3 text-sm text-gray-500 dark:text-gray-400">
            <p>Latest client signups and payments will appear here.</p>
            <p>Connect data sources to activate live metrics.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
