export default function DashboardInvoicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-title-md font-semibold text-gray-800 dark:text-white/90">My Invoices</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Review payment status and due dates.</p>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
        <p className="text-sm text-gray-600 dark:text-gray-300">No invoices yet. Your issued invoices will appear here.</p>
      </div>
    </div>
  );
}
