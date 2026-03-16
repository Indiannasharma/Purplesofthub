'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

type ServiceRow = {
  _id: string
  name: string
  slug: string
  category?: string
  icon?: string
  priceNGN?: number
  priceUSD?: number
  isActive?: boolean
  order?: number
}

const CATEGORY_LABELS: Record<string, string> = {
  'web-development': 'Web Development',
  'mobile-apps': 'Mobile Apps',
  'digital-marketing': 'Digital Marketing',
  'ui-ux-design': 'UI/UX Design',
  'saas-development': 'SaaS Development',
  'music-promotion': 'Music Promotion',
  'content-creation': 'Content Creation',
  seo: 'SEO',
  'social-media': 'Social Media',
}

export default function AdminServicesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [services, setServices] = useState<ServiceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const successMessage = useMemo(() => {
    if (searchParams.get('created')) return 'Service created successfully.'
    if (searchParams.get('updated')) return 'Service updated successfully.'
    if (searchParams.get('deleted')) return 'Service deleted successfully.'
    return null
  }, [searchParams])

  useEffect(() => {
    if (!successMessage) return
    setToast(successMessage)
    const timer = setTimeout(() => {
      setToast(null)
      router.replace('/admin/services')
    }, 2500)
    return () => clearTimeout(timer)
  }, [successMessage, router])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/services', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Failed to load services.')
        setLoading(false)
        return
      }
      setServices(data?.services || [])
    } catch (err) {
      console.error('Services fetch error:', err)
      setError('Failed to load services.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const toggleStatus = async (serviceId: string, nextValue: boolean) => {
    setServices((prev) => prev.map((svc) => (svc._id === serviceId ? { ...svc, isActive: nextValue } : svc)))
    try {
      const res = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextValue }),
      })
      if (!res.ok) {
        await fetchServices()
      }
    } catch (err) {
      console.error('Toggle status error:', err)
      await fetchServices()
    }
  }

  const deleteService = async (serviceId: string) => {
    const confirmed = window.confirm('Delete this service? This action cannot be undone.')
    if (!confirmed) return

    try {
      const res = await fetch(`/api/admin/services/${serviceId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setError(data?.error || 'Failed to delete service.')
        return
      }
      setServices((prev) => prev.filter((svc) => svc._id !== serviceId))
      router.replace('/admin/services?deleted=1')
    } catch (err) {
      console.error('Delete service error:', err)
      setError('Failed to delete service.')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#e2d9f3' }}>Services Manager</h1>
          <p style={{ color: '#9d8fd4', fontSize: 13 }}>
            Manage every service offering, pricing, and visibility.
          </p>
        </div>
        <Link
          href="/admin/services/new"
          style={{
            padding: '10px 20px',
            borderRadius: 50,
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: '#fff',
            fontWeight: 700,
            textDecoration: 'none',
            fontSize: 14,
          }}
        >
          + New Service
        </Link>
      </div>

      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 90,
            right: 28,
            background: 'rgba(34,197,94,.18)',
            border: '1px solid rgba(34,197,94,.4)',
            color: '#4ade80',
            padding: '10px 16px',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            zIndex: 50,
          }}
        >
          {toast}
        </div>
      )}

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

      <div
        style={{
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(124,58,237,.18)',
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: 32, color: '#9d8fd4', fontSize: 14 }}>Loading services...</div>
        ) : services.length === 0 ? (
          <div style={{ padding: 32, color: '#9d8fd4', fontSize: 14 }}>
            No services found. Create your first service.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr style={{ textAlign: 'left', fontSize: 12, color: '#9d8fd4', background: 'rgba(124,58,237,.08)' }}>
                  <th style={thStyle}>Service</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Price (NGN)</th>
                  <th style={thStyle}>Price (USD)</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Order</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((svc, index) => (
                  <tr
                    key={svc._id}
                    style={{
                      borderTop: index === 0 ? 'none' : '1px solid rgba(124,58,237,.08)',
                    }}
                  >
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 10,
                            background: 'rgba(124,58,237,.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16,
                          }}
                        >
                          {svc.icon || '✨'}
                        </span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#e2d9f3' }}>{svc.name}</div>
                          <div style={{ fontSize: 12, color: '#9d8fd4' }}>{svc.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 100,
                          background: 'rgba(124,58,237,.15)',
                          color: '#a855f7',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {CATEGORY_LABELS[svc.category || ''] || 'Uncategorized'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 600 }}>{svc.priceNGN ? `₦${svc.priceNGN.toLocaleString()}` : '—'}</span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 600 }}>{svc.priceUSD ? `$${svc.priceUSD.toLocaleString()}` : '—'}</span>
                    </td>
                    <td style={tdStyle}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <input
                          type="checkbox"
                          checked={Boolean(svc.isActive)}
                          onChange={(e) => toggleStatus(svc._id, e.target.checked)}
                        />
                        <span style={{ fontSize: 12, color: svc.isActive ? '#4ade80' : '#f87171' }}>
                          {svc.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </label>
                    </td>
                    <td style={tdStyle}>{svc.order ?? 0}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link
                          href={`/admin/services/${svc._id}/edit`}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 8,
                            background: 'rgba(124,58,237,.2)',
                            color: '#a855f7',
                            textDecoration: 'none',
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteService(svc._id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 8,
                            background: 'rgba(239,68,68,.15)',
                            color: '#f87171',
                            border: '1px solid rgba(239,68,68,.2)',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '14px 18px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
}

const tdStyle: React.CSSProperties = {
  padding: '16px 18px',
  color: '#e2d9f3',
  fontSize: 13,
  verticalAlign: 'middle',
}
