import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) redirect('/sign-in')

  const userId = user.id

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  // Get projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  const firstName =
    profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'there'

  const activeProjects = projects?.filter((p) => p.status !== 'completed').length || 0
  const pendingInvoices = invoices?.filter((i) => i.status === 'pending' || i.status === 'overdue').length || 0
  const totalSpent = invoices?.filter((i) => i.status === 'paid').reduce((sum, i) => sum + (i.amount || 0), 0) || 0

  return (
    <>
      {/* Welcome Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontSize: 'clamp(22px, 4vw, 28px)',
          fontWeight: 900,
          color: 'var(--cmd-heading)',
          margin: '0 0 4px',
        }}>
          Welcome back, {firstName}! 💜
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'var(--cmd-body)',
          margin: 0,
        }}>
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '24px',
        flexWrap: 'wrap',
      }}>
        <Link href="/dashboard/services">
          <button style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
          }}>
            🚀 Browse Services
          </button>
        </Link>
        <Link href="/dashboard/projects">
          <button style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: '1px solid rgba(124,58,237,0.3)',
            background: 'rgba(124,58,237,0.08)',
            color: '#a855f7',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}>
            📦 View Projects
          </button>
        </Link>
        <Link href="/dashboard/connect-meta">
          <button style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: '1px solid rgba(34,211,238,0.3)',
            background: 'rgba(34,211,238,0.08)',
            color: '#22d3ee',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}>
            📊 Connect Meta
          </button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '14px',
        marginBottom: '28px',
      }}>
        {[
          { title: 'Active Projects', value: activeProjects, icon: '📦', color: '#7c3aed', href: '/dashboard/projects' },
          { title: 'Pending Invoices', value: pendingInvoices, icon: '🧾', color: '#f59e0b', href: '/dashboard/invoices' },
          { title: 'Completed', value: projects?.filter((p) => p.status === 'completed').length || 0, icon: '✅', color: '#10b981', href: '/dashboard/projects' },
          { title: 'Total Spent', value: `₦${(totalSpent / 1000).toFixed(0)}K`, icon: '💰', color: '#3b82f6', href: '/dashboard/invoices' },
        ].map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="cmd-stat-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              textDecoration: 'none',
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: `${stat.color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0,
            }}>
              {stat.icon}
            </div>
            <p style={{
              fontSize: '24px',
              fontWeight: 900,
              color: stat.color,
              margin: '0 0 1px',
              lineHeight: 1,
            }}>
              {stat.value}
            </p>
            <p style={{
              fontSize: '11px',
              color: 'var(--cmd-body)',
              margin: 0,
            }}>
              {stat.title}
            </p>
          </Link>
        ))}
      </div>

      {/* Projects Section */}
      <div style={{
        background: 'var(--cmd-card)',
        border: '1px solid rgba(124,58,237,0.15)',
        borderRadius: '16px',
        marginBottom: '24px',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(124,58,237,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 800,
            color: 'var(--cmd-heading)',
            margin: 0,
          }}>
            Your Projects
          </h3>
          <Link href="/dashboard/projects" style={{
            fontSize: '13px',
            color: '#a855f7',
            fontWeight: 600,
            textDecoration: 'none',
          }}>
            View All →
          </Link>
        </div>

        <div style={{ padding: '20px' }}>
          {!projects?.length ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
            }}>
              <p style={{ fontSize: '48px', margin: '0 0 12px' }}>📦</p>
              <p style={{
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--cmd-heading)',
                margin: '0 0 6px',
              }}>
                No projects yet
              </p>
              <p style={{
                fontSize: '13px',
                color: 'var(--cmd-body)',
                margin: '0 0 20px',
              }}>
                Browse our services to get started
              </p>
              <Link href="/services">
                <button style={{
                  padding: '10px 24px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}>
                  Browse Services →
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {projects.map((project: any) => (
                <div
                  key={project.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: 'rgba(124,58,237,0.04)',
                    border: '1px solid rgba(124,58,237,0.1)',
                    borderRadius: '12px',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <p style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: 'var(--cmd-heading)',
                      margin: '0 0 6px',
                    }}>
                      {project.title}
                    </p>
                    <span style={{
                      display: 'inline-flex',
                      padding: '3px 10px',
                      borderRadius: '100px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: project.status === 'completed' ? 'rgba(16,185,129,0.1)' :
                                 project.status === 'in_progress' ? 'rgba(59,130,246,0.1)' :
                                 'rgba(245,158,11,0.1)',
                      color: project.status === 'completed' ? '#10b981' :
                             project.status === 'in_progress' ? '#3b82f6' : '#f59e0b',
                      border: `1px solid ${
                        project.status === 'completed' ? 'rgba(16,185,129,0.25)' :
                        project.status === 'in_progress' ? 'rgba(59,130,246,0.25)' :
                        'rgba(245,158,11,0.25)'
                      }`,
                    }}>
                      {project.status?.replace('_', ' ') || 'Pending'}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontSize: '12px',
                      color: '#a855f7',
                      fontWeight: 700,
                      margin: '0 0 6px',
                    }}>
                      {project.progress || 0}%
                    </p>
                    <div style={{
                      width: '100px',
                      height: '6px',
                      background: 'rgba(124,58,237,0.15)',
                      borderRadius: '100px',
                      overflow: 'hidden',
                    }}>
                      <div
                        style={{
                          height: '100%',
                          background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
                          borderRadius: '100px',
                          width: `${project.progress || 0}%`,
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Music Promo Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(168,85,247,0.15))',
        border: '1px solid rgba(124,58,237,0.3)',
        borderRadius: '16px',
        padding: 'clamp(20px, 4vw, 32px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        flexWrap: 'wrap',
      }}>
        <div>
          <h4 style={{
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--cmd-heading)',
            margin: '0 0 6px',
          }}>
            🎵 Promote Your Music
          </h4>
          <p style={{
            fontSize: '13px',
            color: 'var(--cmd-body)',
            margin: 0,
          }}>
            Get your tracks on 150+ platforms worldwide
          </p>
        </div>
        <Link href="/services/music-distribution">
          <button style={{
            padding: '12px 24px',
            borderRadius: '10px',
            border: 'none',
            background: '#fff',
            color: '#7c3aed',
            fontSize: '14px',
            fontWeight: 800,
            cursor: 'pointer',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}>
            Get Started →
          </button>
        </Link>
      </div>
    </>
  )
}