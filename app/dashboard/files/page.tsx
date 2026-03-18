export default function DashboardFilesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-title-md font-semibold text-gray-800 dark:text-white/90">My Files</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Access project files shared by your account manager.</p>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
        <p className="text-sm text-gray-600 dark:text-gray-300">No files uploaded yet. Shared assets and delivery files will show here.</p>
      </div>
    </div>
  );
}
