export const dynamic = 'force-dynamic'

import connectDB from '@/lib/mongodb'
import Service from '@/lib/models/Service'
import MusicPromotion from '@/lib/models/MusicPromotion'
import Link from 'next/link'

async function getStats() {
  await connectDB()
  const [featuredServices, activePromos, totalPromos] = await Promise.all([
    Service.find({ isFeatured: true }).select('name category priceNGN priceUSD icon').lean() as Promise<Array<Record<string, unknown>>>,
    MusicPromotion.countDocuments({ status: 'active' }),
    MusicPromotion.countDocuments(),
  ])
  return { featuredServices, activePromos, totalPromos }
}

export default async function PromotionsPage() {
  const { featuredServices, activePromos, totalPromos } = await getStats()

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Promotions</h2>
        <p className="text-sm text-gray-400 mt-0.5">Manage featured services and promotional campaigns</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { icon: '⭐', label: 'Featured Services', value: featuredServices.length, href: '/admin/services' },
          { icon: '🎵', label: 'Active Music Promos', value: activePromos, href: '/admin/music' },
          { icon: '📊', label: 'Total Music Campaigns', value: totalPromos, href: '/admin/music' },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900 p-5 hover:border-brand-500/40 transition-all"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-2xl shrink-0">{stat.icon}</div>
            <div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
          <h5 className="text-sm font-semibold text-white">Featured Services</h5>
          <Link href="/admin/services" className="text-xs text-brand-400 hover:underline">Manage →</Link>
        </div>
        {featuredServices.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-gray-500 mb-3">No featured services. Mark services as featured to show them here.</p>
            <Link href="/admin/services" className="text-xs text-brand-400 hover:underline">Go to Services →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3">
            {featuredServices.map((svc) => (
              <div key={String(svc._id)} className="p-5 hover:bg-gray-800/40 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">{String(svc.icon || '⚙️')}</span>
                  <p className="font-medium text-white text-sm">{String(svc.name)}</p>
                </div>
                <p className="text-xs text-gray-400 mb-2">{String(svc.category || '—')}</p>
                <div className="flex items-center gap-3 text-xs">
                  {!!svc.priceNGN && <span className="text-white font-medium">₦{Number(svc.priceNGN).toLocaleString()}</span>}
                  {!!svc.priceUSD && <span className="text-gray-400">${Number(svc.priceUSD)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brand-500/30 bg-gradient-to-r from-brand-900/40 to-brand-500/10 p-6">
        <div>
          <h5 className="text-sm font-bold text-white mb-1">🎵 Music Promotion Campaigns</h5>
          <p className="text-xs text-gray-400">View and manage all active music promotion campaigns from your clients.</p>
        </div>
        <Link href="/admin/music" className="shrink-0 rounded-full bg-brand-500 px-5 py-2 text-xs font-bold text-white hover:bg-brand-600 transition-all">
          View Campaigns →
        </Link>
      </div>
    </>
  )
}
