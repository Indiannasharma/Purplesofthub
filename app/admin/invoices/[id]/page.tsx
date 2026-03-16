'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

type InvoiceDetail = {
  _id: string
  invoiceNumber: string
  createdAt?: string
  dueDate?: string
  status?: string
  currency?: 'NGN' | 'USD'
  items?: Array<{ description?: string; quantity?: number; unitPrice?: number; total?: number }>
  subtotal?: number
  tax?: number
  total?: number
  notes?: string
  paidAt?: string
  paymentReference?: string
  paymentMethod?: string
  client?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    company?: string
    country?: string
  }
  project?: { title?: string }
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  draft: { bg: 'rgba(107,114,128,.15)', color: '#9ca3af' },
  sent: { bg: 'rgba(234,179,8,.15)', color: '#facc15' },
  paid: { bg: 'rgba(34,197,94,.15)', color: '#4ade80' },
  overdue: { bg: 'rgba(239,68,68,.15)', color: '#f87171' },
}

export default function AdminInvoiceDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const invoiceId = params?.id
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInvoice = async () => {
    if (!invoiceId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Failed to load invoice.')
        setLoading(false)
        return
      }
      setInvoice(data?.invoice || null)
    } catch (err) {
      console.error('Invoice fetch error:', err)
      setError('Failed to load invoice.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoice()
  }, [invoiceId])

  const sendInvoice = async () => {
    if (!invoiceId) return
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}/send`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Failed to send invoice.')
        return
      }
      setInvoice(data?.invoice || invoice)
      router.replace('/admin/invoices?sent=1')
    } catch (err) {
      console.error('Send invoice error:', err)
      setError('Failed to send invoice.')
    }
  }

  const markPaid = async () => {
    if (!invoiceId) return
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
      setInvoice(data?.invoice || invoice)
      router.replace('/admin/invoices?paid=1')
    } catch (err) {
      console.error('Mark paid error:', err)
      setError('Failed to mark paid.')
    }
  }

  if (loading) {
    return <div style={{ color: '#9d8fd4', fontSize: 14 }}>Loading invoice...</div>
  }

  if (error || !invoice) {
    return (
      <div style={{ color: '#f87171', fontSize: 14 }}>
        {error || 'Invoice not found.'}
      </div>
    )
  }

  const style = STATUS_STYLES[invoice.status || 'draft'] || STATUS_STYLES.draft
  const currency = invoice.currency || 'NGN'

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#e2d9f3' }}>Invoice {invoice.invoiceNumber}</h1>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {invoice.status === 'draft' && (
            <button onClick={sendInvoice} style={primaryButtonStyle}>
              Send to Client
            </button>
          )}
          {invoice.status === 'sent' && (
            <button onClick={markPaid} style={secondaryButtonStyle}>
              Mark as Paid
            </button>
          )}
          <button onClick={() => window.print()} style={ghostButtonStyle}>
            Download PDF
          </button>
        </div>
      </div>

      <div
        style={{
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(124,58,237,.18)',
          borderRadius: 16,
          padding: 24,
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: '#9d8fd4' }}>Status</div>
            <span style={{ padding: '4px 10px', borderRadius: 100, background: style.bg, color: style.color, fontSize: 11, fontWeight: 600 }}>
              {invoice.status}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#9d8fd4' }}>Due Date</div>
            <div style={{ color: '#e2d9f3', fontWeight: 600 }}>
              {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-US') : '—'}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, color: '#9d8fd4', marginBottom: 6 }}>From</div>
            <div style={{ color: '#e2d9f3', fontWeight: 700 }}>PurpleSoftHub</div>
            <div style={{ color: '#9d8fd4', fontSize: 12 }}>hello@purplesofthub.com</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#9d8fd4', marginBottom: 6 }}>To</div>
            <div style={{ color: '#e2d9f3', fontWeight: 700 }}>
              {invoice.client?.firstName} {invoice.client?.lastName}
            </div>
            <div style={{ color: '#9d8fd4', fontSize: 12 }}>{invoice.client?.email}</div>
            {invoice.client?.company && (
              <div style={{ color: '#9d8fd4', fontSize: 12 }}>{invoice.client.company}</div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#9d8fd4', marginBottom: 6 }}>Project</div>
            <div style={{ color: '#e2d9f3', fontWeight: 600 }}>{invoice.project?.title || '—'}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          {(invoice.items || []).map((item, index) => (
            <div key={`item-${index}`} style={{ display: 'grid', gridTemplateColumns: '1.4fr .3fr .3fr .4fr', gap: 10, fontSize: 13, color: '#e2d9f3' }}>
              <span>{item.description || 'Item'}</span>
              <span>{item.quantity}</span>
              <span>
                {currency === 'USD' ? '$' : '₦'}
                {Number(item.unitPrice || 0).toLocaleString()}
              </span>
              <span>
                {currency === 'USD' ? '$' : '₦'}
                {Number(item.total || 0).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(124,58,237,.2)', marginTop: 16, paddingTop: 12, display: 'grid', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#9d8fd4' }}>
            <span>Subtotal</span>
            <span>
              {currency === 'USD' ? '$' : '₦'}
              {Number(invoice.subtotal || 0).toLocaleString()}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#9d8fd4' }}>
            <span>Tax ({invoice.tax || 0}%)</span>
            <span>
              {currency === 'USD' ? '$' : '₦'}
              {Number(((invoice.subtotal || 0) * ((invoice.tax || 0) / 100)).toFixed(2)).toLocaleString()}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, color: '#e2d9f3', fontWeight: 700 }}>
            <span>Total</span>
            <span>
              {currency === 'USD' ? '$' : '₦'}
              {Number(invoice.total || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {invoice.notes && (
          <div style={{ marginTop: 16, fontSize: 12, color: '#9d8fd4' }}>
            Notes: <span style={{ color: '#e2d9f3' }}>{invoice.notes}</span>
          </div>
        )}
      </div>

      <div
        style={{
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(124,58,237,.18)',
          borderRadius: 16,
          padding: 20,
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#e2d9f3', marginBottom: 8 }}>Payment History</h2>
        {invoice.status === 'paid' ? (
          <div style={{ fontSize: 13, color: '#9d8fd4' }}>
            Paid on {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString('en-US') : '—'}.
            {invoice.paymentReference && (
              <div style={{ marginTop: 6 }}>
                Reference: <span style={{ color: '#e2d9f3' }}>{invoice.paymentReference}</span>
              </div>
            )}
            {invoice.paymentMethod && (
              <div style={{ marginTop: 6 }}>
                Method: <span style={{ color: '#e2d9f3' }}>{invoice.paymentMethod}</span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: '#9d8fd4', fontSize: 13 }}>No payments recorded yet.</div>
        )}
      </div>
    </div>
  )
}

const primaryButtonStyle: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 50,
  border: 'none',
  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
}

const secondaryButtonStyle: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 50,
  border: '1px solid rgba(124,58,237,.3)',
  background: 'transparent',
  color: '#a855f7',
  fontWeight: 700,
  cursor: 'pointer',
}

const ghostButtonStyle: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 50,
  border: '1px solid rgba(124,58,237,.2)',
  background: 'rgba(124,58,237,.08)',
  color: '#c4b5fd',
  fontWeight: 700,
  cursor: 'pointer',
}
