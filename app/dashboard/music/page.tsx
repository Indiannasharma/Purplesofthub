export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import MusicPromotion from '@/lib/models/MusicPromotion'
import Link from 'next/link'

const STATUS_COLORS: Record<string, string> = {
  submitted:   'bg-blue-500/20 text-blue-400',
  'in-review': 'bg-yellow-500/20 text-yellow-400',
  active:      'bg-brand-500/20 text-brand-400',
  completed:   'bg-green-500/20 text-green-400',
}

const PKG_LABELS: Record<string, string> = {
  starter: 'Starter — Basic coverage',
  growth:  'Growth — Expanded reach',
  pro:     'Pro — Maximum impact',
}

export default async function ClientMusicPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  await connectDB()
  const user = await User.findOne({ clerkId: userId }).lean() as Record<string, unknown> | null
  if (!user) redirect('/dashboard')

  const promos = await MusicPromotion.find({ client: user._id })
    .sort({ createdAt: -1 })
    .lean() as Array<Record<string, unknown>>

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Music Promotion</h2>
        <p className="text-sm text-gray-400 mt-0.5">Track your music promotion campaigns</p>
      </div>

      {promos.length === 0 ? (
        <>
          {/* Promo CTA */}
          <div className="mb-6 rounded-xl border border-brand-500/30 bg-gradient-to-br from-brand-900/40 to-brand-500/10 p-8 text-center">
            <p className="text-4xl mb-4">🎵</p>
            <h3 className="text-lg font-bold text-white mb-2">Grow Your Music Career</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
              Get your music on 150+ streaming platforms, editorial playlists, and build a global fanbase with our expert promotion packages.
            </p>
            <a
              href="mailto:hello@purplesofthub.com?subject=Music Promotion Enquiry"
              className="inline-flex rounded-full bg-gradient-to-r from-brand-700 to-brand-500 px-6 py-3 text-sm font-bold text-white hover:opacity-90 transition-all"
            >
              Start Your Campaign →
            </a>
          </div>

          {/* Packages */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { name: 'Starter', price: '₦15,000', features: ['5 platforms', '2 weeks campaign', 'Progress report'], color: 'border-gray-700' },
              { name: 'Growth', price: '₦35,000', features: ['30+ platforms', '4 weeks campaign', 'Playlist pitching', 'Weekly reports'], color: 'border-brand-500', badge: 'Popular' },
              { name: 'Pro', price: '₦75,000', features: ['150+ platforms', '8 weeks campaign', 'Editorial pitching', 'Daily reports', 'Social media push'], color: 'border-yellow-500/50' },
            ].map((pkg) => (
              <div key={pkg.name} className={`rounded-xl border ${pkg.color} bg-gray-900 p-6 relative`}>
                {pkg.badge && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-0.5 text-xs font-semibold text-white">
                    {pkg.badge}
                  </span>
                )}
                <h4 className="font-bold text-white mb-1">{pkg.name}</h4>
                <p className="text-2xl font-bold text-brand-400 mb-4">{pkg.price}</p>
                <ul className="space-y-2 mb-6">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="h-1 w-1 rounded-full bg-brand-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={`mailto:hello@purplesofthub.com?subject=Music Promotion - ${pkg.name} Package`}
                  className="block w-full rounded-full border border-brand-500/50 py-2 text-center text-xs font-semibold text-brand-400 hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-all"
                >
                  Get {pkg.name}
                </a>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          {promos.map((promo) => (
            <div key={String(promo._id)} className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-semibold text-white">{String(promo.artistName)}</h3>
                  <p className="text-sm text-gray-400 mt-0.5">🎵 {String(promo.trackTitle)}</p>
                  {!!promo.genre && <p className="text-xs text-gray-500 mt-0.5">{String(promo.genre)}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {!!promo.package && (
                    <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-xs font-medium text-brand-400 capitalize">
                      {String(promo.package)}
                    </span>
                  )}
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[String(promo.status)] || 'bg-gray-500/20 text-gray-400'}`}>
                    {String(promo.status)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Streams</p>
                  <p className="text-xl font-bold text-white">{Number(promo.streamCount ?? 0).toLocaleString()}</p>
                </div>
                {!!promo.campaignStartDate && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Started</p>
                    <p className="text-sm text-gray-300">{new Date(String(promo.campaignStartDate)).toLocaleDateString()}</p>
                  </div>
                )}
                {!!promo.campaignEndDate && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Ends</p>
                    <p className="text-sm text-gray-300">{new Date(String(promo.campaignEndDate)).toLocaleDateString()}</p>
                  </div>
                )}
                {(promo.playlistPlacements as string[] | undefined)?.length ? (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Playlists</p>
                    <p className="text-xl font-bold text-green-400">{(promo.playlistPlacements as string[]).length}</p>
                  </div>
                ) : null}
              </div>

              {!!promo.trackLink && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <a
                    href={String(promo.trackLink)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-400 hover:underline"
                  >
                    Listen to track ↗
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
