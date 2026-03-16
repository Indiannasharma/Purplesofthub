'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type ClientRow = {
  _id: string
  firstName?: string
  lastName?: string
  email: string
  avatar?: string
  country?: string
  isActive?: boolean
  createdAt?: string
  projectsCount?: number
  totalSpent?: number
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const fetchClients = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/clients', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Failed to load clients.')
        setLoading(false)
        return
      }
      setClients(data?.clients || [])
    } catch (err) {
      console.error('Clients fetch error:', err)
      setError('Failed to load clients.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const filtered = useMemo(() => {
    const term = query.toLowerCase().trim()
    if (!term) return clients
    return clients.filter((client) => {
      const name = `${client.firstName || ''} ${client.lastName || ''}`.toLowerCase()
      const email = (client.email || '').toLowerCase()
      return name.includes(term) || email.includes(term)
    })
  }, [clients, query])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#e2d9f3' }}>Clients Manager</h1>
          <p style={{ color: '#9d8fd4', fontSize: 13 }}>
            Search, track, and manage all client accounts.
          </p>
        </div>
      </div>

      <div
        style={{
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(124,58,237,.18)',
          borderRadius: 16,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          style={{
            width: '100%',
            background: 'rgba(255,255,255,.04)',
            border: '1px solid rgba(124,58,237,.2)',
            borderRadius: 12,
            padding: '10px 14px',
            color: '#e2d9f3',
            fontSize: 14,
            outline: 'none',
          }}
        />
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

      <div
        style={{
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(124,58,237,.18)',
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: 32, color: '#9d8fd4', fontSize: 14 }}>Loading clients...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 32, color: '#9d8fd4', fontSize: 14 }}>
            No clients found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr style={{ textAlign: 'left', fontSize: 12, color: '#9d8fd4', background: 'rgba(124,58,237,.08)' }}>
                  <th style={thStyle}>Client</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Country</th>
                  <th style={thStyle}>Projects</th>
                  <th style={thStyle}>Total Spent</th>
                  <th style={thStyle}>Join Date</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client, index) => {
                  const fullName = `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Unnamed Client'
                  const initials = fullName
                    .split(' ')
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()

                  return (
                    <tr
                      key={client._id}
                      style={{
                        borderTop: index === 0 ? 'none' : '1px solid rgba(124,58,237,.08)',
                      }}
                    >
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {client.avatar ? (
                            <img
                              src={client.avatar}
                              alt={fullName}
                              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                background: 'rgba(124,58,237,.2)',
                                color: '#a855f7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: 12,
                              }}
                            >
                              {initials}
                            </div>
                          )}
                          <span style={{ fontWeight: 600 }}>{fullName}</span>
                        </div>
                      </td>
                      <td style={tdStyle}>{client.email}</td>
                      <td style={tdStyle}>{client.country || '—'}</td>
                      <td style={tdStyle}>{client.projectsCount ?? 0}</td>
                      <td style={tdStyle}>
                        ₦{Number(client.totalSpent || 0).toLocaleString()}
                      </td>
                      <td style={tdStyle}>
                        {client.createdAt
                          ? new Date(client.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: 100,
                            background: client.isActive ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.12)',
                            color: client.isActive ? '#4ade80' : '#f87171',
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {client.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <Link
                          href={`/admin/clients/${client._id}`}
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
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                })}
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
