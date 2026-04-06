'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Service {
  id: string
  name: string
  slug: string
  category: string
  short_desc: string
  description: string
  features: string[]
  price_ngn: number
  price_usd: number
  delivery_days: number
  icon: string
  is_featured: boolean
}

const CATEGORIES = [
  'All',
  'web-development',
  'mobile-apps',
  'digital-marketing',
  'ui-ux-design',
  'music-promotion',
  'content-creation',
  'seo',
  'social-media'
]

export default function ClientServicesGrid({
  services,
  userId,
  existingProjects
}: {
  services: Service[]
  userId: string
  existingProjects: any[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [ordering, setOrdering] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderNote, setOrderNote] = useState('')

  const filtered =
    activeCategory === 'All'
      ? services
      : services.filter(s => s.category === activeCategory)

  const handleOrder = async (service: Service) => {
    setOrdering(true)
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        title: `${service.name} Project`,
        description: orderNote || `New ${service.name} project`,
        client_id: userId,
        status: 'pending',
        progress: 0,
        budget: service.price_ngn,
      })
      .select()
      .single()

    if (!error && project) {
      setSuccess(true)
      setSelectedService(null)
      setOrderNote('')
      setTimeout(() => {
        router.push('/dashboard/projects')
      }, 2000)
    }
    setOrdering(false)
  }

  return (
    <div>
      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-6 overflow-x-auto pb-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-brand-500 text-white'
                : 'border border-stroke dark:border-strokedark text-bodydark2 hover:border-brand-500 hover:text-brand-500'
            }`}
          >
            {cat === 'All'
              ? 'All Services'
              : cat
                  .replace(/-/g, ' ')
                  .replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Success message */}
      {success && (
        <div className="mb-6 px-4 py-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-500 text-sm flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="font-semibold">Order placed successfully!</p>
            <p className="opacity-80">Redirecting to your projects...</p>
          </div>
        </div>
      )}

      {/* Services grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-bodydark2">No services in this category yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(service => (
            <div
              key={service.id}
              className={`rounded-xl border bg-white shadow-sm dark:bg-boxdark p-6 transition-all hover:border-brand-500 ${
                service.is_featured ? 'border-brand-500 ring-1 ring-brand-500/30' : 'border-stroke dark:border-strokedark'
              }`}
            >
              {service.is_featured && (
                <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-brand-500 text-white font-medium mb-3">
                  ⭐ Featured
                </span>
              )}

              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{service.icon || '⚙️'}</span>
                <div>
                  <h5 className="font-bold text-black dark:text-white">{service.name}</h5>
                  <span className="text-xs text-bodydark2 capitalize">
                    {service.category?.replace(/-/g, ' ')}
                  </span>
                </div>
              </div>

              <p className="text-sm text-bodydark2 mb-4 line-clamp-2">
                {service.short_desc || service.description}
              </p>

              {/* Features */}
              {service.features?.length > 0 && (
                <ul className="space-y-1.5 mb-4">
                  {service.features.slice(0, 4).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-bodydark2">
                      <span className="text-brand-500 flex-shrink-0">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              {/* Price + CTA */}
              <div className="border-t border-stroke dark:border-strokedark pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xl font-bold text-brand-500">
                      ₦{Number(service.price_ngn || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-bodydark2">${Number(service.price_usd || 0).toLocaleString()} USD</p>
                  </div>
                  {service.delivery_days && (
                    <span className="text-xs text-bodydark2 bg-brand-500/10 text-brand-500 px-2 py-1 rounded-full">
                      {service.delivery_days} days
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedService(service)}
                  className="w-full py-2.5 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-all"
                >
                  Order Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-stroke bg-white shadow-2xl dark:border-strokedark dark:bg-boxdark p-6">
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-bold text-black dark:text-white text-lg">Confirm Order</h5>
              <button
                onClick={() => setSelectedService(null)}
                className="text-bodydark2 hover:text-black dark:hover:text-white transition-colors text-xl"
              >
                ✕
              </button>
            </div>

            <div className="rounded-lg bg-brand-500/10 p-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedService.icon || '⚙️'}</span>
                <div>
                  <p className="font-semibold text-black dark:text-white">{selectedService.name}</p>
                  <p className="text-brand-500 font-bold">
                    ₦{Number(selectedService.price_ngn || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-bodydark2 mb-1.5">Project notes (optional)</label>
              <textarea
                value={orderNote}
                onChange={e => setOrderNote(e.target.value)}
                placeholder="Describe what you need..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-stroke dark:border-strokedark bg-transparent text-sm text-black dark:text-white placeholder-bodydark2 focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedService(null)}
                className="flex-1 py-2.5 rounded-lg border border-stroke dark:border-strokedark text-sm font-medium text-bodydark2 hover:border-brand-500 hover:text-brand-500 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleOrder(selectedService)}
                disabled={ordering}
                className="flex-1 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-all disabled:opacity-50"
              >
                {ordering ? 'Placing...' : 'Place Order →'}
              </button>
            </div>

            <p className="text-xs text-bodydark2 text-center mt-3">
              Our team will contact you within 24 hours to confirm details
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
