import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
// TODO: Restore ClientInvoiceActions component from git
// import ClientInvoiceActions from '@/components/Client/InvoiceActions'

export default async function ClientInvoicesPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) redirect('/sign-in')

  const { data: invoices } = await supabase
    .from('invoices')
    .select(
      `
      *,
      projects(title)
    `
    )
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  const totalPaid = (invoices || [])
    .filter(i => i.status === 'paid')
    .reduce((s, i) => s + (i.amount || 0), 0)
  const totalPending = (invoices || [])
    .filter(i => i.status === 'pending')
    .reduce((s, i) => s + (i.amount || 0), 0)

  const STATUS_STYLES: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black dark:text-white">My Invoices</h2>
        <p className="text-sm text-bodydark2 mt-1">{invoices?.length || 0} total invoices</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: 'Total Paid',
            value: `₦${totalPaid.toLocaleString()}`,
            icon: '✅',
            color: 'text-green-500',
            bg: 'bg-green-500/10'
          },
          {
            label: 'Pending',
            value: `₦${totalPending.toLocaleString()}`,
            icon: '⏳',
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/10'
          },
          {
            label: 'Total Invoices',
            value: invoices?.length || 0,
            icon: '🧾',
            color: 'text-brand-500',
            bg: 'bg-brand-500/10'
          }
        ].map(card => (
          <div key={card.label} className="rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
            <div className={`w-10 h-10 rounded-full ${card.bg} flex items-center justify-center text-xl mb-3`}>
              {card.icon}
            </div>
            <p className={`text-2xl font-bold ${card.color} mb-1`}>{card.value}</p>
            <p className="text-sm text-bodydark2">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Invoices list */}
      {!invoices?.length ? (
        <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark p-12 text-center">
          <p className="text-5xl mb-4">🧾</p>
          <p className="font-semibold text-black dark:text-white mb-2">No invoices yet</p>
          <p className="text-sm text-bodydark2">Invoices from your projects will appear here</p>
        </div>
      ) : (
        <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stroke dark:border-strokedark">
                {['Invoice', 'Project', 'Amount', 'Due Date', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-bodydark2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice: any) => (
                <tr key={invoice.id} className="border-b border-stroke/50 dark:border-strokedark/50 hover:bg-brand-500/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-bodydark2">
                      #{invoice.id.slice(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-black dark:text-white">
                    {invoice.projects?.title || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-black dark:text-white text-sm">
                      ₦{Number(invoice.amount || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-bodydark2">
                    {invoice.due_date ? format(new Date(invoice.due_date), 'MMM d, yyyy') : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        STATUS_STYLES[invoice.status] || STATUS_STYLES.draft
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-bodydark2">Actions placeholder</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
