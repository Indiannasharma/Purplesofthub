'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const CATEGORIES = [
  'web-development',
  'mobile-apps',
  'digital-marketing',
  'ui-ux-design',
  'saas-development',
  'music-promotion',
  'content-creation',
  'seo',
  'social-media'
]

export default function NewService() {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [features, setFeatures] = useState<string[]>([''])
  const [form, setForm] = useState({
    name: '',
    slug: '',
    category: '',
    description: '',
    short_desc: '',
    price_ngn: '',
    price_usd: '',
    delivery_days: '',
    icon: '',
    is_active: true,
    is_featured: false,
    order: 0,
  })

  const handleNameChange = (val: string) => {
    setForm(f => ({
      ...f,
      name: val,
      slug: val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    }))
  }

  const updateFeature = (index: number, val: string) => {
    setFeatures(prev => {
      const updated = [...prev]
      updated[index] = val
      return updated
    })
  }

  const addFeature = () => {
    setFeatures(prev => [...prev, ''])
  }

  const removeFeature = (index: number) => {
    setFeatures(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!form.name || !form.category) {
      setError('Name and category are required')
      return
    }
    setSaving(true)
    setError('')

    const { error: err } = await supabase.from('services').insert({
      ...form,
      features: features.filter(Boolean),
      price_ngn: form.price_ngn ? Number(form.price_ngn) : null,
      price_usd: form.price_usd ? Number(form.price_usd) : null,
      delivery_days: form.delivery_days ? Number(form.delivery_days) : null,
    })

    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }

    router.push('/admin/services')
  }

  const inputClass = `w-full px-4 py-2.5 rounded-lg border border-stroke dark:border-strokedark bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-brand-500`

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/services"
          className="text-bodydark2 hover:text-brand-500 transition-colors text-sm"
        >
          ← Services
        </Link>
        <h2 className="text-2xl font-bold text-black dark:text-white">New Service</h2>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-bodydark2 mb-1.5">Service Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="e.g. Web Development"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-bodydark2 mb-1.5">URL Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-bodydark2 mb-1.5">Category *</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className={inputClass + ' bg-white dark:bg-boxdark'}
            >
              <option value="">Select category...</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat.replace(/-/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-bodydark2 mb-1.5">Icon (emoji)</label>
            <input
              type="text"
              value={form.icon}
              onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
              placeholder="e.g. 🌐"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-bodydark2 mb-1.5">Delivery Days</label>
            <input
              type="number"
              value={form.delivery_days}
              onChange={e => setForm(f => ({ ...f, delivery_days: e.target.value }))}
              placeholder="e.g. 14"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-bodydark2 mb-1.5">Price (NGN ₦)</label>
            <input
              type="number"
              value={form.price_ngn}
              onChange={e => setForm(f => ({ ...f, price_ngn: e.target.value }))}
              placeholder="e.g. 150000"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-bodydark2 mb-1.5">Price (USD $)</label>
            <input
              type="number"
              value={form.price_usd}
              onChange={e => setForm(f => ({ ...f, price_usd: e.target.value }))}
              placeholder="e.g. 100"
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-bodydark2 mb-1.5">Short Description</label>
            <input
              type="text"
              value={form.short_desc}
              onChange={e => setForm(f => ({ ...f, short_desc: e.target.value }))}
              placeholder="One line summary..."
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-bodydark2 mb-1.5">Full Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Detailed description..."
              rows={4}
              className={inputClass + ' resize-none'}
            />
          </div>
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-medium text-bodydark2 mb-2">Features</label>
          <div className="space-y-2">
            {features.map((feature, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={feature}
                  onChange={e => updateFeature(i, e.target.value)}
                  placeholder={`Feature ${i + 1}`}
                  className={inputClass}
                />
                <button
                  onClick={() => removeFeature(i)}
                  disabled={features.length === 1}
                  className="px-3 py-2 rounded-lg border border-stroke dark:border-strokedark text-bodydark2 hover:text-red-500 hover:border-red-500 transition-all disabled:opacity-30"
                >
                  ✕
                </button>
              </div>
            ))}
            <button onClick={addFeature} className="text-sm text-brand-500 hover:text-brand-600 font-medium">
              + Add Feature
            </button>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
              className="accent-brand-500 w-4 h-4"
            />
            <span className="text-sm text-black dark:text-white">Active</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))}
              className="accent-brand-500 w-4 h-4"
            />
            <span className="text-sm text-black dark:text-white">Featured</span>
          </label>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Link
            href="/admin/services"
            className="px-5 py-2.5 rounded-lg border border-stroke dark:border-strokedark text-sm font-medium text-bodydark2 hover:border-brand-500 hover:text-brand-500 transition-all"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-all disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Service'}
          </button>
        </div>
      </div>
    </div>
  )
}
