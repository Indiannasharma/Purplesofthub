import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import Link from 'next/link'

export default async function ClientProjectsPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) redirect('/sign-in')

  const { data: projects } = await supabase
    .from('projects')
    .select(
      `
      *,
      tasks(count),
      project_updates(
        id,
        message,
        created_at
      )
    `
    )
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  const active =
    projects?.filter(p => p.status !== 'completed' && p.status !== 'cancelled').length || 0
  const completed = projects?.filter(p => p.status === 'completed').length || 0

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 900,
          color: 'var(--cmd-heading)',
          margin: '0 0 4px',
        }}>
          My Projects
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'var(--cmd-body)',
          margin: 0,
        }}>
          {active} active · {completed} completed
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '14px',
        marginBottom: '28px',
      }}>
        {[
          { label: 'Total', value: projects?.length || 0, icon: '📦', color: '#7c3aed' },
          { label: 'Active', value: active, icon: '⚡', color: '#a855f7' },
          { label: 'Completed', value: completed, icon: '✅', color: '#10b981' },
          { label: 'On Hold', value: projects?.filter(p => p.status === 'on_hold').length || 0, icon: '⏸️', color: '#f59e0b' },
        ].map(stat => (
          <div
            key={stat.label}
            className="cmd-stat-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
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
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Projects List */}
      {!projects?.length ? (
        <div style={{
          background: 'var(--cmd-card)',
          border: '1px solid rgba(124,58,237,0.15)',
          borderRadius: '20px',
          padding: '60px 24px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '48px', margin: '0 0 16px' }}>📦</p>
          <p style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--cmd-heading)',
            margin: '0 0 8px',
          }}>
            No projects yet
          </p>
          <p style={{
            fontSize: '13px',
            color: 'var(--cmd-body)',
            margin: '0 0 24px',
          }}>
            Order a service to get started
          </p>
          <Link href="/dashboard/services">
            <button style={{
              padding: '12px 24px',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {projects.map((project: any) => {
            const statusColors: Record<string, { bg: string; color: string; border: string }> = {
              pending: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
              in_progress: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'rgba(59,130,246,0.25)' },
              completed: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'rgba(16,185,129,0.25)' },
              cancelled: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'rgba(239,68,68,0.25)' },
              on_hold: { bg: 'rgba(156,163,175,0.1)', color: '#9ca3af', border: 'rgba(156,163,175,0.25)' },
            }
            const statusStyle = statusColors[project.status] || statusColors.pending

            return (
              <div
                key={project.id}
                style={{
                  background: 'var(--cmd-card)',
                  border: '1px solid rgba(124,58,237,0.15)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                }}
              >
                {/* Gradient top border */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, #7c3aed, #a855f7, #22d3ee)',
                }} />

                {/* Project header */}
                <div style={{ padding: '20px 24px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <h3 style={{
                        fontSize: '17px',
                        fontWeight: 800,
                        color: 'var(--cmd-heading)',
                        margin: '0 0 6px',
                      }}>
                        {project.title}
                      </h3>
                      {project.description && (
                        <p style={{
                          fontSize: '13px',
                          color: 'var(--cmd-body)',
                          margin: 0,
                          lineHeight: 1.5,
                        }}>
                          {project.description}
                        </p>
                      )}
                    </div>

                    <span style={{
                      display: 'inline-flex',
                      padding: '4px 12px',
                      borderRadius: '100px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: statusStyle.bg,
                      color: statusStyle.color,
                      border: `1px solid ${statusStyle.border}`,
                      textTransform: 'capitalize',
                      whiteSpace: 'nowrap',
                    }}>
                      {project.status?.replace('_', ' ') || 'Pending'}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginTop: '16px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: 'var(--cmd-muted)',
                      marginBottom: '6px',
                    }}>
                      <span>Progress</span>
                      <span style={{ fontWeight: 700, color: '#a855f7' }}>
                        {project.progress || 0}%
                      </span>
                    </div>
                    <div style={{
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
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Meta info */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '16px',
                    marginTop: '16px',
                    fontSize: '12px',
                    color: 'var(--cmd-muted)',
                  }}>
                    {project.due_date && (
                      <span>📅 Due: {format(new Date(project.due_date), 'MMM d, yyyy')}</span>
                    )}
                    {project.budget && (
                      <span>💰 Budget: ₦{Number(project.budget).toLocaleString()}</span>
                    )}
                    {project.tasks?.[0]?.count > 0 && (
                      <span>✅ Tasks: {project.tasks[0].count}</span>
                    )}
                  </div>
                </div>

                {/* Latest update */}
                {project.project_updates?.length > 0 && (
                  <div style={{
                    margin: '0 20px 20px',
                    padding: '14px 16px',
                    background: 'rgba(124,58,237,0.06)',
                    border: '1px solid rgba(124,58,237,0.15)',
                    borderRadius: '10px',
                  }}>
                    <p style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#a855f7',
                      margin: '0 0 6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Latest Update
                    </p>
                    <p style={{
                      fontSize: '13px',
                      color: 'var(--cmd-heading)',
                      margin: '0 0 4px',
                      lineHeight: 1.5,
                    }}>
                      {project.project_updates[0].message}
                    </p>
                    <p style={{
                      fontSize: '11px',
                      color: 'var(--cmd-muted)',
                      margin: 0,
                    }}>
                      {format(new Date(project.project_updates[0].created_at), 'MMM d, yyyy — h:mm a')}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}