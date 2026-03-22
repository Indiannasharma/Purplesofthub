import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminServicesPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) redirect('/sign-in')

  const role = user.user_metadata?.role || user.app_metadata?.role
  if (role !== 'admin') redirect('/dashboard')

  const { data: services } = await supabase.from('services').select('*').order('order')

  return (
    <>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white">Services</h2>
          <p className="text-sm text-bodydark2 mt-1">
            {services?.filter(s => s.is_active).length || 0} active services
          </p>
        </div>
        <Link
          href="/admin/services/new"
          className="px-4 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-all"
        >
          + New Service
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {!services?.length ? (
          <div className="col-span-3 rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark p-12 text-center">
            <p className="text-4xl mb-4">⚙️</p>
            <p className="font-medium text-black dark:text-white mb-2">No services yet</p>
            <Link
              href="/admin/services/new"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-all"
            >
              + Add First Service
            </Link>
          </div>
        ) : (
          services.map((service: any) => (
            <div
              key={service.id}
              className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{service.icon || '⚙️'}</span>
                  <div>
                    <h6 className="font-semibold text-black dark:text-white">{service.name}</h6>
                    <span className="text-xs text-bodydark2 capitalize">
                      {service.category?.replace('-', ' ')}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    service.is_active
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
                  }`}
                >
                  {service.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-bodydark2 mb-3 line-clamp-2">
                {service.short_desc || service.description || 'No description'}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-brand-500">
                    ₦{Number(service.price_ngn || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-bodydark2">${Number(service.price_usd || 0).toLocaleString()} USD</p>
                </div>
                <Link
                  href={`/admin/services/${service.id}/edit`}
                  className="text-xs px-3 py-1.5 rounded-lg border border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white transition-all"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
