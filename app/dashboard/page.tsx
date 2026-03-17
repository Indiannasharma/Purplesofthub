export const dynamic = 'force-dynamic'

import { getCached } from '@/lib/cache'
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import Project from '@/lib/models/Project'
import Invoice from '@/lib/models/Invoice'
import File from '@/lib/models/File'
import Link from 'next/link'

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  planning: { bg: 'rgba(59,130,246,.15)', color: '#60a5fa' },
  design: { bg: 'rgba(234,179,8,.15)', color: '#facc15' },
  development: { bg: 'rgba(124,58,237,.15)', color: '#a855f7' },
  review: { bg: 'rgba(249,115,22,.15)', color: '#fb923c' },
  completed: { bg: 'rgba(34,197,94,.15)', color: '#4ade80' },
  'on-hold': { bg: 'rgba(107,114,128,.15)', color: '#9ca3af' },
  pending: { bg: 'rgba(234,179,8,.15)', color: '#facc15' },
  paid: { bg: 'rgba(34,197,94,.15)', color: '#4ade80' },
  overdue: { bg: 'rgba(239,68,68,.15)', color: '#f87171' },
  draft: { bg: 'rgba(107,114,128,.15)', color: '#9ca3af' },
}

const PANEL_STYLE = {
  background: 'linear-gradient(135deg, rgba(14,9,30,0.95), rgba(10,7,22,0.85))',
  border: '1px solid rgba(124,58,237,0.25)',
  boxShadow: '0 18px 50px rgba(6,3,15,.55), inset 0 0 20px rgba(124,58,237,.08)',
  borderRadius: 16,
} as const

const STAT_CARD_STYLE = {
  background: 'linear-gradient(135deg, rgba(18,12,36,0.95), rgba(9,6,20,0.9))',
  border: '1px solid rgba(124,58,237,.3)',
  borderRadius: 18,
  boxShadow: '0 20px 60px rgba(6,3,15,.6), inset 0 0 24px rgba(124,58,237,.12)',
} as const

async function getClientData(clerkId: string) {
  await connectDB()

  const dbUser = await User.findOne({ clerkId }).lean()
  if (!dbUser) return null

  const userId = (dbUser as { _id: unknown })._id

  const [projects, invoices, files] = await Promise.all([
    Project.find({ client: userId })
      .select('title status progress dueDate updates service')
      .sort({ updatedAt: -1 })
      .populate('service', 'name category')
      .lean(),
    Invoice.find({ client: userId })
      .select('invoiceNumber total currency status dueDate')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    File.countDocuments({ client: userId }),
  ])

  return { projects, invoices, filesCount: files }
}

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const clerkUser = await currentUser()
  const data = await getCached(`dashboard:${userId}`, 30, () => getClientData(userId))

  const firstName = clerkUser?.firstName || 'there'
  const projects = (data?.projects ?? []) as Record<string, unknown>[]
  const invoices = (data?.invoices ?? []) as Record<string, unknown>[]
  const filesCount = data?.filesCount ?? 0

  const activeProjects = projects.filter(
    (p) => !['completed', 'on-hold'].includes(String(p.status))
  )
  const pendingInvoices = invoices.filter((i) =>
    ['sent', 'overdue'].includes(String(i.status))
  )

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 30,
            fontWeight: 900,
            marginBottom: 4,
            background: 'linear-gradient(135deg, #ffffff, #c4b5fd, #a855f7)',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Hey {firstName}! ????
        </h1>
        <p style={{ color: '#b8a9ff', fontSize: 14 }}>
          Here&apos;s what&apos;s happening with your projects today.
        </p>
        <p style={{ color: '#3d2f60', fontSize: 13, marginTop: 4 }}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Quick stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 40,
        }}
      >
        {[
          { icon: '📦', label: 'Active Projects', value: activeProjects.length, color: '#a855f7' },
          { icon: '🧾', label: 'Pending Invoices', value: pendingInvoices.length, color: '#facc15' },
          { icon: '📁', label: 'Files Shared', value: filesCount, color: '#60a5fa' },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              ...STAT_CARD_STYLE,
              padding: 24,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(124,58,237,.45), rgba(236,72,153,.25))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                marginBottom: 12,
              }}
            >
              {card.icon}
            </div>
            <div style={{ fontSize: 12, color: '#9d8fd4', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {card.label}
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, color: '#fff' }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Active Projects */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e2d9f3', marginBottom: 16 }}>
          Your Active Projects
        </h2>

        {activeProjects.length === 0 ? (
          <div
            style={{
              ...PANEL_STYLE,
              padding: 40,
              textAlign: 'center',
            }}
          >
            <p style={{ color: '#9d8fd4', marginBottom: 16 }}>No active projects yet.</p>
            <p style={{ color: '#3d2f60', fontSize: 14, marginBottom: 20 }}>
              Browse our services to get started!
            </p>
            <Link
              href="/dashboard/services"
              style={{
                display: 'inline-block',
                padding: '10px 24px',
                borderRadius: 50,
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: '#fff',
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: 14,
              }}
            >
              Browse Services →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {activeProjects.map((project) => {
              const status = String(project.status)
              const style = STATUS_STYLES[status] ?? STATUS_STYLES.planning
              const service = project.service as Record<string, unknown> | null
              const updates = project.updates as Array<{ message: string; createdAt: string }>

              return (
                <div
                  key={String(project._id)}
                  style={{
                    ...PANEL_STYLE,
                    padding: 24,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: 12,
                      flexWrap: 'wrap',
                      gap: 8,
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#e2d9f3', marginBottom: 4 }}>
                        {String(project.title)}
                      </h3>
                      {service && (
                        <span style={{ fontSize: 12, color: '#9d8fd4' }}>
                          {String(service.name || '')}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '4px 12px',
                        borderRadius: 100,
                        background: style.bg,
                        color: style.color,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontSize: 12, color: '#9d8fd4' }}>Progress</span>
                      <span style={{ fontSize: 12, color: '#a855f7', fontWeight: 600 }}>
                        {Number(project.progress)}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 100,
                        background: 'rgba(124,58,237,.15)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${Number(project.progress)}%`,
                          background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
                          borderRadius: 100,
                          transition: 'width .5s ease',
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', gap: 16 }}>
                      {!!project.dueDate && (
                        <span style={{ fontSize: 12, color: '#9d8fd4' }}>
                          Due:{' '}
                          {new Date(project.dueDate as string).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                      {updates && updates.length > 0 && (
                        <span style={{ fontSize: 12, color: '#9d8fd4' }}>
                          Last update: {updates[updates.length - 1].message?.slice(0, 40)}…
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/dashboard/projects/${String(project._id)}`}
                      style={{
                        fontSize: 13,
                        color: '#a855f7',
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Recent Invoices */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e2d9f3', marginBottom: 16 }}>
          Recent Invoices
        </h2>

        {invoices.length === 0 ? (
          <div
            style={{
              ...PANEL_STYLE,
              padding: 32,
              textAlign: 'center',
            }}
          >
            <p style={{ color: '#9d8fd4' }}>No invoices yet.</p>
          </div>
        ) : (
          <div
            style={{
              ...PANEL_STYLE,
              overflow: 'hidden',
            }}
          >
            {invoices.map((inv, i) => {
              const status = String(inv.status)
              const style = STATUS_STYLES[status] ?? STATUS_STYLES.draft
              const isUnpaid = ['sent', 'overdue'].includes(status)
              return (
                <div
                  key={String(inv._id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 24px',
                    borderBottom:
                      i < invoices.length - 1 ? '1px solid rgba(124,58,237,.08)' : 'none',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#e2d9f3' }}>
                      {String(inv.invoiceNumber)}
                    </div>
                    {!!inv.dueDate && (
                      <div style={{ fontSize: 12, color: '#9d8fd4' }}>
                        Due:{' '}
                        {new Date(inv.dueDate as string).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#e2d9f3' }}>
                      {String(inv.currency) === 'USD' ? '$' : '₦'}
                      {Number(inv.total).toLocaleString()}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '3px 10px',
                        borderRadius: 100,
                        background: style.bg,
                        color: style.color,
                      }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                    {isUnpaid && (
                      <Link
                        href={`/dashboard/invoices/${String(inv._id)}`}
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          padding: '6px 16px',
                          borderRadius: 50,
                          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                          color: '#fff',
                          textDecoration: 'none',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Pay Now
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Music Promotion Banner */}
      <section style={{ marginBottom: 40 }}>
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,.3), rgba(236,72,153,.2))',
            border: '1px solid rgba(124,58,237,.3)',
            borderRadius: 16,
            padding: '28px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#e2d9f3', marginBottom: 6 }}>
              🎵 Want to promote your music?
            </div>
            <p style={{ color: '#b8a9d9', fontSize: 14 }}>
              Get your tracks on 150+ platforms and build your fanbase worldwide.
            </p>
          </div>
          <Link
            href="/dashboard/music"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              borderRadius: 50,
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              color: '#fff',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: 14,
              whiteSpace: 'nowrap',
            }}
          >
            Start Music Promotion →
          </Link>
        </div>
      </section>

      {/* Get started CTA (only if no projects) */}
      {projects.length === 0 && (
        <section>
          <div
            style={{
              ...PANEL_STYLE,
              padding: 40,
              textAlign: 'center',
            }}
          >
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#e2d9f3', marginBottom: 10 }}>
              Ready to start your first project?
            </h2>
            <p style={{ color: '#9d8fd4', fontSize: 15, marginBottom: 24 }}>
              Browse our services and let&apos;s build something amazing together 💜
            </p>
            <Link
              href="/dashboard/services"
              style={{
                display: 'inline-block',
                padding: '12px 32px',
                borderRadius: 50,
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: '#fff',
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: 15,
              }}
            >
              Browse Services →
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
