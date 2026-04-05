'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  service: string | null
  message: string | null
  created_at: string
  status: string | null
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('contacts').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (!error && data) {
        setLeads(data)
      } else {
        supabase.from('chat_leads').select('*').order('created_at', { ascending: false }).then(({ data: d2 }) => {
          setLeads(d2 || [])
        })
      }
      setLoading(false)
    })
  }, [])

  const filtered = leads.filter(l => l.name?.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase()) || l.service?.toLowerCase().includes(search.toLowerCase()))

  const newToday = leads.filter(l => { const d = new Date(l.created_at); const today = new Date(); return d.toDateString() === today.toDateString() }).length

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>Contact Leads 📩</h1>
          <p style={{ fontSize: '14px', color: '#9d8fd4', margin: 0 }}>
            {newToday > 0 && <span style={{ color: '#10b981', fontWeight: 700 }}>{newToday} new today · </span>}
            {leads.length} total
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Leads', value: leads.length, icon: '📩', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
          { label: 'New Today', value: newToday, icon: '🔥', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'This Week', value: leads.filter(l => { const d = new Date(l.created_at); const week = new Date(); week.setDate(week.getDate() - 7); return d > week }).length, icon: '📅', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#1a1f2e', border: '1px solid rgba(124,58,237,0.12)', borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{stat.icon}</div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 900, color: stat.color, margin: '0 0 2px', lineHeight: 1 }}>{loading ? '...' : stat.value}</p>
              <p style={{ fontSize: '12px', color: '#9d8fd4', margin: 0 }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1a1f2e', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '10px', padding: '10px 16px', marginBottom: '20px' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b5fa0" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or service..." style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '13px', width: '100%', fontFamily: 'inherit' }} />
      </div>

      {/* Leads list */}
      {loading ? (
        <div style={{ background: '#1a1f2e', borderRadius: '20px', padding: '40px', textAlign: 'center', color: '#9d8fd4' }}>Loading leads...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: '#1a1f2e', border: '1px solid rgba(124,58,237,0.12)', borderRadius: '20px', padding: '60px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '40px', margin: '0 0 12px' }}>📭</p>
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>{search ? 'No leads found' : 'No contact leads yet'}</p>
          <p style={{ fontSize: '13px', color: '#9d8fd4', margin: 0 }}>{search ? 'Try a different search' : 'Leads from your contact form and Puri chatbot will appear here'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {filtered.map(lead => (
            <div key={lead.id} style={{ background: '#1a1f2e', border: '1px solid rgba(124,58,237,0.12)', borderRadius: '14px', overflow: 'hidden', transition: 'all 0.2s' }}>
              <div onClick={() => setExpanded(expanded === lead.id ? null : lead.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                    {lead.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>{lead.name}</p>
                    <p style={{ fontSize: '12px', color: '#9d8fd4', margin: 0 }}>{lead.email}{lead.phone && ` · ${lead.phone}`}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {lead.service && <span style={{ fontSize: '11px', fontWeight: 600, color: '#a855f7', background: 'rgba(124,58,237,0.1)', padding: '3px 10px', borderRadius: '100px' }}>{lead.service}</span>}
                  <span style={{ fontSize: '11px', color: '#4b5563' }}>{new Date(lead.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span style={{ color: '#6b5fa0', fontSize: '18px', transform: expanded === lead.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>⌄</span>
                </div>
              </div>
              {expanded === lead.id && lead.message && (
                <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(124,58,237,0.1)', background: 'rgba(124,58,237,0.03)' }}>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#6b5fa0', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>Message</p>
                  <p style={{ fontSize: '14px', color: '#9d8fd4', lineHeight: 1.6, margin: '0 0 16px' }}>{lead.message}</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <a href={`mailto:${lead.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>📧 Reply via Email</a>
                    {lead.phone && (
                      <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)', color: '#25D366', textDecoration: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>💬 WhatsApp</a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}