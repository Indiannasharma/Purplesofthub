'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type ClientOption = {
  _id: string
  firstName?: string
  lastName?: string
  email: string
}

type ServiceOption = {
  _id: string
  name: string
  category?: string
}

const STATUS_OPTIONS = ['planning', 'design', 'development', 'review', 'completed'] as const

export default function NewProjectPage() {
  const router = useRouter()
  const [clients, setClients] = useState<ClientOption[]>([])
  const [services, setServices] = useState<ServiceOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [clientId, setClientId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>('planning')
  const [progress, setProgress] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')

  const [clientQuery, setClientQuery] = useState('')

  const fetchOptions = async () => {
    setLoading(true)
    try {
      const [clientsRes, servicesRes] = await Promise.all([
        fetch('/api/admin/clients', { cache: 'no-store' }),
        fetch('/api/admin/services', { cache: 'no-store' }),
      ])

      const clientsData = await clientsRes.json()
      const servicesData = await servicesRes.json()

      if (!clientsRes.ok) throw new Error(clientsData?.error || 'Failed to load clients.')
      if (!servicesRes.ok) throw new Error(servicesData?.error || 'Failed to load services.')

      setClients(clientsData?.clients || [])
      setServices(servicesData?.services || [])
    } catch (err) {
      console.error('Project options error:', err)
      setError('Failed to load form options.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOptions()
  }, [])

  const filteredClients = useMemo(() => {
    const term = clientQuery.toLowerCase().trim()
    if (!term) return clients
    return clients.filter((client) => {
      const name = `${client.firstName || ''} ${client.lastName || ''}`.toLowerCase()
      return name.includes(term) || client.email.toLowerCase().includes(term)
    })
  }, [clients, clientQuery])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Project title is required.')
      return
    }
    if (!clientId) {
      setError('Please select a client.')
      return
    }

    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          client: clientId,
          service: serviceId || null,
          status,
          progress,
          startDate: startDate || null,
          dueDate: dueDate || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Failed to create project.')
        return
      }
      router.push('/admin/projects?created=1')
    } catch (err) {
      console.error('Create project error:', err)
      setError('Failed to create project.')
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 960 }}>
      <div
        style={{
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(124,58,237,.18)',
          borderRadius: 16,
          padding: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#e2d9f3' }}>Create New Project</h1>
            <p style={{ fontSize: 13, color: '#9d8fd4' }}>Kick off a new client project.</p>
          </div>
          <button
            type="submit"
            style={{
              padding: '10px 22px',
              borderRadius: 50,
              border: 'none',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Create Project
          </button>
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

        {loading ? (
          <div style={{ color: '#9d8fd4', fontSize: 13 }}>Loading form options...</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#9d8fd4' }}>Title *</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#9d8fd4' }}>Status</span>
                <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} style={{ ...inputStyle, height: 42 }}>
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#9d8fd4' }}>Progress ({progress}%)</span>
                <input type="range" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 18 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#9d8fd4' }}>Client Search</span>
                <input
                  value={clientQuery}
                  onChange={(e) => setClientQuery(e.target.value)}
                  placeholder="Type name or email"
                  style={inputStyle}
                />
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#9d8fd4' }}>Client *</span>
                <select value={clientId} onChange={(e) => setClientId(e.target.value)} style={{ ...inputStyle, height: 42 }}>
                  <option value="">Select client</option>
                  {filteredClients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.firstName} {client.lastName} — {client.email}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#9d8fd4' }}>Service</span>
                <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} style={{ ...inputStyle, height: 42 }}>
                  <option value="">Select service</option>
                  {services.map((service) => (
                    <option key={service._id} value={service._id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 18 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#9d8fd4' }}>Start Date</span>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#9d8fd4' }}>Due Date</span>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
              </label>
            </div>

            <label style={{ display: 'grid', gap: 6, marginTop: 18 }}>
              <span style={{ fontSize: 12, color: '#9d8fd4' }}>Description</span>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} style={textareaStyle} />
            </label>
          </>
        )}
      </div>
    </form>
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
  minHeight: 100,
  resize: 'vertical',
}
