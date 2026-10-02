'use client'

import { useEffect, useState } from 'react'
import { AdminErrorState } from "@/components/admin/AdminErrorState";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Service {
  id: string
  name: string
  slug: string
  category: string | null
  icon: string | null
  price_ngn: number | null
  price_usd: number | null
  status: string
  short_description: string | null
  created_at: string
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [readError, setReadError] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('services').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (error) setReadError(true)
      setServices(data || [])
      setLoading(false)
    })
  }, [])

  const deleteService = async (id: string) => {
    if (!confirm('Delete this service?')) return
    const supabase = createClient()
    await supabase.from('services').delete().eq('id', id)
    setServices(p => p.filter(s => s.id !== id))
  }

  if (readError) return <AdminPage className="cc-module"><AdminErrorState onRetry={() => window.location.reload()} /></AdminPage>

  return (
    <AdminPage className="cc-module admin-form admin-adopted">
      {/* Header */}
      <AdminPageHeader title={<>Services Catalog</>} description={<>{loading ? 'Loading catalog…' : services.length + ' recorded services'}</>} actions={<Link href="/admin/services/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: "var(--cc-accent)", color: "var(--cc-on-accent)", padding: '11px 24px', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '14px', boxShadow: "none" }}>+ New Service</Link>} />

      {/* Services grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {[1,2,3].map(i => <div key={i} style={{ background: "var(--cc-surface)", borderRadius: 12, height: '160px', animation: 'shimmer 1.5s infinite' }} />)}
        </div>
      ) : services.length === 0 ? (
        <div style={{ background: "var(--cc-surface)", border: "1px solid var(--cc-border)", borderRadius: 12, padding: '60px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '48px', margin: '0 0 16px' }}>⚙️</p>
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: "var(--cc-text)", margin: '0 0 8px' }}>No services yet</h3>
          <p style={{ fontSize: '14px', color: "var(--cc-text-secondary)", margin: '0 0 24px' }}>Add your services to the catalog</p>
          <Link href="/admin/services/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: "var(--cc-accent)", color: "var(--cc-on-accent)", padding: '12px 28px', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '14px', boxShadow: "none" }}>+ Add First Service</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {services.map(service => (
            <div key={service.id} style={{ background: "var(--cc-surface)", border: "1px solid var(--cc-border)", borderRadius: 12, padding: '20px', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(124,58,237,0.35)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(124,58,237,0.12)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(124,58,237,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{service.icon || '⚙️'}</div>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: 600, color: "var(--cc-text)", margin: '0 0 2px' }}>{service.name}</p>
                    {service.category && <span style={{ fontSize: '11px', color: "var(--cc-accent)", background: 'rgba(124,58,237,0.1)', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>{service.category}</span>}
                  </div>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 600, color: service.status === 'active' ? '#10b981' : '#6b7280', background: service.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)', padding: '3px 8px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{service.status || 'active'}</span>
              </div>
              {service.short_description && <p style={{ fontSize: '13px', color: "var(--cc-text-secondary)", margin: '0 0 14px', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{service.short_description}</p>}
              {(service.price_ngn || service.price_usd) && <p style={{ fontSize: '16px', fontWeight: 600, color: "var(--cc-accent)", margin: '0 0 14px' }}>{service.price_ngn ? `₦${service.price_ngn.toLocaleString()}` : ''}{service.price_usd ? ` / $${service.price_usd}` : ''}</p>}
              <div style={{ display: 'flex', gap: '8px' }}>

                <button onClick={() => deleteService(service.id)} style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: "var(--cc-error)", borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes shimmer { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </AdminPage>
  )
}