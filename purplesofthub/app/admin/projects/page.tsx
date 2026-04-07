'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  client_name: string | null
  status: string
  progress: number
  due_date: string | null
  created_at: string
  service: string | null
}

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  active: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: '🟢 Active' },
  completed: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', label: '✅ Completed' },
  on_hold: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: '⏸️ On Hold' },
  cancelled: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: '❌ Cancelled' },
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('projects').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setProjects(data || [])
      setLoading(false)
    })
  }, [])

  const filtered = projects.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || p.client_name?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || p.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>Projects 📁</h1>
          <p style={{ fontSize: '14px', color: '#9d8fd4', margin: 0 }}>{projects.length} total projects</p>
        </div>
        <Link href="/admin/projects/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff', padding: '11px 24px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 16px rgba(124,58,237,0.3)', whiteSpace: 'nowrap' }}>+ New Project</Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total', value: projects.length, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', icon: '📁' },
          { label: 'Active', value: projects.filter(p => p.status === 'active').length, color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: '🟢' },
          { label: 'Completed', value: projects.filter(p => p.status === 'completed').length, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: '✅' },
          { label: 'On Hold', value: projects.filter(p => p.status === 'on_hold').length, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: '⏸️' },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#1a1f2e', border: '1px solid rgba(124,58,237,0.12)', borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{stat.icon}</div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 900, color: stat.color, margin: '0 0 2px', lineHeight: 1 }}>{loading ? '...' : stat.value}</p>
              <p style={{ fontSize: '12px', color: '#9d8fd4', margin: 0 }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1a1f2e', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '10px', padding: '9px 14px', flex: 1, minWidth: '200px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b5fa0" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '13px', width: '100%', fontFamily: 'inherit' }} />
        </div>
        {['all', 'active', 'completed', 'on_hold'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '9px 16px', borderRadius: '10px', border: filter === f ? 'none' : '1px solid rgba(124,58,237,0.2)', background: filter === f ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'transparent', color: filter === f ? '#fff' : '#9d8fd4', fontWeight: 600, fontSize: '12px', cursor: 'pointer', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{f.replace('_', ' ')}</button>
        ))}
      </div>

      {/* Projects list */}
      <div style={{ background: '#1a1f2e', border: '1px solid rgba(124,58,237,0.12)', borderRadius: '20px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 140px 120px 100px', gap: '16px', padding: '14px 24px', borderBottom: '1px solid rgba(124,58,237,0.1)', background: 'rgba(124,58,237,0.04)' }}>
          {['Project', 'Client', 'Status', 'Progress', 'Due Date'].map(h => (
            <p key={h} style={{ fontSize: '11px', fontWeight: 700, color: '#6b5fa0', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>{h}</p>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9d8fd4' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '40px', margin: '0 0 12px' }}>📁</p>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>No projects yet</p>
            <p style={{ fontSize: '13px', color: '#9d8fd4', margin: '0 0 20px' }}>Create your first project to track client work</p>
            <Link href="/admin/projects/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff', padding: '10px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '13px' }}>+ New Project</Link>
          </div>
        ) : (
          filtered.map((project, i) => {
            const status = statusConfig[project.status] || statusConfig.active
            return (
              <div key={project.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 140px 120px 100px', gap: '16px', padding: '16px 24px', borderBottom: i < filtered.length - 1 ? '1px solid rgba(124,58,237,0.06)' : 'none', alignItems: 'center', transition: 'background 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(124,58,237,0.04)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>{project.name}</p>
                  {project.service && <p style={{ fontSize: '11px', color: '#6b5fa0', margin: 0 }}>{project.service}</p>}
                </div>
                <p style={{ fontSize: '13px', color: '#9d8fd4', margin: 0 }}>{project.client_name || '—'}</p>
                <span style={{ fontSize: '11px', fontWeight: 700, color: status.color, background: status.bg, padding: '4px 12px', borderRadius: '100px', display: 'inline-block', whiteSpace: 'nowrap' }}>{status.label}</span>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#9d8fd4' }}>Progress</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#a855f7' }}>{project.progress || 0}%</span>
                  </div>
                  <div style={{ height: '5px', background: 'rgba(124,58,237,0.15)', borderRadius: '100px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${project.progress || 0}%`, background: 'linear-gradient(90deg, #7c3aed, #a855f7)', borderRadius: '100px', transition: 'width 0.8s ease' }} />
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: '#6b5fa0', margin: 0, whiteSpace: 'nowrap' }}>{project.due_date ? new Date(project.due_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : '—'}</p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}