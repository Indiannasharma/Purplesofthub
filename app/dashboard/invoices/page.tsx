export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import Invoice from '@/lib/models/Invoice'

const STATUS_COLORS: Record<string, string> = {
  draft:     'bg-gray-500/20 text-gray-400',
  sent:      'bg-blue-500/20 text-blue-400',
  paid:      'bg-green-500/20 text-green-400',
  overdue:   'bg-red-500/20 text-red-400',
  cancelled: 'bg-gray-500/20 text-gray-400',
}

export default async function ClientInvoicesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  await connectDB()
  const user = await User.findOne({ clerkId: userId }).lean() as Record<string, unknown> | null
  if (!user) redirect('/dashboard')

  const invoices = await Invoice.find({ client: user._id })
    .sort({ createdAt: -1 })
    .populate('project', 'title')
    .lean() as Array<Record<string, unknown>>

  const totalOwed = invoices
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .reduce((s, i) => s + Number(i.total ?? 0), 0)
  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + Number(i.total ?? 0), 0)

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Invoices</h2>
        <p className="text-sm text-gray-400 mt-0.5">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Invoices', value: invoices.length, color: 'text-white' },
          { label: 'Amount Owed', value: `₦${totalOwed.toLocaleString()}`, color: 'text-red-400' },
          { label: 'Total Paid', value: `₦${totalPaid.toLocaleString()}`, color: 'text-green-400' },
          { label: 'Pending', value: invoices.filter((i) => i.status === 'sent' || i.status === 'overdue').length, color: 'text-yellow-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-800 bg-gray-900 p-16 text-center">
          <p className="text-5xl mb-4">🧾</p>
          <p className="text-sm font-semibold text-white mb-1">No invoices yet</p>
          <p className="text-xs text-gray-400">Your invoices will appear here once issued.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const project = inv.project as Record<string, unknown> | null
                  const isOverdue: boolean = inv.status === 'overdue' || (inv.status === 'sent' && !!inv.dueDate && new Date(String(inv.dueDate)) < new Date())
                  return (
                    <tr key={String(inv._id)} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-brand-400">{String(inv.invoiceNumber)}</td>
                      <td className="px-6 py-4 text-gray-400">{project ? String(project.title) : '—'}</td>
                      <td className="px-6 py-4 font-semibold text-white">
                        {String(inv.currency === 'USD' ? '$' : '₦')}{Number(inv.total ?? 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[String(inv.status)] || 'bg-gray-500/20 text-gray-400'}`}>
                          {String(inv.status)}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-xs ${isOverdue ? 'text-red-400 font-semibold' : 'text-gray-400'}`}>
                        {inv.dueDate ? new Date(String(inv.dueDate)).toLocaleDateString() : '—'}
                        {isOverdue && inv.status !== 'overdue' && ' (overdue)'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalOwed > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-500/30 bg-red-500/5 p-5">
          <div>
            <p className="text-sm font-bold text-white">You have outstanding invoices</p>
            <p className="text-xs text-gray-400 mt-0.5">Total owed: <span className="text-red-400 font-semibold">₦{totalOwed.toLocaleString()}</span></p>
          </div>
          <a
            href="mailto:hello@purplesofthub.com?subject=Invoice Payment"
            className="rounded-full bg-red-500/20 border border-red-500/50 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500 hover:text-white transition-all"
          >
            Contact Us to Pay
          </a>
        </div>
      )}
    </>
  )
}
