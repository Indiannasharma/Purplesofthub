'use client'

import { useEffect, useState, useMemo } from 'react'
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
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest')

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      setClients(data || [])
    } catch (err) {
      console.error('Failed to fetch clients:', err)
    } finally {
      setLoading(false)
    }
  }

  // Stats
  const stats = useMemo(() => {
    const thisMonth = clients.filter(c => {
      const d = new Date(c.created_at)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length

    const countries = new Set(clients.map(c => c.country).filter(Boolean)).size || 0

    return {
      total: clients.length,
      thisMonth,
      countries,
    }
  }, [clients])

  // Filtered & sorted clients
  const filtered = useMemo(() => {
    let result = clients.filter(c =>
      c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    )

    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'name':
          return (a.full_name || '').localeCompare(b.full_name || '')
      }
    })

    return result
  }, [clients, search, sortBy])

  const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div style={{ background: 'var(--cmd-bg)', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* ── HEADER ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <h1 style={{
              fontSize: 'clamp(24px, 5vw, 32px)',
              fontWeight: 900,
              color: 'var(--cmd-heading)',
              margin: '0 0 6px',
            }}>
              👥 Clients
            </h1>
            <p style={{
              fontSize: '14px',
              color: 'var(--cmd-body)',
              margin: 0,
            }}>
              Manage and view your registered clients
            </p>
          </div>
        </div>

        {/* ── STATS ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}>
          {[
            { label: 'Total Clients', value: stats.total, icon: '👥', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
            { label: 'This Month', value: stats.thisMonth, icon: '📅', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
            { label: 'Countries', value: stats.countries, icon: '🌍', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'var(--cmd-card)',
              border: `1px solid ${stat.bg}`,
              borderRadius: '14px',
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
                <p style={{ fontSize: '12px', color: 'var(--cmd-muted)', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {stat.label}
                </p>
                <p style={{ fontSize: '28px', fontWeight: 900, color: stat.color, margin: '4px 0 0' }}>
                  {loading ? '...' : stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── CONTROLS ── */}
        <div style={{
          background: 'var(--cmd-card)',
          border: '1px solid rgba(124,58,237,0.15)',
          borderRadius: '14px',
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
              border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: '10px',
              padding: '10px 14px',
            }}>
              <span style={{ color: '#6b5fa0' }}>🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--cmd-heading)',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <label style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--cmd-muted)',
              display: 'block',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(124,58,237,0.2)',
                background: 'rgba(124,58,237,0.06)',
                color: 'var(--cmd-heading)',
                fontSize: '12px',
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* ── CLIENTS TABLE ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--cmd-muted)' }}>
            Loading clients...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'var(--cmd-card)',
            borderRadius: '14px',
            border: '1px solid rgba(124,58,237,0.15)',
          }}>
            <p style={{ fontSize: '32px', margin: '0 0 12px' }}>👥</p>
            <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--cmd-heading)', margin: '0 0 4px' }}>
              No clients found
            </p>
            <p style={{ fontSize: '14px', color: 'var(--cmd-muted)', margin: 0 }}>
              {search ? 'Try a different search' : 'No clients yet'}
            </p>
          </div>
        ) : (
          <div style={{
            background: 'var(--cmd-card)',
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: '14px',
            overflow: 'hidden',
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{
                  background: 'rgba(124,58,237,0.06)',
                  borderBottom: '1px solid rgba(124,58,237,0.15)',
                }}>
                  <tr>
                    <th style={{
                      padding: '14px 16px',
                      textAlign: 'left',
                      fontWeight: 700,
                      color: 'var(--cmd-body)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontSize: '11px',
                    }}>Client</th>
                    <th style={{
                      padding: '14px 16px',
                      textAlign: 'left',
                      fontWeight: 700,
                      color: 'var(--cmd-body)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontSize: '11px',
                    }}>Email</th>
                    <th style={{
                      padding: '14px 16px',
                      textAlign: 'left',
                      fontWeight: 700,
                      color: 'var(--cmd-body)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontSize: '11px',
                    }}>Country</th>
                    <th style={{
                      padding: '14px 16px',
                      textAlign: 'left',
                      fontWeight: 700,
                      color: 'var(--cmd-body)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontSize: '11px',
                    }}>Joined</th>
                    <th style={{
                      padding: '14px 16px',
                      textAlign: 'left',
                      fontWeight: 700,
                      color: 'var(--cmd-body)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontSize: '11px',
                    }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((client, idx) => (
                    <tr
                      key={client.id}
                      style={{
                        borderBottom: idx < filtered.length - 1 ? '1px solid rgba(124,58,237,0.08)' : 'none',
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(124,58,237,0.02)',
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(124,58,237,0.06)'}
                      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = idx % 2 === 0 ? 'transparent' : 'rgba(124,58,237,0.02)'}
                    >
                      <td style={{
                        padding: '14px 16px',
                        color: 'var(--cmd-body)',
                        fontSize: '14px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 800,
                            color: '#fff',
                            flexShrink: 0,
                          }}>
                            {getInitials(client.full_name || client.email)}
                          </div>
                          <span>{client.full_name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td style={{
                        padding: '14px 16px',
                        color: 'var(--cmd-muted)',
                        fontSize: '13px',
                      }}>
                        {client.email}
                      </td>
                      <td style={{
                        padding: '14px 16px',
                        color: 'var(--cmd-muted)',
                        fontSize: '13px',
                      }}>
                        {client.country || '—'}
                      </td>
                      <td style={{
                        padding: '14px 16px',
                        color: 'var(--cmd-muted)',
                        fontSize: '13px',
                      }}>
                        {formatDate(client.created_at)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <Link href={`/admin/clients/${client.id}`} style={{
                          display: 'inline-block',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          background: 'rgba(124,58,237,0.15)',
                          color: '#a855f7',
                          fontWeight: 600,
                          fontSize: '11px',
                          textDecoration: 'none',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s',
                          border: '1px solid rgba(124,58,237,0.3)',
                          cursor: 'pointer',
                        }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(124,58,237,0.25)'
                            e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(124,58,237,0.15)'
                            e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'
                          }}
                        >
                          View →
                        </Link>
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
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: '10px',
            fontSize: '12px',
            color: 'var(--cmd-body)',
            textAlign: 'center',
          }}>
            Showing <strong>{filtered.length}</strong> client{filtered.length !== 1 ? 's' : ''} {search ? `matching "${search}"` : ''}
          </div>
        )}
      </div>
    </div>
  )
}