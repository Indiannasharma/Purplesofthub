'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORY_OPTIONS = [
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-apps', label: 'Mobile Apps' },
  { value: 'digital-marketing', label: 'Digital Marketing' },
  { value: 'ui-ux-design', label: 'UI/UX Design' },
  { value: 'saas-development', label: 'SaaS Development' },
  { value: 'music-promotion', label: 'Music Promotion' },
  { value: 'content-creation', label: 'Content Creation' },
  { value: 'seo', label: 'SEO' },
  { value: 'social-media', label: 'Social Media' },
]

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export type ServiceFormData = {
  name: string
  slug: string
  category: string
  shortDesc: string
  description: string
  features: string[]
  priceNGN: number
  priceUSD: number
  deliveryDays: number
  icon: string
  isActive: boolean
  isFeatured: boolean
  order: number
}

const EMPTY_FORM: ServiceFormData = {
  name: '',
  slug: '',
  category: '',
  shortDesc: '',
  description: '',
  features: [''],
  priceNGN: 0,
  priceUSD: 0,
  deliveryDays: 0,
  icon: '',
  isActive: true,
  isFeatured: false,
  order: 0,
}

export default function ServiceForm({
  mode,
  serviceId,
  initialData,
}: {
  mode: 'create' | 'edit'
  serviceId?: string
  initialData?: Partial<ServiceFormData>
}) {
  const router = useRouter()
  const [form, setForm] = useState<ServiceFormData>({ ...EMPTY_FORM, ...initialData })
  const [slugEdited, setSlugEdited] = useState(Boolean(initialData?.slug))
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!slugEdited && form.name.trim()) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.name) }))
    }
  }, [form.name, slugEdited])

  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({ ...prev, ...initialData }))
    }
  }, [initialData])

  const features = useMemo(() => form.features ?? [''], [form.features])

  const updateField = (key: keyof ServiceFormData, value: ServiceFormData[keyof ServiceFormData]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const updateFeature = (index: number, value: string) => {
    const next = [...features]
    next[index] = value
    updateField('features', next)
  }

  const addFeature = () => updateField('features', [...features, ''])

  const removeFeature = (index: number) => {
    const next = features.filter((_, i) => i !== index)
    updateField('features', next.length ? next : [''])
  }

  const validate = () => {
    if (!form.name.trim()) return 'Service name is required.'
    if (!form.slug.trim()) return 'Slug is required.'
    return null
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      const payload = {
        ...form,
        slug: slugify(form.slug || form.name),
        features: features.map((f) => f.trim()).filter(Boolean),
      }

      const res = await fetch(
        mode === 'create' ? '/api/admin/services' : `/api/admin/services/${serviceId}`,
        {
          method: mode === 'create' ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Something went wrong.')
        setLoading(false)
        return
      }

      const search = mode === 'create' ? 'created=1' : 'updated=1'
      router.push(`/admin/services?${search}`)
    } catch (err) {
      console.error('Service form submit error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 960 }}>
      <div
        style={{
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(124,58,237,.18)',
          borderRadius: 16,
          padding: 24,
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#e2d9f3' }}>
              {mode === 'create' ? 'Create New Service' : 'Edit Service'}
            </h1>
            <p style={{ fontSize: 13, color: '#9d8fd4' }}>
              {mode === 'create'
                ? 'Add a new service to the PurpleSoftHub catalog.'
                : 'Update details, pricing, and visibility for this service.'}
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 22px',
              borderRadius: 50,
              border: 'none',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Saving...' : 'Save Service'}
          </button>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239,68,68,.12)',
              color: '#f87171',
              padding: '10px 14px',
              borderRadius: 10,
              marginBottom: 16,
              border: '1px solid rgba(239,68,68,.2)',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#9d8fd4' }}>Name *</span>
            <input
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Service name"
              style={inputStyle}
            />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#9d8fd4' }}>Slug *</span>
            <input
              value={form.slug}
              onChange={(e) => {
                setSlugEdited(true)
                updateField('slug', e.target.value)
              }}
              placeholder="service-slug"
              style={inputStyle}
            />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#9d8fd4' }}>Category</span>
            <select
              value={form.category}
              onChange={(e) => updateField('category', e.target.value)}
              style={{ ...inputStyle, height: 42 }}
            >
              <option value="">Select category</option>
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#9d8fd4' }}>Icon (emoji)</span>
            <input
              value={form.icon}
              onChange={(e) => updateField('icon', e.target.value)}
              placeholder="✨"
              style={inputStyle}
            />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#9d8fd4' }}>Price NGN</span>
            <input
              type="number"
              value={form.priceNGN}
              onChange={(e) => updateField('priceNGN', Number(e.target.value))}
              style={inputStyle}
              min={0}
            />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#9d8fd4' }}>Price USD</span>
            <input
              type="number"
              value={form.priceUSD}
              onChange={(e) => updateField('priceUSD', Number(e.target.value))}
              style={inputStyle}
              min={0}
            />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#9d8fd4' }}>Delivery Days</span>
            <input
              type="number"
              value={form.deliveryDays}
              onChange={(e) => updateField('deliveryDays', Number(e.target.value))}
              style={inputStyle}
              min={0}
            />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#9d8fd4' }}>Order</span>
            <input
              type="number"
              value={form.order}
              onChange={(e) => updateField('order', Number(e.target.value))}
              style={inputStyle}
              min={0}
            />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 18 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#9d8fd4' }}>Short Description</span>
            <textarea
              value={form.shortDesc}
              onChange={(e) => updateField('shortDesc', e.target.value)}
              rows={3}
              style={textareaStyle}
            />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#9d8fd4' }}>Full Description</span>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
              style={textareaStyle}
            />
          </label>
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: '#9d8fd4' }}>Features</span>
            <button
              type="button"
              onClick={addFeature}
              style={{
                padding: '6px 12px',
                borderRadius: 50,
                border: '1px solid rgba(124,58,237,.4)',
                background: 'transparent',
                color: '#a855f7',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + Add Feature
            </button>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {features.map((feature, index) => (
              <div key={`feature-${index}`} style={{ display: 'flex', gap: 10 }}>
                <input
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  placeholder={`Feature ${index + 1}`}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid rgba(239,68,68,.3)',
                    background: 'rgba(239,68,68,.1)',
                    color: '#f87171',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20, marginTop: 22, flexWrap: 'wrap' }}>
          <label style={toggleRowStyle}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => updateField('isActive', e.target.checked)}
            />
            <span>Is Active</span>
          </label>
          <label style={toggleRowStyle}>
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => updateField('isFeatured', e.target.checked)}
            />
            <span>Is Featured</span>
          </label>
        </div>
      </div>
    </form>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,.04)',
  border: '1px solid rgba(124,58,237,.2)',
  borderRadius: 10,
  padding: '10px 12px',
  color: '#e2d9f3',
  fontSize: 14,
  outline: 'none',
}

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 90,
  resize: 'vertical',
}

const toggleRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  fontSize: 13,
  color: '#9d8fd4',
}
