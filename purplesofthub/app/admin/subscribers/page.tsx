'use client'

import { useEffect, useState, useMemo } from 'react'
import { AdminErrorState } from "@/components/admin/AdminErrorState";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { createClient } from '@/lib/supabase/client'

interface Subscriber {
  id: string
  email: string
  status: 'active' | 'unsubscribed'
  created_at: string
  subscribed_at?: string
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [readError, setReadError] = useState(false);
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unsubscribed'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'email'>('newest')

  // Stats
  const stats = useMemo(() => {
    const active = subscribers.filter(s => s.status !== 'unsubscribed').length
    const thisMonth = subscribers.filter(s => {
      const d = new Date(s.created_at || s.subscribed_at || '')
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length

    return {
      total: subscribers.length,
      active,
      thisMonth,
    }
  }, [subscribers])

  // Filtered & sorted subscribers
  const filtered = useMemo(() => {
    const result = subscribers.filter(s => {
      const matchesSearch = s.email.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter
      return matchesSearch && matchesStatus
    })

    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'email':
          return a.email.localeCompare(b.email)
      }
    })

    return result
  }, [subscribers, search, statusFilter, sortBy])



  async function fetchSubscribers() {
    try {
      setReadError(false);

    try {
      const supabase = createClient()
      const { data , error: readFailure1} = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false })
      if (readFailure1) throw readFailure1;

      setSubscribers(data || [])
    } catch (err) {
      console.error('Failed to fetch subscribers:', err)
      setReadError(true)
    } finally {
      setLoading(false)
    }

    } catch { setReadError(true); } finally { setLoading(false); }
  }

  const exportCSV = () => {
    const csv = [
      'Email,Subscribed Date,Status',
      ...filtered.map(s => {
        const date = new Date(s.created_at || s.subscribed_at || '').toLocaleDateString('en-US')
        return `"${s.email}","${date}","${s.status}"`
      })
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`)
    link.click()
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  useEffect(() => {
    // Resolve external reads in a callback after the committed render.
    void Promise.resolve().then(async () => {
    fetchSubscribers()
      })
  }, [])

  if (readError) return <AdminPage className="cc-module"><AdminErrorState title="Could not load these records" description="Refresh to try again. No record counts are shown while the read has failed." onRetry={() => window.location.reload()} /></AdminPage>;

  return (
    <AdminPage className="cc-module admin-form admin-adopted">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* ── HEADER ── */}
        <AdminPageHeader title={<>Newsletter Subscribers</>} description={<>Manage and track your newsletter subscribers</>} actions={<button
            onClick={exportCSV}
            disabled={filtered.length === 0}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: filtered.length === 0 ? 'rgba(124,58,237,0.2)' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
              color: "var(--cc-on-accent)",
              fontWeight: 600,
              fontSize: '14px',
              cursor: filtered.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              if (filtered.length > 0) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(124,58,237,0.3)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            📥 Export CSV
          </button>} />

        {/* ── STATS ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}>
          {[
            { label: 'Total Subscribers', value: stats.total, icon: '📨', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
            { label: 'Active', value: stats.active, icon: '✓', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
            { label: 'This Month', value: stats.thisMonth, icon: '📈', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: "var(--cc-surface)",
              border: `1px solid ${stat.bg}`,
              borderRadius: 12,
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: stat.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}>
                {stat.icon}
              </div>
              <div>
                <p style={{ fontSize: '12px', color: "var(--cc-text-muted)", margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {stat.label}
                </p>
                <p style={{ fontSize: '28px', fontWeight: 600, color: stat.color, margin: '4px 0 0' }}>
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── CONTROLS ── */}
        <div style={{
          background: "var(--cc-surface)",
          border: "1px solid var(--cc-border)",
          borderRadius: 12,
          padding: '20px',
          marginBottom: '28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
        }}>
          {/* Search */}
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(124,58,237,0.06)',
              border: "1px solid var(--cc-border)",
              borderRadius: '10px',
              padding: '10px 14px',
            }}>
              <span style={{ color: "var(--cc-text-muted)" }}>🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search subscribers by email..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: "var(--cc-text)",
                  fontSize: '14px',
                  fontFamily: 'inherit',
                }}
               aria-label="Search subscribers by email..."/>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label style={{
              fontSize: '11px',
              fontWeight: 600,
              color: "var(--cc-text-muted)",
              display: 'block',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }} htmlFor="admin-subscriberspagetsx-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: "1px solid var(--cc-border)",
                background: 'rgba(124,58,237,0.06)',
                color: "var(--cc-text)",
                fontSize: '12px',
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
              id="admin-subscriberspagetsx-1">
              <option value="all">All Status</option>
              <option value="active">✓ Active</option>
              <option value="unsubscribed">✕ Unsubscribed</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label style={{
              fontSize: '11px',
              fontWeight: 600,
              color: "var(--cc-text-muted)",
              display: 'block',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }} htmlFor="admin-subscriberspagetsx-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: "1px solid var(--cc-border)",
                background: 'rgba(124,58,237,0.06)',
                color: "var(--cc-text)",
                fontSize: '12px',
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
              id="admin-subscriberspagetsx-2">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="email">Email (A-Z)</option>
            </select>
          </div>
        </div>

        {/* ── SUBSCRIBERS TABLE ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: "var(--cc-text-muted)" }}>
            Loading subscribers...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: "var(--cc-surface)",
            borderRadius: 12,
            border: "1px solid var(--cc-border)",
          }}>
            <p style={{ fontSize: '32px', margin: '0 0 12px' }}>📭</p>
            <p style={{ fontSize: '16px', fontWeight: 600, color: "var(--cc-text)", margin: '0 0 4px' }}>
              No subscribers found
            </p>
            <p style={{ fontSize: '14px', color: "var(--cc-text-muted)", margin: 0 }}>
              {search ? 'Try a different search' : 'No newsletter subscribers yet'}
            </p>
          </div>
        ) : (
          <div style={{
            background: "var(--cc-surface)",
            border: "1px solid var(--cc-border)",
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }} className="admin-responsive-table">
                <thead style={{
                  background: 'rgba(124,58,237,0.06)',
                  borderBottom: '1px solid rgba(124,58,237,0.15)',
                }}>
                  <tr>
                    <th style={{
                      padding: '14px 16px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: "var(--cc-text-secondary)",
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontSize: '11px',
                    }}>Email</th>
                    <th style={{
                      padding: '14px 16px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: "var(--cc-text-secondary)",
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontSize: '11px',
                    }}>Subscribed Date</th>
                    <th style={{
                      padding: '14px 16px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: "var(--cc-text-secondary)",
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontSize: '11px',
                    }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sub, idx) => (
                    <tr
                      key={sub.id}
                      style={{
                        borderBottom: idx < filtered.length - 1 ? '1px solid rgba(124,58,237,0.08)' : 'none',
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(124,58,237,0.02)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(124,58,237,0.02)'}
                    >
                      <td style={{
                        padding: '14px 16px',
                        color: "var(--cc-text-secondary)",
                        fontSize: '14px',
                        wordBreak: 'break-all',
                      }} data-label="Email">
                        {sub.email}
                      </td>
                      <td style={{
                        padding: '14px 16px',
                        color: "var(--cc-text-muted)",
                        fontSize: '13px',
                      }} data-label="Subscribed Date">
                        {formatDate(sub.created_at || sub.subscribed_at)}
                      </td>
                      <td style={{ padding: '14px 16px' }} data-label="Status">
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          background: sub.status === 'unsubscribed'
                            ? 'rgba(239,68,68,0.15)'
                            : 'rgba(16,185,129,0.15)',
                          color: sub.status === 'unsubscribed' ? '#f87171' : '#10b981',
                          fontWeight: 600,
                          fontSize: '11px',
                        }}>
                          {sub.status === 'unsubscribed' ? '✕ Unsubscribed' : '✓ Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        {filtered.length > 0 && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: 'rgba(124,58,237,0.06)',
            border: "1px solid var(--cc-border)",
            borderRadius: '10px',
            fontSize: '12px',
            color: "var(--cc-text-secondary)",
            textAlign: 'center',
          }}>
            Showing <strong>{filtered.length}</strong> subscriber{filtered.length !== 1 ? 's' : ''} {search ? `matching "${search}"` : ''}
          </div>
        )}
      </div>
    </AdminPage>
  )
}
