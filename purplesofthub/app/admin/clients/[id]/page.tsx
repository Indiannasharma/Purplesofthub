'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
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

interface Transaction {
  id: string
  amount: number
  status: string
  created_at: string
  service_name: string
}

interface Project {
  id: string
  title: string
  status: string
  created_at: string
}

interface Props {
  params: Promise<{ id: string }>
}

export default function ClientDetailPage({ params }: Props) {
  const { id: clientId } = use(params)
  const router = useRouter()

  const [client, setClient] = useState<Client | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!clientId) return
    fetchClientDetails()
  }, [clientId])

  const fetchClientDetails = async () => {
    try {
      const supabase = createClient()

      // Fetch client profile
      const { data: clientData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', clientId)
        .single()

      if (clientData) {
        setClient(clientData)
      }

      // Fetch transactions
      const { data: transData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', clientId)
        .order('created_at', { ascending: false })

      setTransactions(transData || [])

      // Fetch projects (if projects table exists)
      try {
        const { data: projData } = await supabase
          .from('projects')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false })

        setProjects(projData || [])
      } catch {
        // Projects table might not exist, continue
      }
    } catch (err) {
      console.error('Failed to fetch client details:', err)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'active':
        return { bg: 'rgba(16,185,129,0.15)', color: '#10b981', icon: '✓' }
      case 'pending':
        return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', icon: '⏳' }
      case 'failed':
      case 'rejected':
        return { bg: 'rgba(239,68,68,0.15)', color: '#f87171', icon: '✕' }
      default:
        return { bg: 'rgba(107,95,160,0.15)', color: '#9d8fd4', icon: '○' }
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--cmd-muted)' }}>
        Loading client details...
      </div>
    )
  }

  if (!client) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ fontSize: '32px', margin: '0 0 12px' }}>🚫</p>
        <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--cmd-heading)', margin: '0 0 4px' }}>
          Client not found
        </p>
        <p style={{ fontSize: '14px', color: 'var(--cmd-muted)', margin: '0 0 20px' }}>
          The client you're looking for doesn't exist
        </p>
        <Link href="/admin/clients" style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#fff',
          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          padding: '10px 20px',
          borderRadius: '8px',
          textDecoration: 'none',
          display: 'inline-block',
        }}>
          ← Back to Clients
        </Link>
      </div>
    )
  }

  const totalRevenue = transactions
    .filter(t => t.status?.toLowerCase() === 'completed')
    .reduce((sum, t) => sum + (t.amount || 0), 0)

  return (
    <div style={{ background: 'var(--cmd-bg)', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* ── HEADER & BACK ── */}
        <div style={{ marginBottom: '32px' }}>
          <Link href="/admin/clients" style={{
            fontSize: '14px',
            color: '#a855f7',
            textDecoration: 'none',
            marginBottom: '16px',
            display: 'inline-block',
            fontWeight: 600,
          }}>
            ← Back to Clients
          </Link>
        </div>

        {/* ── CLIENT CARD ── */}
        <div style={{
          background: 'var(--cmd-card)',
          border: '1px solid rgba(124,58,237,0.15)',
          borderRadius: '14px',
          padding: '28px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '24px',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 800,
            color: '#fff',
            flexShrink: 0,
          }}>
            {getInitials(client.full_name || client.email)}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 900,
              color: 'var(--cmd-heading)',
              margin: '0 0 8px',
            }}>
              {client.full_name || 'Unknown Client'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <p style={{ fontSize: '14px', color: 'var(--cmd-muted)', margin: 0 }}>
                📧 {client.email}
              </p>
              {client.country && (
                <p style={{ fontSize: '14px', color: 'var(--cmd-muted)', margin: 0 }}>
                  🌍 {client.country}
                </p>
              )}
              <p style={{ fontSize: '14px', color: 'var(--cmd-muted)', margin: 0 }}>
                📅 Joined {formatDate(client.created_at)}
              </p>
            </div>
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
            { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: '💰', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
            { label: 'Transactions', value: transactions.length, icon: '💳', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
            { label: 'Completed', value: transactions.filter(t => t.status?.toLowerCase() === 'completed').length, icon: '✓', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
            { label: 'Pending', value: transactions.filter(t => t.status?.toLowerCase() === 'pending').length, icon: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
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
                <p style={{ fontSize: '20px', fontWeight: 900, color: stat.color, margin: '4px 0 0' }}>
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── TRANSACTIONS ── */}
        <div style={{
          background: 'var(--cmd-card)',
          border: '1px solid rgba(124,58,237,0.15)',
          borderRadius: '14px',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(124,58,237,0.15)',
            background: 'rgba(124,58,237,0.06)',
          }}>
            <h2 style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--cmd-heading)',
              margin: 0,
            }}>
              📝 Transaction History
            </h2>
          </div>

          {transactions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--cmd-muted)',
            }}>
              <p style={{ fontSize: '32px', margin: '0 0 12px' }}>💳</p>
              <p style={{ fontSize: '14px', margin: 0 }}>No transactions yet</p>
            </div>
          ) : (
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
                    }}>Service</th>
                    <th style={{
                      padding: '14px 16px',
                      textAlign: 'left',
                      fontWeight: 700,
                      color: 'var(--cmd-body)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontSize: '11px',
                    }}>Amount</th>
                    <th style={{
                      padding: '14px 16px',
                      textAlign: 'left',
                      fontWeight: 700,
                      color: 'var(--cmd-body)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontSize: '11px',
                    }}>Status</th>
                    <th style={{
                      padding: '14px 16px',
                      textAlign: 'left',
                      fontWeight: 700,
                      color: 'var(--cmd-body)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontSize: '11px',
                    }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((trans, idx) => {
                    const statusColor = getStatusColor(trans.status)
                    return (
                      <tr
                        key={trans.id}
                        style={{
                          borderBottom: idx < transactions.length - 1 ? '1px solid rgba(124,58,237,0.08)' : 'none',
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
                          {trans.service_name || 'Service'}
                        </td>
                        <td style={{
                          padding: '14px 16px',
                          color: 'var(--cmd-body)',
                          fontSize: '14px',
                          fontWeight: 600,
                        }}>
                          {formatCurrency(trans.amount)}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            background: statusColor.bg,
                            color: statusColor.color,
                            fontWeight: 600,
                            fontSize: '11px',
                          }}>
                            {statusColor.icon} {trans.status || 'Unknown'}
                          </span>
                        </td>
                        <td style={{
                          padding: '14px 16px',
                          color: 'var(--cmd-muted)',
                          fontSize: '13px',
                        }}>
                          {formatDate(trans.created_at)}
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
    </div>
  )
}
