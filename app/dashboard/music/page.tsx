export default function DashboardMusicPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-title-md font-semibold text-gray-800 dark:text-white/90">Music Promotion</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage promotion campaigns, stream reports, and package history.</p>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
        <p className="text-sm text-gray-600 dark:text-gray-300">No active campaign yet. Choose a package from Services to start promotion.</p>
        <a href="/dashboard/services" className="mt-4 inline-flex rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-700 dark:text-gray-300">Browse Packages</a>
      </div>
    </div>
  );
}
