import Service from '@/lib/models/Service'
import connectDB from '@/lib/mongodb'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const CATEGORIES = [
  'web-development', 'mobile-apps', 'digital-marketing', 'ui-ux-design',
  'saas-development', 'music-promotion', 'content-creation', 'seo', 'social-media',
]

export default function NewServicePage() {
  async function createService(formData: FormData) {
    'use server'
    const { default: connectDBFn } = await import('@/lib/mongodb')
    const { default: ServiceModel } = await import('@/lib/models/Service')
    await connectDBFn()
    const name = String(formData.get('name') || '').trim()
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const featuresRaw = String(formData.get('features') || '')
    const features = featuresRaw.split('\n').map((f) => f.trim()).filter(Boolean)
    await ServiceModel.create({
      name,
      slug,
      category: formData.get('category'),
      description: formData.get('description'),
      shortDesc: formData.get('shortDesc'),
      features,
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
        <h2 className="text-2xl font-bold text-white">New Service</h2>
        <p className="text-sm text-gray-400 mt-0.5">Add a new service to your offerings</p>
      </div>

      <div className="max-w-2xl rounded-xl border border-gray-800 bg-gray-900 p-6">
        <form action={createService} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Service Name <span className="text-red-400">*</span></label>
              <input type="text" name="name" required placeholder="e.g. Web Development" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Icon (emoji)</label>
              <input type="text" name="icon" placeholder="🌐" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Category</label>
            <select name="category" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none">
              <option value="">— Select category —</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Short Description</label>
            <input type="text" name="shortDesc" placeholder="One-line summary" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Full Description</label>
            <textarea name="description" rows={4} placeholder="Detailed description…" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none resize-none" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Features <span className="text-xs text-gray-500">(one per line)</span></label>
            <textarea name="features" rows={4} placeholder={"Responsive design\nSEO optimized\n5 pages included"} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none resize-none font-mono text-xs" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Price (₦)</label>
              <input type="number" name="priceNGN" min="0" placeholder="0" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Price ($)</label>
              <input type="number" name="priceUSD" min="0" placeholder="0" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Delivery (days)</label>
              <input type="number" name="deliveryDays" min="1" placeholder="14" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-brand-500 focus:ring-brand-500" />
              <span className="text-sm text-gray-300">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isFeatured" className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-brand-500 focus:ring-brand-500" />
              <span className="text-sm text-gray-300">Featured</span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-all">
              Create Service
            </button>
            <Link href="/admin/services" className="text-sm text-gray-400 hover:text-white">Cancel</Link>
          </div>
        </form>
      </div>
    </>
  )
}
