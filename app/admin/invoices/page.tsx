export const dynamic = 'force-dynamic'

import connectDB from '@/lib/mongodb'
import Invoice from '@/lib/models/Invoice'
import Link from 'next/link'

const STATUS_COLORS: Record<string, string> = {
  draft:     'bg-gray-500/20 text-gray-400',
  sent:      'bg-blue-500/20 text-blue-400',
  paid:      'bg-green-500/20 text-green-400',
  overdue:   'bg-red-500/20 text-red-400',
  cancelled: 'bg-gray-500/20 text-gray-400',
}

async function getInvoices() {
  await connectDB()
  return Invoice.find({})
    .sort({ createdAt: -1 })
    .populate('client', 'firstName lastName email')
    .lean() as Promise<Array<Record<string, unknown>>>
}

export default async function InvoicesPage() {
  const invoices = await getInvoices()
  const totalRevenue = invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + Number(i.total ?? 0), 0)

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Invoices</h2>
          <p className="text-sm text-gray-400 mt-0.5">{invoices.length} total invoices</p>
        </div>
        <Link
          href="/admin/invoices/new"
          className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-all"
        >
          + New Invoice
        </Link>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total', count: invoices.length, color: 'text-white' },
          { label: 'Paid', count: invoices.filter((i) => i.status === 'paid').length, color: 'text-green-400' },
          { label: 'Pending', count: invoices.filter((i) => i.status === 'sent').length, color: 'text-blue-400' },
          { label: 'Overdue', count: invoices.filter((i) => i.status === 'overdue').length, color: 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
          <h5 className="text-sm font-semibold text-white">All Invoices</h5>
          <span className="text-xs text-gray-400">
            Total collected: <span className="text-green-400 font-semibold">₦{totalRevenue.toLocaleString()}</span>
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const client = inv.client as Record<string, unknown> | null
                return (
                  <tr key={String(inv._id)} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-brand-400">{String(inv.invoiceNumber)}</td>
                    <td className="px-6 py-4 text-gray-300 whitespace-nowrap">
                      {client ? `${String(client.firstName || '')} ${String(client.lastName || '')}`.trim() : '—'}
                    </td>
                    <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                      {String(inv.currency === 'USD' ? '$' : '₦')}{Number(inv.total ?? 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[String(inv.status)] || 'bg-gray-500/20 text-gray-400'}`}>
                        {String(inv.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                      {inv.dueDate ? new Date(String(inv.dueDate)).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/invoices/${String(inv._id)}`} className="text-xs text-brand-400 hover:underline">
                        View →
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No invoices yet. <Link href="/admin/invoices/new" className="text-brand-400 hover:underline">Create one →</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
