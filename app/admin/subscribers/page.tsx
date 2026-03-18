export const dynamic = 'force-dynamic'

import connectDB from '@/lib/mongodb'
import Subscriber from '@/lib/models/Subscriber'

async function getSubscribers() {
  await connectDB()
  return Subscriber.find({}).sort({ subscribedAt: -1 }).lean() as Promise<Array<Record<string, unknown>>>
}

export default async function SubscribersPage() {
  const subscribers = await getSubscribers()
  const active = subscribers.filter((s) => s.status === 'active').length
  const unsub = subscribers.filter((s) => s.status === 'unsubscribed').length

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Subscribers</h2>
        <p className="text-sm text-gray-400 mt-0.5">{subscribers.length} total</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: 'Active', count: active, color: 'text-green-400' },
          { label: 'Unsubscribed', count: unsub, color: 'text-gray-400' },
          { label: 'Total', count: subscribers.length, color: 'text-white' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        <div className="border-b border-gray-800 px-6 py-4">
          <h5 className="text-sm font-semibold text-white">Email List</h5>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={String(sub._id)} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="px-6 py-3 text-gray-300">{String(sub.email)}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${sub.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {String(sub.status)}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-400">
                    {new Date(String(sub.subscribedAt || sub.createdAt)).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                    No subscribers yet.
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
