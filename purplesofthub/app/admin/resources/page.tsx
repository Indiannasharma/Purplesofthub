'use client'

import { useEffect, useMemo, useState } from 'react'
import { PREMIUM_RESOURCES } from '@/app/portfolio/_data/resources'
import type { PremiumResource, ResourceCategory } from '@/types/portfolio'

const ADMIN_KEY = 'psh-admin-resources'
const CATEGORIES: ResourceCategory[] = [
  'Company Profile',
  'Corporate Profile',
  'Sponsorship Proposal',
  'Sponsorship Deck',
  'Brand Guidelines',
  'Capability Statement',
  'Annual Report',
  'Magazine',
  'Product Catalogue',
  'Marketing Brochure',
  'Training Manual',
  'Business Proposal',
  'Event Branding Kit',
  'Investment Pitch Deck',
]

const emptyForm = {
  title: '',
  description: '',
  category: 'Capability Statement' as ResourceCategory,
  version: '1.0',
  tags: '',
  relatedServices: '',
  emailGate: true,
  pdfUrl: '',
  coverImage: '',
}

export default function AdminResourcesPage() {
  const [extras, setExtras] = useState<PremiumResource[]>([])
  const [form, setForm] = useState(emptyForm)
  const [uploading, setUploading] = useState('')

  async function uploadFile(file: File, folder: string) {
    const data = new FormData()
    data.append('file', file)
    data.append('folder', folder)
    const res = await fetch('/api/upload/cloudinary', { method: 'POST', body: data })
    if (!res.ok) {
      return URL.createObjectURL(file)
    }
    const json = await res.json()
    return json.secure_url || json.url || URL.createObjectURL(file)
  }

  useEffect(() => {
    try {
      setExtras(JSON.parse(localStorage.getItem(ADMIN_KEY) || '[]'))
    } catch {
      setExtras([])
    }
  }, [])

  const all = useMemo(() => [...PREMIUM_RESOURCES, ...extras], [extras])

  function persist(next: PremiumResource[]) {
    setExtras(next)
    localStorage.setItem(ADMIN_KEY, JSON.stringify(next))
  }

  function addResource(event: React.FormEvent) {
    event.preventDefault()
    if (!form.title.trim()) return
    const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const resource: PremiumResource = {
      id: `admin-${Date.now()}`,
      title: form.title.trim(),
      slug,
      description: form.description.trim(),
      category: form.category,
      version: form.version.trim() || '1.0',
      tags: form.tags.split(',').map((item) => item.trim()).filter(Boolean),
      coverImage: form.coverImage || null,
      pdfUrl: form.pdfUrl || null,
      previewUrl: form.pdfUrl || null,
      relatedServices: form.relatedServices.split(',').map((item) => item.trim()).filter(Boolean),
      emailGate: form.emailGate,
      downloadCount: 0,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    persist([resource, ...extras])
    setForm(emptyForm)
  }

  function removeResource(id: string) {
    persist(extras.filter((item) => item.id !== id))
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>Resource Library</h1>
      <p style={{ color: '#9d8fd4', margin: '0 0 24px' }}>Upload and manage company profiles, decks, guidelines, and other downloadable assets.</p>

      <form onSubmit={addResource} style={{ background: '#1a1f2e', border: '1px solid rgba(124,58,237,0.12)', borderRadius: 14, padding: 20, marginBottom: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" required style={inputStyle} />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ResourceCategory })} style={inputStyle}>
          {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
        </select>
        <input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} placeholder="Version" style={inputStyle} />
        <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Tags, comma separated" style={inputStyle} />
        <label style={{ ...inputStyle, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span>PDF upload</span>
          <input type="file" accept="application/pdf" onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            setUploading('pdf')
            const url = await uploadFile(file, 'portfolio-resources')
            setForm((prev) => ({ ...prev, pdfUrl: url }))
            setUploading('')
          }} />
          <span style={{ fontSize: 11, color: '#9d8fd4' }}>{uploading === 'pdf' ? 'Uploading…' : form.pdfUrl || 'No PDF yet'}</span>
        </label>
        <label style={{ ...inputStyle, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span>Cover image</span>
          <input type="file" accept="image/*" onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            setUploading('cover')
            const url = await uploadFile(file, 'portfolio-covers')
            setForm((prev) => ({ ...prev, coverImage: url }))
            setUploading('')
          }} />
          <span style={{ fontSize: 11, color: '#9d8fd4' }}>{uploading === 'cover' ? 'Uploading…' : form.coverImage || 'No cover yet'}</span>
        </label>
        <input value={form.relatedServices} onChange={(e) => setForm({ ...form, relatedServices: e.target.value })} placeholder="Related services, comma separated" style={{ ...inputStyle, gridColumn: '1 / -1' }} />
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" style={{ ...inputStyle, gridColumn: '1 / -1', minHeight: 90 }} />
        <label style={{ color: '#d6d3e8', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={form.emailGate} onChange={(e) => setForm({ ...form, emailGate: e.target.checked })} />
          Require email before download
        </label>
        <button type="submit" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 16px', fontWeight: 700, cursor: 'pointer' }}>
          Publish resource
        </button>
      </form>

      <div style={{ display: 'grid', gap: 10 }}>
        {all.map((item) => (
          <div key={item.id} style={{ background: '#1a1f2e', border: '1px solid rgba(124,58,237,0.12)', borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 700 }}>{item.title}</div>
              <div style={{ color: '#9d8fd4', fontSize: 12 }}>{item.category} · v{item.version} · {item.downloadCount} downloads</div>
            </div>
            {item.id.startsWith('admin-') && (
              <button onClick={() => removeResource(item.id)} style={{ background: 'transparent', color: '#fca5a5', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}>
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: '#111827',
  border: '1px solid rgba(124,58,237,0.2)',
  color: '#fff',
  borderRadius: 10,
  padding: '11px 12px',
  fontSize: 13,
}
