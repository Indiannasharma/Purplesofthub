'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

type ClientDetail = {
  _id: string
  firstName?: string
  lastName?: string
  email: string
  avatar?: string
  phone?: string
  company?: string
  country?: string
  isActive?: boolean
  createdAt?: string
}

type ProjectItem = {
  _id: string
  title: string
  status?: string
  progress?: number
  service?: { name?: string }
}

type InvoiceItem = {
  _id: string
  invoiceNumber: string
  total?: number
  currency?: string
  status?: string
  dueDate?: string
}

type FileItem = {
  _id: string
  name: string
  fileType?: string
  createdAt?: string
  url?: string
}

type ChatLeadItem = {
  _id: string
  name?: string
  email?: string
  summary?: string
  createdAt?: string
}

const TABS = ['Projects', 'Invoices', 'Files', 'Chat Leads'] as const
type Tab = (typeof TABS)[number]

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  planning: { bg: 'rgba(59,130,246,.15)', color: '#60a5fa' },
  design: { bg: 'rgba(234,179,8,.15)', color: '#facc15' },
  development: { bg: 'rgba(124,58,237,.15)', color: '#a855f7' },
  review: { bg: 'rgba(249,115,22,.15)', color: '#fb923c' },
  completed: { bg: 'rgba(34,197,94,.15)', color: '#4ade80' },
  'on-hold': { bg: 'rgba(107,114,128,.15)', color: '#9ca3af' },
  sent: { bg: 'rgba(234,179,8,.15)', color: '#facc15' },
  paid: { bg: 'rgba(34,197,94,.15)', color: '#4ade80' },
  overdue: { bg: 'rgba(239,68,68,.15)', color: '#f87171' },
  draft: { bg: 'rgba(107,114,128,.15)', color: '#9ca3af' },
  active: { bg: 'rgba(34,197,94,.15)', color: '#4ade80' },
  inactive: { bg: 'rgba(239,68,68,.15)', color: '#f87171' },
}

export default function AdminClientDetailPage() {
  const params = useParams<{ id: string }>()
  const clientId = params?.id
  const [client, setClient] = useState<ClientDetail | null>(null)
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [invoices, setInvoices] = useState<InvoiceItem[]>([])
  const [files, setFiles] = useState<FileItem[]>([])
  const [chatLeads, setChatLeads] = useState<ChatLeadItem[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('Projects')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  const fetchClient = async () => {
    if (!clientId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Failed to load client.')
        setLoading(false)
        return
      }
      setClient(data?.client || null)
      setProjects(data?.projects || [])
      setInvoices(data?.invoices || [])
      setFiles(data?.files || [])
      setChatLeads(data?.chatLeads || [])
    } catch (err) {
      console.error('Client fetch error:', err)
      setError('Failed to load client.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClient()
  }, [clientId])

  const totalSpent = useMemo(() => {
    return invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + Number(inv.total || 0), 0)
  }, [invoices])

  const updateStatus = async (nextValue: boolean) => {
    if (!clientId) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextValue }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Failed to update status.')
        setUpdating(false)
        return
      }
      setClient((prev) => (prev ? { ...prev, isActive: data?.client?.isActive } : prev))
    } catch (err) {
      console.error('Update status error:', err)
      setError('Failed to update status.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div style={{ color: '#9d8fd4', fontSize: 14 }}>Loading client...</div>
  }

  if (error || !client) {
    return (
      <div style={{ color: '#f87171', fontSize: 14 }}>
        {error || 'Client not found.'}
      </div>
    )
  }

  const fullName = `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Unnamed Client'
  const initials = fullName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="client-detail-grid" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
      <aside
        style={{
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(124,58,237,.18)',
          borderRadius: 16,
          padding: 24,
          height: 'fit-content',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          {client.avatar ? (
            <img
              src={client.avatar}
              alt={fullName}
              style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(124,58,237,.2)',
                color: '#a855f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 16,
              }}
            >
              {initials}
            </div>
          )}
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#e2d9f3' }}>{fullName}</div>
            <div style={{ fontSize: 12, color: '#9d8fd4' }}>{client.email}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 10, fontSize: 13, color: '#9d8fd4', marginBottom: 20 }}>
          <div>Phone: <span style={{ color: '#e2d9f3' }}>{client.phone || '—'}</span></div>
          <div>Company: <span style={{ color: '#e2d9f3' }}>{client.company || '—'}</span></div>
          <div>Country: <span style={{ color: '#e2d9f3' }}>{client.country || '—'}</span></div>
          <div>
            Joined:{' '}
            <span style={{ color: '#e2d9f3' }}>
              {client.createdAt
                ? new Date(client.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '—'}
            </span>
          </div>
          <div>
            Total spent:{' '}
            <span style={{ color: '#e2d9f3' }}>₦{Number(totalSpent).toLocaleString()}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#9d8fd4' }}>Status</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={Boolean(client.isActive)}
              onChange={(e) => updateStatus(e.target.checked)}
              disabled={updating}
            />
            <span style={{ color: client.isActive ? '#4ade80' : '#f87171', fontSize: 12 }}>
              {client.isActive ? 'Active' : 'Inactive'}
            </span>
          </label>
        </div>
      </aside>

      <section>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px',
                borderRadius: 100,
                border: '1px solid rgba(124,58,237,.25)',
                background: activeTab === tab ? 'rgba(124,58,237,.2)' : 'transparent',
                color: activeTab === tab ? '#e2d9f3' : '#9d8fd4',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,.04)',
            border: '1px solid rgba(124,58,237,.18)',
            borderRadius: 16,
            padding: 20,
          }}
        >
          {activeTab === 'Projects' && (
            <div style={{ display: 'grid', gap: 14 }}>
              {projects.length === 0 ? (
                <div style={{ color: '#9d8fd4', fontSize: 13 }}>No projects yet.</div>
              ) : (
                projects.map((project) => {
                  const status = project.status || 'planning'
                  const style = STATUS_COLORS[status] || STATUS_COLORS.planning
                  return (
                    <div key={project._id} style={{ borderBottom: '1px solid rgba(124,58,237,.08)', paddingBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#e2d9f3' }}>{project.title}</div>
                          <div style={{ fontSize: 12, color: '#9d8fd4' }}>{project.service?.name || '—'}</div>
                        </div>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: 100,
                            background: style.bg,
                            color: style.color,
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {status}
                        </span>
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9d8fd4', marginBottom: 4 }}>
                          <span>Progress</span>
                          <span>{Number(project.progress || 0)}%</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 100, background: 'rgba(124,58,237,.15)' }}>
                          <div
                            style={{
                              width: `${Number(project.progress || 0)}%`,
                              height: '100%',
                              borderRadius: 100,
                              background: 'linear-gradient(90deg,#7c3aed,#a855f7)',
                            }}
                          />
                        </div>
                      </div>
                      <Link
                        href={`/admin/projects/${project._id}`}
                        style={{ display: 'inline-block', marginTop: 10, color: '#a855f7', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                      >
                        View Project →
                      </Link>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {activeTab === 'Invoices' && (
            <div style={{ display: 'grid', gap: 12 }}>
              {invoices.length === 0 ? (
                <div style={{ color: '#9d8fd4', fontSize: 13 }}>No invoices yet.</div>
              ) : (
                invoices.map((invoice) => {
                  const status = invoice.status || 'draft'
                  const style = STATUS_COLORS[status] || STATUS_COLORS.draft
                  return (
                    <div key={invoice._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid rgba(124,58,237,.08)', paddingBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#e2d9f3' }}>{invoice.invoiceNumber}</div>
                        <div style={{ fontSize: 12, color: '#9d8fd4' }}>
                          Due {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-US') : '—'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontWeight: 700, color: '#e2d9f3' }}>
                          {invoice.currency === 'USD' ? '$' : '₦'}
                          {Number(invoice.total || 0).toLocaleString()}
                        </span>
                        <span style={{ padding: '4px 10px', borderRadius: 100, background: style.bg, color: style.color, fontSize: 11, fontWeight: 600 }}>
                          {status}
                        </span>
                        <Link
                          href={`/admin/invoices/${invoice._id}`}
                          style={{ color: '#a855f7', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                        >
                          View Invoice →
                        </Link>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {activeTab === 'Files' && (
            <div style={{ display: 'grid', gap: 12 }}>
              {files.length === 0 ? (
                <div style={{ color: '#9d8fd4', fontSize: 13 }}>No files yet.</div>
              ) : (
                files.map((file) => (
                  <div key={file._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid rgba(124,58,237,.08)', paddingBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#e2d9f3' }}>{file.name}</div>
                      <div style={{ fontSize: 12, color: '#9d8fd4' }}>{file.fileType || 'File'}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, color: '#9d8fd4' }}>
                        {file.createdAt ? new Date(file.createdAt).toLocaleDateString('en-US') : '—'}
                      </span>
                      {file.url && (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#a855f7', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                        >
                          Download →
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'Chat Leads' && (
            <div style={{ display: 'grid', gap: 12 }}>
              {chatLeads.length === 0 ? (
                <div style={{ color: '#9d8fd4', fontSize: 13 }}>No chat leads yet.</div>
              ) : (
                chatLeads.map((lead) => (
                  <div key={lead._id} style={{ borderBottom: '1px solid rgba(124,58,237,.08)', paddingBottom: 10 }}>
                    <div style={{ fontWeight: 700, color: '#e2d9f3' }}>{lead.name || 'Lead'}</div>
                    <div style={{ fontSize: 12, color: '#9d8fd4' }}>{lead.email || '—'}</div>
                    <div style={{ fontSize: 12, color: '#b8a9d9', marginTop: 6 }}>
                      {lead.summary || 'No summary provided.'}
                    </div>
                    <div style={{ fontSize: 11, color: '#3d2f60', marginTop: 6 }}>
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleString('en-US') : ''}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .client-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
