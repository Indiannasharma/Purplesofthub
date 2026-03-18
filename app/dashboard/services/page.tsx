export const dynamic = 'force-dynamic'

import connectDB from '@/lib/mongodb'
import Service from '@/lib/models/Service'
import Link from 'next/link'

async function getServices() {
  await connectDB()
  return Service.find({ isActive: true }).sort({ order: 1, isFeatured: -1, createdAt: -1 }).lean() as Promise<Array<Record<string, unknown>>>
}

export default async function ClientServicesPage() {
  const services = await getServices()

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Our Services</h2>
        <p className="text-sm text-gray-400 mt-0.5">Browse all available services and get started today</p>
      </div>

      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-800 bg-gray-900 p-16 text-center">
          <p className="text-5xl mb-4">🛍️</p>
          <p className="text-sm font-semibold text-white mb-1">No services available yet</p>
          <p className="text-xs text-gray-400">Check back soon for our latest offerings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((svc) => (
            <div key={String(svc._id)} className="flex flex-col rounded-xl border border-gray-800 bg-gray-900 p-6 hover:border-brand-500/40 transition-all">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-2xl">
                  {String(svc.icon || '⚙️')}
                </div>
                {!!svc.isFeatured && (
                  <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-400">Popular</span>
                )}
              </div>

              <h3 className="mb-2 font-semibold text-white">{String(svc.name)}</h3>
              <p className="mb-4 flex-1 text-xs text-gray-400 leading-relaxed">
                {String(svc.shortDesc || svc.description || 'Contact us for details.')}
              </p>

              {(svc.features as string[] | undefined)?.length ? (
                <ul className="mb-4 space-y-1.5">
                  {(svc.features as string[]).slice(0, 3).map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="h-1 w-1 shrink-0 rounded-full bg-brand-500" />
                      {f}
                    </li>
                  ))}
                  {(svc.features as string[]).length > 3 && (
                    <li className="text-xs text-gray-500">+ {(svc.features as string[]).length - 3} more features</li>
                  )}
                </ul>
              ) : null}

              <div className="mt-auto">
                <div className="mb-4 flex items-baseline gap-3">
                  {!!svc.priceNGN && (
                    <span className="text-xl font-bold text-white">₦{Number(svc.priceNGN).toLocaleString()}</span>
                  )}
                  {!!svc.priceUSD && (
                    <span className="text-sm text-gray-400">${Number(svc.priceUSD).toLocaleString()}</span>
                  )}
                  {!!svc.deliveryDays && (
                    <span className="ml-auto text-xs text-gray-500">{Number(svc.deliveryDays)} days</span>
                  )}
                </div>
                <a
                  href={`mailto:hello@purplesofthub.com?subject=Enquiry: ${String(svc.name)}`}
                  className="block w-full rounded-full bg-brand-500 py-2.5 text-center text-xs font-semibold text-white hover:bg-brand-600 transition-all"
                >
                  Get Started
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
