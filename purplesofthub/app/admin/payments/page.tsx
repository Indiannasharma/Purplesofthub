'use client'

import { useEffect, useState, useMemo } from 'react'
import { AdminErrorState } from "@/components/admin/AdminErrorState";
import { invoiceAmount } from "@/lib/customer-overview";
import { AdminPage } from "@/components/admin/AdminPage";
import { createClient } from '@/lib/supabase/client'

interface Transaction {
  id: string
  user_id: string
  user_email: string
  amount: number
  currency: string
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  payment_method: string
  service_name: string
  service_type: string
  transaction_id: string
  created_at: string
  updated_at: string
}

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [readError, setReadError] = useState(false);
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed' | 'refunded'>('all')
  const [methodFilter, setMethodFilter] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low'>('newest')

  // Stats
  const stats = useMemo(() => {
    const completed = transactions.filter(t => t.status === 'completed')
    const pending = transactions.filter(t => t.status === 'pending')
    const failed = transactions.filter(t => t.status === 'failed')

    return {
      totalRevenue: completed.reduce((sum, t) => sum + t.amount, 0),
      completedCount: completed.length,
      pendingCount: pending.length,
      failedCount: failed.length,
      totalTransactions: transactions.length,
    }
  }, [transactions])

  // Payment methods
  const paymentMethods = useMemo(() => {
    const methods = new Set(transactions.map(t => t.payment_method))
    return Array.from(methods).sort()
  }, [transactions])

  // Filtered & sorted transactions
  const filtered = useMemo(() => {
    const result = transactions.filter(t => {
      const matchesSearch = t.user_email.toLowerCase().includes(search.toLowerCase()) ||
                          t.service_name.toLowerCase().includes(search.toLowerCase()) ||
                          t.transaction_id.includes(search)
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter
      const matchesMethod = !methodFilter || t.payment_method === methodFilter

      const transactionDate = new Date(t.created_at)
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

      let matchesDate = true
      if (dateRange === 'today') {
        matchesDate = transactionDate.getTime() >= today.getTime()
      } else if (dateRange === 'week') {
        matchesDate = transactionDate.getTime() >= weekAgo.getTime()
      } else if (dateRange === 'month') {
        matchesDate = transactionDate.getTime() >= monthAgo.getTime()
      }

      return matchesSearch && matchesStatus && matchesMethod && matchesDate
    })

    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'amount_high':
          return b.amount - a.amount
        case 'amount_low':
          return a.amount - b.amount
      }
    })

    return result
  }, [transactions, search, statusFilter, methodFilter, dateRange, sortBy])



  async function fetchTransactions() {
    try {
      setReadError(false);

    const supabase = createClient()
    const { data , error: readFailure1} = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
      if (readFailure1) throw readFailure1;

    setTransactions(data || [])
    setLoading(false)

    } catch { setReadError(true); } finally { setLoading(false); }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: 'rgba(16,185,129,0.1)', color: "var(--cc-success)", text: '✓ Completed' }
      case 'pending':
        return { bg: 'rgba(245,158,11,0.1)', color: "var(--cc-warning)", text: '⏳ Pending' }
      case 'failed':
        return { bg: 'rgba(239,68,68,0.1)', color: "var(--cc-error)", text: '✕ Failed' }
      case 'refunded':
        return { bg: 'rgba(59,130,246,0.1)', color: "var(--cc-info)", text: '↩️ Refunded' }
      default:
        return { bg: 'rgba(107,95,160,0.1)', color: '#9d8fd4', text: status }
    }
  }

  const formatCurrency = (amount: number, currency: string) => invoiceAmount(amount, currency)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  useEffect(() => {
    // Resolve external reads in a callback after the committed render.
    void Promise.resolve().then(async () => {
    fetchTransactions()
      })
  }, [])

  if (readError) return <AdminPage className="cc-module"><AdminErrorState title="Could not load these records" description="Refresh to try again. No record counts are shown while the read has failed." onRetry={() => window.location.reload()} /></AdminPage>;

  return (
    <AdminPage className="cc-module admin-form admin-adopted">
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: 'clamp(24px, 5vw, 32px)',
            fontWeight: 600,
            color: "var(--cc-text)",
            margin: '0 0 6px',
          }}>
            💳 Payments & Transactions
          </h1>
          <p style={{
            fontSize: '14px',
            color: "var(--cc-text-secondary)",
            margin: 0,
          }}>
            Track and manage all payment transactions
          </p>
        </div>

        {/* ── STATS ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
          {[
            { label: 'Recorded transactions', value: stats.totalTransactions, icon: '💰', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
            { label: 'Completed', value: stats.completedCount, icon: '✓', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
            { label: 'Pending', value: stats.pendingCount, icon: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
            { label: 'Failed', value: stats.failedCount, icon: '✕', color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
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
                <p style={{ fontSize: '22px', fontWeight: 600, color: stat.color, margin: '4px 0 0' }}>
                  {loading ? 'Loading…' : stat.value}
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
        }}>
          {/* Search */}
          <div style={{ marginBottom: '16px' }}>
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
                placeholder="Search by email, service, or transaction ID..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: "var(--cc-text)",
                  fontSize: '14px',
                  fontFamily: 'inherit',
                }}
               aria-label="Search by email, service, or transaction ID..."/>
            </div>
          </div>

          {/* Filters */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
          }}>
            {/* Status */}
            <div>
              <label style={{
                fontSize: '11px',
                fontWeight: 600,
                color: "var(--cc-text-muted)",
                display: 'block',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }} htmlFor="admin-paymentspagetsx-1">
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
                id="admin-paymentspagetsx-1">
                <option value="all">All Status</option>
                <option value="completed">✓ Completed</option>
                <option value="pending">⏳ Pending</option>
                <option value="failed">✕ Failed</option>
                <option value="refunded">↩️ Refunded</option>
              </select>
            </div>

            {/* Payment Method */}
            {paymentMethods.length > 0 && (
              <div>
                <label style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: "var(--cc-text-muted)",
                  display: 'block',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }} htmlFor="admin-paymentspagetsx-2">
                  Payment Method
                </label>
                <select
                  value={methodFilter || ''}
                  onChange={e => setMethodFilter(e.target.value || null)}
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
                  id="admin-paymentspagetsx-2">
                  <option value="">All Methods</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range */}
            <div>
              <label style={{
                fontSize: '11px',
                fontWeight: 600,
                color: "var(--cc-text-muted)",
                display: 'block',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }} htmlFor="admin-paymentspagetsx-3">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={e => setDateRange(e.target.value as typeof dateRange)}
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
                id="admin-paymentspagetsx-3">
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
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
              }} htmlFor="admin-paymentspagetsx-4">
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
                id="admin-paymentspagetsx-4">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount_high">Highest Amount</option>
                <option value="amount_low">Lowest Amount</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── TRANSACTIONS TABLE ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: "var(--cc-text-muted)" }}>
            Loading transactions...
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
              No transactions found
            </p>
            <p style={{ fontSize: '14px', color: "var(--cc-text-muted)", margin: 0 }}>
              {search ? 'Try a different search' : 'No payment transactions yet'}
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
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }} className="admin-responsive-table">
                <thead style={{
                  background: 'rgba(124,58,237,0.06)',
                  borderBottom: '1px solid rgba(124,58,237,0.15)',
                }}>
                  <tr>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: "var(--cc-text-secondary)", textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '11px' }}>Transaction ID</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: "var(--cc-text-secondary)", textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '11px' }}>Customer</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: "var(--cc-text-secondary)", textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '11px' }}>Service</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: "var(--cc-text-secondary)", textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '11px' }}>Amount</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: "var(--cc-text-secondary)", textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '11px' }}>Method</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: "var(--cc-text-secondary)", textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '11px' }}>Status</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: "var(--cc-text-secondary)", textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '11px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tx, idx) => {
                    const statusInfo = getStatusColor(tx.status)
                    return (
                      <tr
                        key={tx.id}
                        style={{
                          borderBottom: idx < filtered.length - 1 ? '1px solid rgba(124,58,237,0.08)' : 'none',
                          background: idx % 2 === 0 ? 'transparent' : 'rgba(124,58,237,0.02)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(124,58,237,0.02)'}
                      >
                        <td style={{ padding: '14px 16px', color: "var(--cc-text-muted)", fontFamily: 'monospace', fontSize: '11px' }} data-label="Transaction ID">
                          {tx.transaction_id.substring(0, 8)}...
                        </td>
                        <td style={{ padding: '14px 16px', color: "var(--cc-text-secondary)" }} data-label="Customer">
                          {tx.user_email}
                        </td>
                        <td style={{ padding: '14px 16px', color: "var(--cc-text-secondary)" }} data-label="Service">
                          {tx.service_name}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: "var(--cc-success)" }} data-label="Amount">
                          {formatCurrency(tx.amount, tx.currency)}
                        </td>
                        <td style={{ padding: '14px 16px', color: "var(--cc-text-muted)", fontSize: '12px' }} data-label="Method">
                          {tx.payment_method}
                        </td>
                        <td style={{ padding: '14px 16px' }} data-label="Status">
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: statusInfo.bg,
                            color: statusInfo.color,
                            fontWeight: 600,
                            fontSize: '11px',
                          }}>
                            {statusInfo.text}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: "var(--cc-text-muted)", fontSize: '12px' }} data-label="Date">
                          {formatDate(tx.created_at)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── FOOTER INFO ── */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'rgba(124,58,237,0.06)',
          border: "1px solid var(--cc-border)",
          borderRadius: '12px',
          fontSize: '12px',
          color: "var(--cc-text-secondary)",
        }}>
          <p style={{ margin: 0 }}>
            📊 Showing <strong>{filtered.length}</strong> transaction{filtered.length !== 1 ? 's' : ''} out of <strong>{transactions.length}</strong> total
          </p>
        </div>
      </div>
    </AdminPage>
  )
}
