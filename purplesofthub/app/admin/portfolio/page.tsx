'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { PORTFOLIO_PROJECTS } from '@/app/portfolio/_data/portfolio'
import { PREMIUM_RESOURCES } from '@/app/portfolio/_data/resources'

export default function PortfolioAnalyticsPage() {
  const projects = PORTFOLIO_PROJECTS
  const mostViewed = [...projects].sort((a, b) => b.views - a.views).slice(0, 5)
  const mostDownloaded = [...projects].sort((a, b) => b.downloadCount - a.downloadCount).slice(0, 5)
  const mostShared = [...projects].sort((a, b) => b.likes - a.likes).slice(0, 5)
  const newest = [...projects].sort((a, b) => (b.year || '').localeCompare(a.year || '')).slice(0, 5)

  const categories = useMemo(() => {
    const map = new Map<string, number>()
    projects.forEach((p) => map.set(p.category || 'Uncategorised', (map.get(p.category || 'Uncategorised') || 0) + 1))
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [projects])

  const industries = useMemo(() => {
    const map = new Map<string, number>()
    projects.forEach((p) => map.set(p.industry || 'Other', (map.get(p.industry || 'Other') || 0) + 1))
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [projects])

  const totals = {
    views: projects.reduce((sum, p) => sum + p.views, 0),
    downloads: projects.reduce((sum, p) => sum + p.downloadCount, 0) + PREMIUM_RESOURCES.reduce((sum, r) => sum + r.downloadCount, 0),
    enquiries: projects.reduce((sum, p) => sum + p.enquiries, 0),
    likes: projects.reduce((sum, p) => sum + p.likes, 0),
  }

  return (
    <div style={{ maxWidth: 1200 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>Showcase Analytics</h1>
          <p style={{ fontSize: 14, color: '#9d8fd4', margin: 0 }}>Most viewed, downloaded, shared, and the enquiries they generate.</p>
        </div>
        <Link href="/admin/resources" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff', padding: '11px 20px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
          Manage Resources
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          ['Views', totals.views, '👁️'],
          ['Downloads generated', totals.downloads, '⬇️'],
          ['Enquiries generated', totals.enquiries, '💬'],
          ['Likes / shares', totals.likes, '❤️'],
        ].map(([label, value, icon]) => (
          <div key={String(label)} style={{ background: '#1a1f2e', border: '1px solid rgba(124,58,237,0.12)', borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 20 }}>{icon}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginTop: 8 }}>{Number(value).toLocaleString()}</div>
            <div style={{ fontSize: 12, color: '#9d8fd4' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Panel title="Most Viewed" items={mostViewed.map((p) => [p.title, p.views])} />
        <Panel title="Most Downloaded" items={mostDownloaded.map((p) => [p.title, p.downloadCount])} />
        <Panel title="Most Shared" items={mostShared.map((p) => [p.title, p.likes])} />
        <Panel title="Newest Projects" items={newest.map((p) => [p.title, p.year || ''])} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Panel title="Popular Categories" items={categories} />
        <Panel title="Client Industries" items={industries} />
      </div>
    </div>
  )
}

function Panel({ title, items }: { title: string; items: Array<[string, string | number]> }) {
  return (
    <div style={{ background: '#1a1f2e', border: '1px solid rgba(124,58,237,0.12)', borderRadius: 14, padding: 18 }}>
      <h2 style={{ color: '#fff', fontSize: 16, margin: '0 0 14px' }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: '#d6d3e8', fontSize: 13 }}>
            <span>{label}</span>
            <strong style={{ color: '#c4b5fd' }}>{value}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}
