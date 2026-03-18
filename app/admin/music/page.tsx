export const dynamic = 'force-dynamic'

import connectDB from '@/lib/mongodb'
import MusicPromotion from '@/lib/models/MusicPromotion'

const STATUS_COLORS: Record<string, string> = {
  submitted:   'bg-blue-500/20 text-blue-400',
  'in-review': 'bg-yellow-500/20 text-yellow-400',
  active:      'bg-brand-500/20 text-brand-400',
  completed:   'bg-green-500/20 text-green-400',
}

const PKG_COLORS: Record<string, string> = {
  starter: 'bg-gray-500/20 text-gray-400',
  growth:  'bg-blue-500/20 text-blue-400',
  pro:     'bg-yellow-500/20 text-yellow-400',
}

async function getPromos() {
  await connectDB()
  return MusicPromotion.find({})
    .sort({ createdAt: -1 })
    .populate('client', 'firstName lastName email')
    .lean() as Promise<Array<Record<string, unknown>>>
}

export default async function AdminMusicPage() {
  const promos = await getPromos()

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Music Promotions</h2>
          <p className="text-sm text-gray-400 mt-0.5">{promos.length} campaign{promos.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Active', count: promos.filter((p) => p.status === 'active').length, color: 'text-brand-400' },
          { label: 'In Review', count: promos.filter((p) => p.status === 'in-review').length, color: 'text-yellow-400' },
          { label: 'Submitted', count: promos.filter((p) => p.status === 'submitted').length, color: 'text-blue-400' },
          { label: 'Completed', count: promos.filter((p) => p.status === 'completed').length, color: 'text-green-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Artist / Track</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Package</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Streams</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((promo) => {
                const client = promo.client as Record<string, unknown> | null
                return (
                  <tr key={String(promo._id)} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{String(promo.artistName)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{String(promo.trackTitle)}</p>
                      {!!promo.genre && <p className="text-xs text-gray-500">{String(promo.genre)}</p>}
                    </td>
                    <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                      {client ? `${String(client.firstName || '')} ${String(client.lastName || '')}`.trim() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {promo.package ? (
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PKG_COLORS[String(promo.package)] || 'bg-gray-500/20 text-gray-400'}`}>
                          {String(promo.package)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[String(promo.status)] || 'bg-gray-500/20 text-gray-400'}`}>
                        {String(promo.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{Number(promo.streamCount ?? 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                      {new Date(String(promo.createdAt)).toLocaleDateString()}
                    </td>
                  </tr>
                )
              })}
              {promos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No music promotions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
