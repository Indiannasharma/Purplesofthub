export const dynamic = 'force-dynamic'

import connectDB from '@/lib/mongodb'
import Payment from '@/lib/models/Payment'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  success: 'bg-green-500/20 text-green-400',
  failed:  'bg-red-500/20 text-red-400',
}

async function getPayments() {
  await connectDB()
  return Payment.find({})
    .sort({ createdAt: -1 })
    .populate('client', 'firstName lastName email')
    .lean() as Promise<Array<Record<string, unknown>>>
}

export default async function PaymentsPage() {
  const payments = await getPayments()
  const totalSuccess = payments.filter((p) => p.status === 'success').reduce((s, p) => s + Number(p.amount ?? 0), 0)

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Payments</h2>
        <p className="text-sm text-gray-400 mt-0.5">{payments.length} transactions</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Collected', value: `₦${totalSuccess.toLocaleString()}`, color: 'text-green-400' },
          { label: 'Successful', value: payments.filter((p) => p.status === 'success').length, color: 'text-green-400' },
          { label: 'Pending', value: payments.filter((p) => p.status === 'pending').length, color: 'text-yellow-400' },
          { label: 'Failed', value: payments.filter((p) => p.status === 'failed').length, color: 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((pay) => {
                const client = pay.client as Record<string, unknown> | null
                return (
                  <tr key={String(pay._id)} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-3 font-mono text-xs text-brand-400 max-w-[160px] truncate">{String(pay.reference)}</td>
                    <td className="px-6 py-3 text-gray-300 whitespace-nowrap">
                      {client ? `${String(client.firstName || '')} ${String(client.lastName || '')}`.trim() : '—'}
                    </td>
                    <td className="px-6 py-3 font-medium text-white whitespace-nowrap">
                      {String(pay.currency === 'USD' ? '$' : '₦')}{Number(pay.amount ?? 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-gray-400 capitalize">{String(pay.method || '—')}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[String(pay.status)] || 'bg-gray-500/20 text-gray-400'}`}>
                        {String(pay.status)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-400 whitespace-nowrap">
                      {new Date(String(pay.createdAt)).toLocaleDateString()}
                    </td>
                  </tr>
                )
              })}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No payments recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
