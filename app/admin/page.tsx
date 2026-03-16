export const dynamic = 'force-dynamic'

import { getCached } from '@/lib/cache'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import Project from '@/lib/models/Project'
import Payment from '@/lib/models/Payment'
import Invoice from '@/lib/models/Invoice'
import ChatLead from '@/lib/models/ChatLead'
import Subscriber from '@/lib/models/Subscriber'
import Link from 'next/link'

async function getAdminStats() {
  await connectDB()

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [
    totalClients,
    activeProjects,
    revenueResult,
    pendingInvoices,
    newLeads,
    subscribers,
    recentClients,
    recentPayments,
    recentLeads,
  ] = await Promise.all([
    User.countDocuments({ role: 'client', isActive: true }),
    Project.countDocuments({ status: { $in: ['planning', 'design', 'development', 'review'] } }),
    Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Invoice.countDocuments({ status: { $in: ['sent', 'overdue'] } }),
    ChatLead.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Subscriber.countDocuments({}),
    User.find({ role: 'client' }).sort({ createdAt: -1 }).limit(5).lean(),
    Payment.find({ status: 'success' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('client', 'firstName lastName email')
      .lean(),
    ChatLead.find({}).sort({ createdAt: -1 }).limit(5).lean(),
  ])

  const totalRevenue = revenueResult[0]?.total ?? 0

  return {
    totalClients,
    activeProjects,
    totalRevenue,
    pendingInvoices,
    newLeads,
    subscribers,
    recentClients,
    recentPayments,
    recentLeads,
  }
}

function timeAgo(date: Date | string) {
  const now = Date.now()
  const diff = now - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const statCards = (stats: Awaited<ReturnType<typeof getAdminStats>>) => [
  { icon: '👥', label: 'Total Clients', value: stats.totalClients, color: '#60a5fa' },
  { icon: '📦', label: 'Active Projects', value: stats.activeProjects, color: '#a855f7' },
  {
    icon: '💰',
    label: 'Total Revenue',
    value: `₦${stats.totalRevenue.toLocaleString()}`,
    color: '#4ade80',
  },
  { icon: '🧾', label: 'Pending Invoices', value: stats.pendingInvoices, color: '#facc15' },
  { icon: '💬', label: 'New Chat Leads', value: stats.newLeads, color: '#fb923c' },
  { icon: '📧', label: 'Subscribers', value: stats.subscribers, color: '#f472b6' },
]

export default async function AdminDashboard() {
  const stats = await getCached('admin:stats', 60, getAdminStats)
  const cards = statCards(stats)

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: '#e2d9f3',
            marginBottom: 4,
          }}
        >
          Dashboard
        </h1>
        <p style={{ color: '#9d8fd4', fontSize: 14 }}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 20,
          marginBottom: 40,
        }}
      >
        {cards.map((card) => (
          <div
            key={card.label}
            style={{
              background: 'rgba(255,255,255,.04)',
              border: '1px solid rgba(124,58,237,.18)',
              borderRadius: 16,
              padding: 24,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(124,58,237,.3), rgba(168,85,247,.2))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                marginBottom: 14,
              }}
            >
              {card.icon}
            </div>
            <div style={{ fontSize: 13, color: '#9d8fd4', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {card.label}
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#fff' }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        {/* Recent Activity */}
        <div
          style={{
            background: 'rgba(255,255,255,.04)',
            border: '1px solid rgba(124,58,237,.18)',
            borderRadius: 16,
            padding: 24,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2d9f3', marginBottom: 20 }}>
            Recent Activity
          </h2>

          {stats.recentClients.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: '#3d2f60', textTransform: 'uppercase', marginBottom: 12 }}>
                New Clients
              </div>
              {stats.recentClients.map((c: Record<string, unknown>) => (
                <div
                  key={String(c._id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(124,58,237,.08)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {String(c.firstName || '?')[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: '#e2d9f3', fontWeight: 500 }}>
                        {String(c.firstName || '')} {String(c.lastName || '')}
                      </div>
                      <div style={{ fontSize: 11, color: '#9d8fd4' }}>{String(c.email || '')}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#3d2f60' }}>{timeAgo(c.createdAt as string)}</div>
                </div>
              ))}
            </div>
          )}

          {stats.recentPayments.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: '#3d2f60', textTransform: 'uppercase', marginBottom: 12 }}>
                Recent Payments
              </div>
              {stats.recentPayments.map((p: Record<string, unknown>) => {
                const client = p.client as Record<string, unknown> | null
                return (
                  <div
                    key={String(p._id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 0',
                      borderBottom: '1px solid rgba(124,58,237,.08)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, color: '#e2d9f3', fontWeight: 500 }}>
                        ₦{Number(p.amount).toLocaleString()}
                      </div>
                      <div style={{ fontSize: 11, color: '#9d8fd4' }}>
                        {client ? `${String(client.firstName || '')} ${String(client.lastName || '')}` : 'Unknown'}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#3d2f60' }}>{timeAgo(p.createdAt as string)}</div>
                  </div>
                )
              })}
            </div>
          )}

          {stats.recentLeads.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: '#3d2f60', textTransform: 'uppercase', marginBottom: 12 }}>
                Chat Leads
              </div>
              {stats.recentLeads.map((l: Record<string, unknown>) => (
                <div
                  key={String(l._id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(124,58,237,.08)',
                  }}
                >
                  <div style={{ fontSize: 13, color: '#e2d9f3' }}>{String(l.email || l.name || 'Lead')}</div>
                  <div style={{ fontSize: 11, color: '#3d2f60' }}>{timeAgo(l.createdAt as string)}</div>
                </div>
              ))}
            </div>
          )}

          {stats.recentClients.length === 0 &&
            stats.recentPayments.length === 0 &&
            stats.recentLeads.length === 0 && (
              <p style={{ color: '#3d2f60', fontSize: 14 }}>No recent activity yet.</p>
            )}
        </div>

        {/* Quick Actions */}
        <div
          style={{
            background: 'rgba(255,255,255,.04)',
            border: '1px solid rgba(124,58,237,.18)',
            borderRadius: 16,
            padding: 24,
            alignSelf: 'start',
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2d9f3', marginBottom: 20 }}>
            Quick Actions
          </h2>
          {[
            { label: '+ New Project', href: '/admin/projects/new' },
            { label: '+ New Invoice', href: '/admin/invoices/new' },
            { label: '+ New Blog Post', href: '/admin/blog/new' },
            { label: 'View Chat Leads', href: '/admin/leads' },
            { label: 'View Subscribers', href: '/admin/subscribers' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              style={{
                display: 'block',
                padding: '12px 16px',
                borderRadius: 10,
                background: 'rgba(124,58,237,.08)',
                border: '1px solid rgba(124,58,237,.15)',
                color: '#a855f7',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                marginBottom: 10,
                transition: 'all .2s',
              }}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
