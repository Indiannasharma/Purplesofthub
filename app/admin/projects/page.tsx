'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

type ProjectRow = {
  _id: string
  title: string
  status?: string
  progress?: number
  dueDate?: string
  updatedAt?: string
  service?: { name?: string }
  client?: { _id: string; firstName?: string; lastName?: string }
}

const FILTERS = ['all', 'planning', 'design', 'development', 'review', 'completed'] as const

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  planning: { bg: 'rgba(59,130,246,.15)', color: '#60a5fa' },
  design: { bg: 'rgba(234,179,8,.15)', color: '#facc15' },
  development: { bg: 'rgba(124,58,237,.15)', color: '#a855f7' },
  review: { bg: 'rgba(249,115,22,.15)', color: '#fb923c' },
  completed: { bg: 'rgba(34,197,94,.15)', color: '#4ade80' },
}

export default function AdminProjectsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const successMessage = useMemo(() => {
    if (searchParams.get('created')) return 'Project created successfully.'
    if (searchParams.get('updated')) return 'Project updated successfully.'
    if (searchParams.get('deleted')) return 'Project deleted successfully.'
    return null
  }, [searchParams])

  useEffect(() => {
    if (!successMessage) return
    setToast(successMessage)
    const timer = setTimeout(() => {
      setToast(null)
      router.replace('/admin/projects')
    }, 2500)
    return () => clearTimeout(timer)
  }, [successMessage, router])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/projects', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Failed to load projects.')
        setLoading(false)
        return
      }
      setProjects(data?.projects || [])
    } catch (err) {
      console.error('Projects fetch error:', err)
      setError('Failed to load projects.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'all') return projects
    return projects.filter((p) => p.status === filter)
  }, [projects, filter])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#e2d9f3' }}>Projects Manager</h1>
          <p style={{ color: '#9d8fd4', fontSize: 13 }}>Track and manage all client projects.</p>
        </div>
        <Link
          href="/admin/projects/new"
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
          + New Project
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
          <div style={{ padding: 32, color: '#9d8fd4', fontSize: 14 }}>Loading projects...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 32, color: '#9d8fd4', fontSize: 14 }}>No projects found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 960 }}>
              <thead>
                <tr style={{ textAlign: 'left', fontSize: 12, color: '#9d8fd4', background: 'rgba(124,58,237,.08)' }}>
                  <th style={thStyle}>Project</th>
                  <th style={thStyle}>Client</th>
                  <th style={thStyle}>Service</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Progress</th>
                  <th style={thStyle}>Due Date</th>
                  <th style={thStyle}>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((project, index) => {
                  const status = project.status || 'planning'
                  const style = STATUS_COLORS[status] || STATUS_COLORS.planning
                  const clientName =
                    `${project.client?.firstName || ''} ${project.client?.lastName || ''}`.trim() ||
                    'Client'
                  return (
                    <tr key={project._id} style={{ borderTop: index === 0 ? 'none' : '1px solid rgba(124,58,237,.08)' }}>
                      <td style={tdStyle}>
                        <Link href={`/admin/projects/${project._id}`} style={{ color: '#e2d9f3', textDecoration: 'none', fontWeight: 700 }}>
                          {project.title}
                        </Link>
                      </td>
                      <td style={tdStyle}>
                        <Link href={`/admin/clients/${project.client?._id}`} style={{ color: '#a855f7', textDecoration: 'none', fontWeight: 600 }}>
                          {clientName}
                        </Link>
                      </td>
                      <td style={tdStyle}>{project.service?.name || '—'}</td>
                      <td style={tdStyle}>
                        <span style={{ padding: '4px 10px', borderRadius: 100, background: style.bg, color: style.color, fontSize: 11, fontWeight: 600 }}>
                          {status}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ height: 6, width: 120, background: 'rgba(124,58,237,.15)', borderRadius: 100 }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${Number(project.progress || 0)}%`,
                                borderRadius: 100,
                                background: 'linear-gradient(90deg,#7c3aed,#a855f7)',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: 12, color: '#9d8fd4' }}>{Number(project.progress || 0)}%</span>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        {project.dueDate ? new Date(project.dueDate).toLocaleDateString('en-US') : '—'}
                      </td>
                      <td style={tdStyle}>
                        {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString('en-US') : '—'}
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
