import Link from 'next/link'

export default function AdminSettingsPage() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-sm text-gray-400 mt-0.5">Platform configuration and quick links</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h5 className="mb-4 text-sm font-semibold text-white">Platform Info</h5>
          <div className="space-y-4">
            {[
              { label: 'Company Name', value: 'PurpleSoftHub', desc: 'Displayed in emails and invoices' },
              { label: 'Support Email', value: 'hello@purplesofthub.com', desc: 'Clients will reply to this address' },
              { label: 'Website', value: 'purplesofthub.com', desc: 'Your public-facing domain' },
              { label: 'Currency', value: 'NGN (₦) / USD ($)', desc: 'Supported billing currencies' },
            ].map((f) => (
              <div key={f.label} className="border-b border-gray-800 pb-4 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-white">{f.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                  </div>
                  <p className="text-sm text-gray-300 text-right">{f.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h5 className="mb-4 text-sm font-semibold text-white">Quick Links</h5>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              { label: 'Manage Services', href: '/admin/services', icon: '⚙️' },
              { label: 'View Clients', href: '/admin/clients', icon: '👥' },
              { label: 'Invoices', href: '/admin/invoices', icon: '🧾' },
              { label: 'Payments', href: '/admin/payments', icon: '💰' },
              { label: 'Blog Posts', href: '/admin/blog', icon: '✍️' },
              { label: 'Subscribers', href: '/admin/subscribers', icon: '📧' },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-3 rounded-lg border border-gray-800 p-3 hover:border-brand-500/40 hover:bg-gray-800/40 transition-all"
              >
                <span className="text-base">{link.icon}</span>
                <span className="text-sm text-gray-300">{link.label}</span>
                <span className="ml-auto text-gray-600 text-xs">→</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h5 className="mb-4 text-sm font-semibold text-white">Account</h5>
          <p className="text-sm text-gray-400 mb-4">Manage your personal profile and authentication through Clerk.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-full border border-brand-500/50 px-4 py-2 text-xs font-medium text-brand-400 hover:bg-brand-500 hover:text-white transition-all">
              Dashboard Overview
            </Link>
            <a
              href="https://dashboard.clerk.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-gray-700 px-4 py-2 text-xs font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
            >
              Clerk Dashboard ↗
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
