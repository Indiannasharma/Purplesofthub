'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

type InvoiceRow = {
  _id: string
  invoiceNumber: string
  total: number
  currency: 'NGN' | 'USD'
  status: string
  dueDate?: string
  client?: { _id: string; firstName?: string; lastName?: string }
}

const FILTERS = ['all', 'draft', 'sent', 'paid', 'overdue'] as const

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  draft: { bg: 'rgba(107,114,128,.15)', color: '#9ca3af' },
  sent: { bg: 'rgba(234,179,8,.15)', color: '#facc15' },
  paid: { bg: 'rgba(34,197,94,.15)', color: '#4ade80' },
  overdue: { bg: 'rgba(239,68,68,.15)', color: '#f87171' },
}

export default function AdminInvoicesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [invoices, setInvoices] = useState<InvoiceRow[]>([])
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const successMessage = useMemo(() => {
    if (searchParams.get('created')) return 'Invoice created successfully.'
    if (searchParams.get('updated')) return 'Invoice updated successfully.'
    if (searchParams.get('sent')) return 'Invoice sent to client.'
    if (searchParams.get('paid')) return 'Invoice marked as paid.'
    return null
  }, [searchParams])

  useEffect(() => {
    if (!successMessage) return
    setToast(successMessage)
    const timer = setTimeout(() => {
      setToast(null)
      router.replace('/admin/invoices')
    }, 2500)
    return () => clearTimeout(timer)
  }, [successMessage, router])

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/invoices', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Failed to load invoices.')
        setLoading(false)
        return
      }
      setInvoices(data?.invoices || [])
    } catch (err) {
      console.error('Invoices fetch error:', err)
      setError('Failed to load invoices.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'all') return invoices
    return invoices.filter((inv) => inv.status === filter)
  }, [invoices, filter])

  const sendInvoice = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}/send`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Failed to send invoice.')
        return
      }
      setInvoices((prev) => prev.map((inv) => (inv._id === invoiceId ? { ...inv, status: data.invoice?.status || 'sent' } : inv)))
      router.replace('/admin/invoices?sent=1')
    } catch (err) {
      console.error('Send invoice error:', err)
      setError('Failed to send invoice.')
    }
  }

  const markPaid = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid', paidAt: new Date().toISOString() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Failed to mark paid.')
        return
      }
      setInvoices((prev) => prev.map((inv) => (inv._id === invoiceId ? { ...inv, status: 'paid' } : inv)))
      router.replace('/admin/invoices?paid=1')
    } catch (err) {
      console.error('Mark paid error:', err)
      setError('Failed to mark paid.')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#e2d9f3' }}>Invoice Manager</h1>
          <p style={{ color: '#9d8fd4', fontSize: 13 }}>Create, send, and track client invoices.</p>
        </div>
        <Link
          href="/admin/invoices/new"
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
          + New Invoice
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {FILTERS.map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            style={{
              padding: '7px 14px',
              borderRadius: 100,
              border: '1px solid rgba(124,58,237,.25)',
              background: filter === item ? 'rgba(124,58,237,.2)' : 'transparent',
              color: filter === item ? '#e2d9f3' : '#9d8fd4',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {item === 'all' ? 'All' : item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
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
          <div style={{ padding: 32, color: '#9d8fd4', fontSize: 14 }}>Loading invoices...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 32, color: '#9d8fd4', fontSize: 14 }}>No invoices found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 960 }}>
              <thead>
                <tr style={{ textAlign: 'left', fontSize: 12, color: '#9d8fd4', background: 'rgba(124,58,237,.08)' }}>
                  <th style={thStyle}>Invoice</th>
                  <th style={thStyle}>Client</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Due Date</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((invoice, index) => {
                  const style = STATUS_STYLES[invoice.status] || STATUS_STYLES.draft
                  const clientName =
                    `${invoice.client?.firstName || ''} ${invoice.client?.lastName || ''}`.trim() || 'Client'

                  return (
                    <tr key={invoice._id} style={{ borderTop: index === 0 ? 'none' : '1px solid rgba(124,58,237,.08)' }}>
                      <td style={tdStyle}>
                        <Link href={`/admin/invoices/${invoice._id}`} style={{ color: '#e2d9f3', textDecoration: 'none', fontWeight: 700 }}>
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td style={tdStyle}>{clientName}</td>
                      <td style={tdStyle}>
                        {invoice.currency === 'USD' ? '$' : '₦'}
                        {Number(invoice.total).toLocaleString()}
                      </td>
                      <td style={tdStyle}>
                        <span style={{ padding: '4px 10px', borderRadius: 100, background: style.bg, color: style.color, fontSize: 11, fontWeight: 600 }}>
                          {invoice.status}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-US') : '—'}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <Link
                            href={`/admin/invoices/${invoice._id}`}
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
                          {invoice.status !== 'paid' && (
                            <button
                              onClick={() => sendInvoice(invoice._id)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: 8,
                                background: 'rgba(34,197,94,.15)',
                                color: '#4ade80',
                                border: '1px solid rgba(34,197,94,.25)',
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Send
                            </button>
                          )}
                          {invoice.status !== 'paid' && (
                            <button
                              onClick={() => markPaid(invoice._id)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: 8,
                                background: 'rgba(99,102,241,.15)',
                                color: '#c4b5fd',
                                border: '1px solid rgba(99,102,241,.25)',
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
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
