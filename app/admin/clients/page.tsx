'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Client {
  id: string
  full_name: string
  email: string
  country: string | null
  avatar_url: string | null
  created_at: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setClients(data || [])
        setLoading(false)
      })
  }, [])

  const filtered = clients.filter(c =>
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>Clients 👥</h1>
          <p style={{ fontSize: '14px', color: '#9d8fd4', margin: 0 }}>{clients.length} registered clients</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1a1f2e', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '12px', padding: '10px 16px', minWidth: '260px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b5fa0" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..." style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '13px', width: '100%', fontFamily: 'inherit' }} />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Clients', value: clients.length, icon: '👥', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
          { label: 'This Month', value: clients.filter(c => { const d = new Date(c.created_at); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() }).length, icon: '📅', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Countries', value: new Set(clients.map(c => c.country).filter(Boolean)).size || 0, icon: '🌍', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#1a1f2e', border: '1px solid rgba(124,58,237,0.12)', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{stat.icon}</div>
            <div>
              <p style={{ fontSize: '26px', fontWeight: 900, color: stat.color, margin: '0 0 2px', lineHeight: 1 }}>{loading ? '...' : stat.value}</p>
              <p style={{ fontSize: '13px', color: '#9d8fd4', margin: 0 }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Clients table */}
      <div style={{ background: '#1a1f2e', border: '1px solid rgba(124,58,237,0.12)', borderRadius: '20px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px 80px 120px 100px', gap: '16px', padding: '14px 24px', borderBottom: '1px solid rgba(124,58,237,0.1)', background: 'rgba(124,58,237,0.04)' }}>
          {['Client', 'Country', 'Projects', 'Invoices', 'Joined', 'Actions'].map(h => (
            <p key={h} style={{ fontSize: '11px', fontWeight: 700, color: '#6b5fa0', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>{h}</p>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9d8fd4' }}>Loading clients...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '40px', margin: '0 0 12px' }}>👥</p>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>{search ? 'No clients found' : 'No clients yet'}</p>
            <p style={{ fontSize: '13px', color: '#9d8fd4', margin: 0 }}>{search ? 'Try a different search' : 'Clients will appear here when they sign up'}</p>
          </div>
        ) : (
          filtered.map((client, i) => (
            <div key={client.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px 80px 120px 100px', gap: '16px', padding: '16px 24px', borderBottom: i < filtered.length - 1 ? '1px solid rgba(124,58,237,0.06)' : 'none', transition: 'background 0.15s', alignItems: 'center' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(124,58,237,0.04)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{getInitials(client.full_name || client.email)}</div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.full_name || 'Unknown'}</p>
                  <p style={{ fontSize: '12px', color: '#9d8fd4', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.email}</p>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: '#9d8fd4', margin: 0 }}>{client.country || '—'}</p>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#3b82f6', background: 'rgba(59,130,246,0.1)', padding: '3px 10px', borderRadius: '100px', display: 'inline-block', textAlign: 'center' }}>0</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '3px 10px', borderRadius: '100px', display: 'inline-block', textAlign: 'center' }}>0</span>
              <p style={{ fontSize: '12px', color: '#6b5fa0', margin: 0 }}>{new Date(client.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              <Link href={`/admin/clients/${client.id}`} style={{ fontSize: '12px', fontWeight: 600, color: '#a855f7', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', padding: '6px 14px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block', whiteSpace: 'nowrap' }}>View →</Link>
            </div>
          ))
        )}
      </div>
    </div>
  )
}