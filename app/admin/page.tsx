'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeProjects: 0,
    pendingInvoices: 0,
    totalRevenue: 0,
    newLeads: 0,
    blogPosts: 0,
    newsletterSubs: 0,
    recoveryRequests: 0,
    musicCampaigns: 0,
    donations: 0,
  })
  const [recentLeads, setRecentLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const supabase = createClient()

    const [
      clients,
      projects,
      invoices,
      leads,
      blog,
      newsletter,
      recovery,
      music,
    ] = await Promise.allSettled([
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('projects').select('id', { count: 'exact' }).eq('status', 'active'),
      supabase.from('invoices').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('chat_leads').select('id, full_name, email, service, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('blog_posts').select('id', { count: 'exact' }),
      supabase.from('newsletter_subscribers').select('id', { count: 'exact' }),
      supabase.from('account_recovery_requests').select('id', { count: 'exact' }),
      supabase.from('music_campaigns').select('id', { count: 'exact' }),
    ])

    setStats({
      totalClients: clients.status === 'fulfilled' ? clients.value.count || 0 : 0,
      activeProjects: projects.status === 'fulfilled' ? projects.value.count || 0 : 0,
      pendingInvoices: invoices.status === 'fulfilled' ? invoices.value.count || 0 : 0,
      totalRevenue: 0,
      newLeads: leads.status === 'fulfilled' ? leads.value.data?.length || 0 : 0,
      blogPosts: blog.status === 'fulfilled' ? blog.value.count || 0 : 0,
      newsletterSubs: newsletter.status === 'fulfilled' ? newsletter.value.count || 0 : 0,
      recoveryRequests: recovery.status === 'fulfilled' ? recovery.value.count || 0 : 0,
      musicCampaigns: music.status === 'fulfilled' ? music.value.count || 0 : 0,
      donations: 0,
    })

    if (leads.status === 'fulfilled') {
      setRecentLeads(leads.value.data || [])
    }

    setLoading(false)
  }

  const statCards = [
    { label: 'Total Clients', value: stats.totalClients, icon: '👥', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', href: '/admin/clients' },
    { label: 'Active Projects', value: stats.activeProjects, icon: '📁', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', href: '/admin/projects' },
    { label: 'Pending Invoices', value: stats.pendingInvoices, icon: '💳', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', href: '/admin/invoices' },
    { label: 'New Leads', value: stats.newLeads, icon: '📩', color: '#10b981', bg: 'rgba(16,185,129,0.1)', href: '/admin/leads' },
    { label: 'Blog Posts', value: stats.blogPosts, icon: '✍️', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', href: '/admin/blog' },
    { label: 'Newsletter Subs', value: stats.newsletterSubs, icon: '📧', color: '#ec4899', bg: 'rgba(236,72,153,0.1)', href: '/admin/subscribers' },
    { label: 'Recovery Requests', value: stats.recoveryRequests, icon: '🔐', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', href: '/admin/recovery' },
    { label: 'Music Campaigns', value: stats.musicCampaigns, icon: '🎵', color: '#f97316', bg: 'rgba(249,115,22,0.1)', href: '/admin/music' },
  ]

  return (
    <div style={{ padding: 'clamp(20px, 3vw, 32px)', maxWidth: '1400px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 900, color: 'var(--admin-heading, #fff)', margin: '0 0 6px' }}>
          Admin Dashboard 🛠️
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--admin-body, #9d8fd4)', margin: 0 }}>
          Welcome back! Here's what's happening with PurpleSoftHub today.
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {statCards.map(card => (
          <Link key={card.label} href={card.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--admin-card, #1a1f2e)',
              border: '1px solid rgba(124,58,237,0.15)',
              borderRadius: '16px',
              padding: '20px',
              transition: 'all 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = card.color;
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(124,58,237,0.15)';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
            }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '16px' }}>
                {card.icon}
              </div>
              <p style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 900, color: card.color, margin: '0 0 4px', lineHeight: 1 }}>
                {loading ? '...' : card.value}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--admin-body, #9d8fd4)', margin: 0, fontWeight: 500 }}>
                {card.label}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '32px' }}>
        <p style={{ gridColumn: '1 / -1', fontSize: '13px', fontWeight: 700, color: 'var(--admin-body, #9d8fd4)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>
          Quick Actions
        </p>
        {[
          { label: '✍️ New Blog Post', href: '/admin/blog/new', color: '#7c3aed' },
          { label: '📁 New Project', href: '/admin/projects/new', color: '#3b82f6' },
          { label: '💳 New Invoice', href: '/admin/invoices/new', color: '#f59e0b' },
          { label: '👤 View Clients', href: '/admin/clients', color: '#10b981' },
          { label: '📩 View Leads', href: '/admin/leads', color: '#ec4899' },
          { label: '🔐 Recovery Requests', href: '/admin/recovery', color: '#ef4444' },
        ].map(action => (
          <Link key={action.label} href={action.href} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 16px',
              background: 'var(--admin-card, #1a1f2e)',
              border: '1px solid rgba(124,58,237,0.15)',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 600,
              color: action.color,
              textDecoration: 'none',
              transition: 'all 0.2s',
              textAlign: 'center',
              cursor: 'pointer',
            }}>
              {action.label}
            </div>
          </Link>
        ))}
      </div>

      {/* Recent leads */}
      <div style={{
        background: 'var(--admin-card, #1a1f2e)',
        border: '1px solid rgba(124,58,237,0.15)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--admin-heading, #fff)', margin: 0 }}>
            Recent Contact Leads 📩
          </h2>
          <Link href="/admin/leads" style={{ fontSize: '13px', color: '#7c3aed', textDecoration: 'none', fontWeight: 600 }}>
            View all →
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <p style={{ fontSize: '14px', color: 'var(--admin-body, #9d8fd4)', textAlign: 'center', padding: '20px 0' }}>
            No leads yet
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {recentLeads.map((lead: any) => (
              <div key={lead.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(124,58,237,0.05)',
                borderRadius: '12px',
                flexWrap: 'wrap',
                gap: '8px',
              }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--admin-heading, #fff)', margin: '0 0 2px' }}>
                    {lead.full_name}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--admin-body, #9d8fd4)', margin: 0 }}>
                    {lead.email} · {lead.service}
                  </p>
                </div>
                <span style={{ fontSize: '11px', color: '#9d8fd4', whiteSpace: 'nowrap' }}>
                  {new Date(lead.created_at).toLocaleDateString('en-NG')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        :root {
          --admin-heading: #1a1a1a;
          --admin-body: #6b5fa0;
          --admin-card: #f8f5ff;
        }
        .dark {
          --admin-heading: #ffffff;
          --admin-body: #9d8fd4;
          --admin-card: #1a1f2e;
        }
      `}</style>
    </div>
  )
}
