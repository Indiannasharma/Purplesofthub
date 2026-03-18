export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-title-md font-semibold text-gray-800 dark:text-white/90">
          Platform Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure payment, notifications, and company profile details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">Company Info</h2>
          <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <p>Company: PurpleSoftHub</p>
            <p>Email: hello@purplesofthub.com</p>
            <p>Phone: +234</p>
            <p>Website: purplesofthub.com</p>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">Payment Providers</h2>
          <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <p>Paystack: Connected</p>
            <p>Flutterwave: Connected</p>
            <p>Default currency: NGN</p>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">Notifications</h2>
          <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <p>New client signup alerts: Enabled</p>
            <p>New order alerts: Enabled</p>
            <p>Payment alerts: Enabled</p>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">Admin Account</h2>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            Update your personal security and sign-in methods from the top-right profile menu.
          </p>
        </section>
      </div>
    </div>
  );
}
