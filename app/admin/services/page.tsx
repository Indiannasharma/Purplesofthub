export const dynamic = 'force-dynamic'

import connectDB from '@/lib/mongodb'
import Service from '@/lib/models/Service'
import Link from 'next/link'

async function getServices() {
  await connectDB()
  return Service.find({}).sort({ order: 1, createdAt: -1 }).lean() as Promise<Array<Record<string, unknown>>>
}

export default async function ServicesPage() {
  const services = await getServices()

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Services</h2>
          <p className="text-sm text-gray-400 mt-0.5">{services.length} services configured</p>
        </div>
        <Link
          href="/admin/services/new"
          className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-all"
        >
          + New Service
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((svc) => (
          <div key={String(svc._id)} className="rounded-xl border border-gray-800 bg-gray-900 p-5 hover:border-brand-500/40 transition-all">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-xl">
                {String(svc.icon || '⚙️')}
              </div>
              <div className="flex items-center gap-2">
                {!!svc.isFeatured && (
                  <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-400">Featured</span>
                )}
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${svc.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                  {svc.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <h3 className="mb-1 font-semibold text-white">{String(svc.name)}</h3>
            <p className="mb-3 text-xs text-gray-400 line-clamp-2">{String(svc.shortDesc || svc.description || '—')}</p>
            <div className="mb-4 flex items-center gap-3 text-xs text-gray-400">
              <span className="rounded-full bg-gray-800 px-2 py-0.5">{String(svc.category || '—')}</span>
              {!!svc.deliveryDays && <span>{Number(svc.deliveryDays)} days</span>}
            </div>
            <div className="mb-4 flex items-center gap-4 text-sm">
              {!!svc.priceNGN && (
                <span className="font-semibold text-white">₦{Number(svc.priceNGN).toLocaleString()}</span>
              )}
              {!!svc.priceUSD && (
                <span className="text-gray-400">${Number(svc.priceUSD).toLocaleString()}</span>
              )}
            </div>
            <Link
              href={`/admin/services/${String(svc._id)}/edit`}
              className="inline-flex text-xs text-brand-400 hover:underline"
            >
              Edit →
            </Link>
          </div>
        ))}
        {services.length === 0 && (
          <div className="col-span-3 rounded-xl border border-dashed border-gray-800 bg-gray-900/50 p-12 text-center">
            <p className="mb-1 text-sm font-semibold text-white">No services yet</p>
            <p className="mb-4 text-xs text-gray-400">Add your first service offering</p>
            <Link
              href="/admin/services/new"
              className="inline-flex rounded-full bg-brand-500 px-5 py-2 text-xs font-semibold text-white hover:bg-brand-600 transition-all"
            >
              + New Service
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
