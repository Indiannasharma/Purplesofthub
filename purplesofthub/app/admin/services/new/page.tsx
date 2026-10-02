'use client'

import { useState } from 'react'
import { AdminPage } from "@/components/admin/AdminPage";
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const SERVICE_CATEGORIES = [
  'Web Development',
  'Mobile Apps',
  'Digital Marketing',
  'UI/UX Design',
  'SaaS Development',
  'Music Promotion',
  'Social Media Management',
  'Video Editing',
  'Branding & Design',
  'SEO & Growth',
  'Cybersecurity',
  'Account Recovery',
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '10px',
  border: "1px solid var(--cc-border)",
  background: 'rgba(124,58,237,0.06)',
  color: "var(--cc-text)",
  fontSize: '14px',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  color: "var(--cc-text-secondary)",
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  marginBottom: '7px',
}

export default function NewServicePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [features, setFeatures] = useState(['', '', ''])

  const [form, setForm] = useState({
    name: '',
    slug: '',
    category: '',
    icon: '',
    delivery_days: '',
    price_ngn: '',
    price_usd: '',
    short_description: '',
    full_description: '',
    status: 'active',
  })

  const update = (field: string, value: string) => {
    setForm(p => {
      const updated = { ...p, [field]: value }
      if (field === 'name' && !p.slug) {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim()
      }
      return updated
    })
  }

  const updateFeature = (i: number, val: string) => {
    setFeatures(p => {
      const updated = [...p]
      updated[i] = val
      return updated
    })
  }

  const addFeature = () => setFeatures(p => [...p, ''])
  const removeFeature = (i: number) => setFeatures(p => p.filter((_, idx) => idx !== i))

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Service name is required'); return }
    if (!form.category) { setError('Category is required'); return }

    setSaving(true)
    setError('')

    try {
      const supabase = createClient()
      const { error: dbError } = await supabase.from('services').insert({
        name: form.name.trim(),
        slug: form.slug.trim() || form.name.toLowerCase().replace(/\s+/g, '-'),
        category: form.category,
        icon: form.icon.trim() || null,
        delivery_days: form.delivery_days ? parseInt(form.delivery_days) : null,
        price_ngn: form.price_ngn ? parseFloat(form.price_ngn) : null,
        price_usd: form.price_usd ? parseFloat(form.price_usd) : null,
        short_description: form.short_description.trim() || null,
        full_description: form.full_description.trim() || null,
        features: features.filter(f => f.trim()).map(f => f.trim()),
        status: form.status,
      })

      if (dbError) throw dbError
      router.push('/admin/services')
    } catch (err: unknown) {
      setError((err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Unknown error') || 'Failed to save service')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminPage className="cc-module admin-form admin-adopted">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href="/admin/services" style={{ fontSize: '13px', color: "var(--cc-text-secondary)", textDecoration: 'none' }}>← Services</Link>
          <span style={{ color: "var(--cc-text-muted)" }}>/</span>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: "var(--cc-text)", margin: 0 }}>New Service</h1>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: saving ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7c3aed, #a855f7)', color: "var(--cc-on-accent)", padding: '11px 28px', borderRadius: '12px', border: 'none', fontWeight: 600, fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: "none" }}>
          {saving ? '⏳ Saving...' : '✅ Save Service'}
        </button>
      </div>

      {error && (
        <div style={{ background: "var(--cc-error-soft)", border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: "var(--cc-error)" }}>⚠️ {error}</div>
      )}

      <div style={{ display: 'grid', gap: '16px' }}>
        {/* Basic Info */}
        <div style={{ background: "var(--cc-surface)", border: "1px solid var(--cc-border)", borderRadius: 12, padding: '24px', display: 'grid', gap: '16px' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: "var(--cc-text)", margin: 0 }}>📋 Basic Information</p>
          <div>
            <label style={labelStyle} htmlFor="admin-servicesnewpagetsx-1">Service Name *</label>
            <input type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Web Development" style={inputStyle}   id="admin-servicesnewpagetsx-1"/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="admin-responsive-grid">
            <div>
              <label style={labelStyle} htmlFor="admin-servicesnewpagetsx-2">URL Slug</label>
              <input type="text" value={form.slug} onChange={e => update('slug', e.target.value)} placeholder="web-development" style={inputStyle}   id="admin-servicesnewpagetsx-2"/>
            </div>
            <div>
              <label style={labelStyle} htmlFor="admin-servicesnewpagetsx-3">Category *</label>
              <select value={form.category} onChange={e => update('category', e.target.value)} style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}  id="admin-servicesnewpagetsx-3">
                <option value="">Select category...</option>
                {SERVICE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="admin-responsive-grid">
            <div>
              <label style={labelStyle} htmlFor="admin-servicesnewpagetsx-4">Icon (emoji)</label>
              <input type="text" value={form.icon} onChange={e => update('icon', e.target.value)} placeholder="e.g. 🌐" style={inputStyle}   id="admin-servicesnewpagetsx-4"/>
            </div>
            <div>
              <label style={labelStyle} htmlFor="admin-servicesnewpagetsx-5">Delivery Days</label>
              <input type="number" value={form.delivery_days} onChange={e => update('delivery_days', e.target.value)} placeholder="e.g. 14" style={inputStyle}   id="admin-servicesnewpagetsx-5"/>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div style={{ background: "var(--cc-surface)", border: "1px solid var(--cc-border)", borderRadius: 12, padding: '24px', display: 'grid', gap: '16px' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: "var(--cc-text)", margin: 0 }}>💰 Pricing</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="admin-responsive-grid">
            <div>
              <label style={labelStyle} htmlFor="admin-servicesnewpagetsx-6">Price (NGN ₦)</label>
              <input type="number" value={form.price_ngn} onChange={e => update('price_ngn', e.target.value)} placeholder="e.g. 450000" style={inputStyle}   id="admin-servicesnewpagetsx-6"/>
            </div>
            <div>
              <label style={labelStyle} htmlFor="admin-servicesnewpagetsx-7">Price (USD $)</label>
              <input type="number" value={form.price_usd} onChange={e => update('price_usd', e.target.value)} placeholder="e.g. 300" style={inputStyle}   id="admin-servicesnewpagetsx-7"/>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ background: "var(--cc-surface)", border: "1px solid var(--cc-border)", borderRadius: 12, padding: '24px', display: 'grid', gap: '16px' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: "var(--cc-text)", margin: 0 }}>📝 Description</p>
          <div>
            <label style={labelStyle} htmlFor="admin-servicesnewpagetsx-8">Short Description</label>
            <input type="text" value={form.short_description} onChange={e => update('short_description', e.target.value)} placeholder="One line summary..." style={inputStyle}   id="admin-servicesnewpagetsx-8"/>
          </div>
          <div>
            <label style={labelStyle} htmlFor="admin-servicesnewpagetsx-9">Full Description</label>
            <textarea value={form.full_description} onChange={e => update('full_description', e.target.value)} placeholder="Detailed description of the service..." rows={5} style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}   id="admin-servicesnewpagetsx-9"/>
          </div>
        </div>

        {/* Features */}
        <div style={{ background: "var(--cc-surface)", border: "1px solid var(--cc-border)", borderRadius: 12, padding: '24px', display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: "var(--cc-text)", margin: 0 }}>✅ Features / Inclusions</p>
            <button onClick={addFeature} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(124,58,237,0.25)', background: 'transparent', color: "var(--cc-accent)", fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>+ Add Feature</button>
          </div>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ color: "var(--cc-success)", flexShrink: 0, fontSize: '16px' }}>✓</span>
              <input type="text" value={f} onChange={e => updateFeature(i, e.target.value)} placeholder={`Feature ${i + 1}...`} style={{ ...inputStyle, marginBottom: 0 }}  aria-label={`Feature ${i + 1}...`}/>
              {features.length > 1 && <button onClick={() => removeFeature(i)} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'rgba(239,68,68,0.08)', color: "var(--cc-error)", cursor: 'pointer', flexShrink: 0, fontSize: '14px' }}>×</button>}
            </div>
          ))}
        </div>

        {/* Status */}
        <div style={{ background: "var(--cc-surface)", border: "1px solid var(--cc-border)", borderRadius: 12, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: "var(--cc-text)", margin: '0 0 2px' }}>Service Status</p>
            <p style={{ fontSize: '12px', color: "var(--cc-text-secondary)", margin: 0 }}>Active services show on the website</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['active', 'inactive'].map(s => (
              <button key={s} onClick={() => update('status', s)} style={{ padding: '8px 20px', borderRadius: '10px', border: form.status === s ? 'none' : '1px solid rgba(124,58,237,0.2)', background: form.status === s ? s === 'active' ? 'linear-gradient(135deg, #10b981, #34d399)' : 'rgba(107,114,128,0.2)' : 'transparent', color: form.status === s ? '#fff' : '#9d8fd4', fontWeight: 600, fontSize: '13px', cursor: 'pointer', textTransform: 'capitalize' }}>
                {s === 'active' ? '🟢' : '⚫'} {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AdminPage>
  )
}