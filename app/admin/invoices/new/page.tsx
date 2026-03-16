'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type ClientOption = {
  _id: string
  firstName?: string
  lastName?: string
  email: string
}

type ProjectOption = {
  _id: string
  title: string
  client?: { _id: string }
}

type LineItem = {
  description: string
  quantity: number
  unitPrice: number
}

export default function NewInvoicePage() {
  const router = useRouter()
  const [clients, setClients] = useState<ClientOption[]>([])
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [clientId, setClientId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN')
  const [items, setItems] = useState<LineItem[]>([{ description: '', quantity: 1, unitPrice: 0 }])
  const [tax, setTax] = useState(0)
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')

  const fetchOptions = async () => {
    setLoading(true)
    try {
      const [clientsRes, projectsRes] = await Promise.all([
        fetch('/api/admin/clients', { cache: 'no-store' }),
        fetch('/api/admin/projects', { cache: 'no-store' }),
      ])

      const clientsData = await clientsRes.json()
      const projectsData = await projectsRes.json()

      if (!clientsRes.ok) throw new Error(clientsData?.error || 'Failed to load clients.')
      if (!projectsRes.ok) throw new Error(projectsData?.error || 'Failed to load projects.')

      setClients(clientsData?.clients || [])
      setProjects(projectsData?.projects || [])
    } catch (err) {
      console.error('Invoice form options error:', err)
      setError('Failed to load form options.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOptions()
  }, [])

  const filteredProjects = useMemo(() => {
    if (!clientId) return projects
    return projects.filter((project) => project.client?._id === clientId)
  }, [projects, clientId])

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const taxAmount = subtotal * (tax / 100)
    const total = subtotal + taxAmount
    return { subtotal, taxAmount, total }
  }, [items, tax])

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    )
  }

  const addItem = () => setItems((prev) => [...prev, { description: '', quantity: 1, unitPrice: 0 }])

  const removeItem = (index: number) => {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== index)))
  }

  const createInvoice = async (sendNow: boolean) => {
    setError(null)
    if (!clientId) {
      setError('Client is required.')
      return
    }
    if (!items.some((item) => item.description.trim())) {
      setError('At least one line item is required.')
      return
    }

    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: clientId,
          project: projectId || null,
          currency,
          items,
          tax,
          dueDate: dueDate || null,
          notes,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Failed to create invoice.')
        return
      }

      if (sendNow) {
        await fetch(`/api/admin/invoices/${data.invoice._id}/send`, { method: 'POST' })
        router.push('/admin/invoices?sent=1')
        return
      }

      router.push('/admin/invoices?created=1')
    } catch (err) {
      console.error('Create invoice error:', err)
      setError('Failed to create invoice.')
    }
  }

  const selectedClient = clients.find((client) => client._id === clientId)

  return (
    <div className="invoice-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: 24 }}>
      <div
        style={{
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(124,58,237,.18)',
          borderRadius: 16,
          padding: 24,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#e2d9f3', marginBottom: 4 }}>Create Invoice</h1>
        <p style={{ fontSize: 13, color: '#9d8fd4', marginBottom: 20 }}>Generate a new invoice for a client.</p>

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

        {loading ? (
          <div style={{ color: '#9d8fd4', fontSize: 13 }}>Loading options...</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#9d8fd4' }}>Client *</span>
                <select value={clientId} onChange={(e) => setClientId(e.target.value)} style={{ ...inputStyle, height: 42 }}>
                  <option value="">Select client</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.firstName} {client.lastName} — {client.email}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#9d8fd4' }}>Project</span>
                <select value={projectId} onChange={(e) => setProjectId(e.target.value)} style={{ ...inputStyle, height: 42 }}>
                  <option value="">Select project</option>
                  {filteredProjects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#9d8fd4' }}>Currency</span>
                <select value={currency} onChange={(e) => setCurrency(e.target.value as 'NGN' | 'USD')} style={{ ...inputStyle, height: 42 }}>
                  <option value="NGN">NGN</option>
                  <option value="USD">USD</option>
                </select>
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#9d8fd4' }}>Due Date</span>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
              </label>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: '#9d8fd4' }}>Line Items</span>
                <button
                  onClick={addItem}
                  type="button"
                  style={{
                    padding: '6px 12px',
                    borderRadius: 50,
                    border: '1px solid rgba(124,58,237,.4)',
                    background: 'transparent',
                    color: '#a855f7',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  + Add Line Item
                </button>
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                {items.map((item, index) => (
                  <div key={`item-${index}`} style={{ display: 'grid', gridTemplateColumns: '1.4fr .6fr .6fr auto', gap: 10 }}>
                    <input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      style={inputStyle}
                    />
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                      style={inputStyle}
                    />
                    <input
                      type="number"
                      min={0}
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid rgba(239,68,68,.3)',
                        background: 'rgba(239,68,68,.12)',
                        color: '#f87171',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 20 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#9d8fd4' }}>Tax %</span>
                <input type="number" min={0} value={tax} onChange={(e) => setTax(Number(e.target.value))} style={inputStyle} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#9d8fd4' }}>Notes</span>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={textareaStyle} />
              </label>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => createInvoice(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 50,
                  border: '1px solid rgba(124,58,237,.4)',
                  background: 'transparent',
                  color: '#a855f7',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => createInvoice(true)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 50,
                  border: 'none',
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Save & Send
              </button>
            </div>
          </>
        )}
      </div>

      <div
        style={{
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(124,58,237,.18)',
          borderRadius: 16,
          padding: 24,
          height: 'fit-content',
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2d9f3', marginBottom: 12 }}>Invoice Preview</h2>
        <div style={{ fontSize: 13, color: '#9d8fd4', marginBottom: 8 }}>
          Client: <span style={{ color: '#e2d9f3' }}>{selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : '—'}</span>
        </div>
        <div style={{ fontSize: 13, color: '#9d8fd4', marginBottom: 16 }}>
          Currency: <span style={{ color: '#e2d9f3' }}>{currency}</span>
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {items.map((item, index) => (
            <div key={`preview-${index}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#e2d9f3' }}>
              <span>{item.description || 'Line item'}</span>
              <span>
                {currency === 'USD' ? '$' : '₦'}
                {(item.quantity * item.unitPrice).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(124,58,237,.2)', marginTop: 16, paddingTop: 12, display: 'grid', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#9d8fd4' }}>
            <span>Subtotal</span>
            <span>
              {currency === 'USD' ? '$' : '₦'}
              {totals.subtotal.toLocaleString()}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#9d8fd4' }}>
            <span>Tax ({tax}%)</span>
            <span>
              {currency === 'USD' ? '$' : '₦'}
              {totals.taxAmount.toLocaleString()}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, color: '#e2d9f3', fontWeight: 700 }}>
            <span>Total</span>
            <span>
              {currency === 'USD' ? '$' : '₦'}
              {totals.total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .invoice-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,.04)',
  border: '1px solid rgba(124,58,237,.2)',
  borderRadius: 10,
  padding: '10px 12px',
  color: '#e2d9f3',
  fontSize: 14,
  outline: 'none',
}

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 90,
  resize: 'vertical',
}
