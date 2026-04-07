'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Invoice {
  id: string
  invoice_number: string
  client_name: string | null
  client_email: string | null
  amount: number
  currency: string
  status: string
  due_date: string | null
  created_at: string
  service: string | null
}

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: '⏳ Pending' },
  paid: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: '✅ Paid' },
  overdue: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: '🔴 Overdue' },
  cancelled: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', label: '❌ Cancelled' },
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('invoices').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setInvoices(data || [])
      setLoading(false)
    })
  }, [])

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0)
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0)

  const filtered = invoices.filter(inv => {
    const matchSearch = inv.client_name?.toLowerCase().includes(search.toLowerCase()) || inv.invoice_number?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || inv.status === filter
    return matchSearch && matchFilter
  })

  const formatAmount = (amount: number, currency: string = 'NGN') => currency === 'NGN' ? `₦${amount.toLocaleString()}` : `$${amount.toLocaleString()}`

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>Invoices 💳</h1>
          <p style={{ fontSize: '14px', color: '#9d8fd4', margin: 0 }}>{invoices.length} total invoices</p>
        </div>
        <Link href="/admin/invoices/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff', padding: '11px 24px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 16px rgba(124,58,237,0.3)', whiteSpace: 'nowrap' }}>+ New Invoice</Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Paid', value: `₦${totalPaid.toLocaleString()}`, icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Total Pending', value: `₦${totalPending.toLocaleString()}`, icon: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Total Invoices', value: invoices.length, icon: '📄', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#1a1f2e', border: '1px solid rgba(124,58,237,0.12)', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{stat.icon}</div>
            <div>
              <p style={{ fontSize: '22px', fontWeight: 900, color: stat.color, margin: '0 0 2px', lineHeight: 1 }}>{loading ? '...' : stat.value}</p>
              <p style={{ fontSize: '13px', color: '#9d8fd4', margin: 0 }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1a1f2e', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '10px', padding: '9px 14px', flex: 1, minWidth: '200px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b5fa0" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoices..." style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '13px', width: '100%', fontFamily: 'inherit' }} />
        </div>
        {['all', 'pending', 'paid', 'overdue'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '9px 16px', borderRadius: '10px', border: filter === f ? 'none' : '1px solid rgba(124,58,237,0.2)', background: filter === f ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'transparent', color: filter === f ? '#fff' : '#9d8fd4', fontWeight: 600, fontSize: '12px', cursor: 'pointer', textTransform: 'capitalize' }}>{f}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#1a1f2e', border: '1px solid rgba(124,58,237,0.12)', borderRadius: '20px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 120px 100px 80px', gap: '16px', padding: '14px 24px', borderBottom: '1px solid rgba(124,58,237,0.1)', background: 'rgba(124,58,237,0.04)' }}>
          {['Invoice', 'Client', 'Amount', 'Status', 'Due Date', 'Action'].map(h => (
            <p key={h} style={{ fontSize: '11px', fontWeight: 700, color: '#6b5fa0', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>{h}</p>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9d8fd4' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '40px', margin: '0 0 12px' }}>💳</p>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>No invoices yet</p>
            <p style={{ fontSize: '13px', color: '#9d8fd4', margin: '0 0 20px' }}>Create your first invoice to start billing clients</p>
            <Link href="/admin/invoices/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff', padding: '10px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '13px' }}>+ New Invoice</Link>
          </div>
        ) : (
          filtered.map((inv, i) => {
            const status = statusConfig[inv.status] || statusConfig.pending
            return (
              <div key={inv.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 120px 100px 80px', gap: '16px', padding: '16px 24px', borderBottom: i < filtered.length - 1 ? '1px solid rgba(124,58,237,0.06)' : 'none', alignItems: 'center', transition: 'background 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(124,58,237,0.04)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#a855f7', margin: 0, fontFamily: 'monospace' }}>{inv.invoice_number || `INV-${inv.id.slice(0,6).toUpperCase()}`}</p>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', margin: '0 0 2px' }}>{inv.client_name || '—'}</p>
                  {inv.client_email && <p style={{ fontSize: '11px', color: '#6b5fa0', margin: 0 }}>{inv.client_email}</p>}
                </div>
                <p style={{ fontSize: '14px', fontWeight: 800, color: '#10b981', margin: 0 }}>{formatAmount(inv.amount, inv.currency)}</p>
                <span style={{ fontSize: '11px', fontWeight: 700, color: status.color, background: status.bg, padding: '4px 10px', borderRadius: '100px', display: 'inline-block', whiteSpace: 'nowrap' }}>{status.label}</span>
                <p style={{ fontSize: '12px', color: '#6b5fa0', margin: 0, whiteSpace: 'nowrap' }}>{inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : '—'}</p>
                <Link href={`/admin/invoices/${inv.id}`} style={{ fontSize: '12px', fontWeight: 600, color: '#a855f7', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', padding: '5px 12px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block', whiteSpace: 'nowrap' }}>View →</Link>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}