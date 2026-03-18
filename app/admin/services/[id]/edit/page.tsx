export const dynamic = 'force-dynamic'

import connectDB from '@/lib/mongodb'
import Service from '@/lib/models/Service'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

const CATEGORIES = [
  'web-development', 'mobile-apps', 'digital-marketing', 'ui-ux-design',
  'saas-development', 'music-promotion', 'content-creation', 'seo', 'social-media',
]

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectDB()

  const svc = await Service.findById(id).lean() as Record<string, unknown> | null
  if (!svc) notFound()

  const features = (svc.features as string[] ?? []).join('\n')

  async function updateService(formData: FormData) {
    'use server'
    const { default: connectDBFn } = await import('@/lib/mongodb')
    const { default: ServiceModel } = await import('@/lib/models/Service')
    await connectDBFn()
    const name = String(formData.get('name') || '').trim()
    const featuresRaw = String(formData.get('features') || '')
    const feats = featuresRaw.split('\n').map((f) => f.trim()).filter(Boolean)
    await ServiceModel.findByIdAndUpdate(id, {
      name,
      category: formData.get('category'),
      description: formData.get('description'),
      shortDesc: formData.get('shortDesc'),
      features: feats,
      priceNGN: Number(formData.get('priceNGN')) || undefined,
      priceUSD: Number(formData.get('priceUSD')) || undefined,
      deliveryDays: Number(formData.get('deliveryDays')) || undefined,
      icon: formData.get('icon') || '⚙️',
      isActive: formData.get('isActive') === 'on',
      isFeatured: formData.get('isFeatured') === 'on',
    })
    redirect('/admin/services')
  }

  return (
    <>
      <div className="mb-6">
        <Link href="/admin/services" className="text-xs text-gray-400 hover:text-brand-400 mb-3 inline-block">
          ← Back to Services
        </Link>
        <h2 className="text-2xl font-bold text-white">Edit Service</h2>
        <p className="text-sm text-gray-400 mt-0.5">{String(svc.name)}</p>
      </div>

      <div className="max-w-2xl rounded-xl border border-gray-800 bg-gray-900 p-6">
        <form action={updateService} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Service Name <span className="text-red-400">*</span></label>
              <input type="text" name="name" required defaultValue={String(svc.name)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Icon (emoji)</label>
              <input type="text" name="icon" defaultValue={String(svc.icon || '⚙️')} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Category</label>
            <select name="category" defaultValue={String(svc.category || '')} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none">
              <option value="">— Select category —</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Short Description</label>
            <input type="text" name="shortDesc" defaultValue={String(svc.shortDesc || '')} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Full Description</label>
            <textarea name="description" rows={4} defaultValue={String(svc.description || '')} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none resize-none" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Features <span className="text-xs text-gray-500">(one per line)</span></label>
            <textarea name="features" rows={4} defaultValue={features} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none resize-none font-mono text-xs" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Price (₦)</label>
              <input type="number" name="priceNGN" min="0" defaultValue={Number(svc.priceNGN) || ''} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Price ($)</label>
              <input type="number" name="priceUSD" min="0" defaultValue={Number(svc.priceUSD) || ''} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Delivery (days)</label>
              <input type="number" name="deliveryDays" min="1" defaultValue={Number(svc.deliveryDays) || ''} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isActive" defaultChecked={Boolean(svc.isActive)} className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-brand-500 focus:ring-brand-500" />
              <span className="text-sm text-gray-300">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isFeatured" defaultChecked={Boolean(svc.isFeatured)} className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-brand-500 focus:ring-brand-500" />
              <span className="text-sm text-gray-300">Featured</span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-all">
              Save Changes
            </button>
            <Link href="/admin/services" className="text-sm text-gray-400 hover:text-white">Cancel</Link>
          </div>
        </form>
      </div>
    </>
  )
}
