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

  const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    in_progress: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    on_hold: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black dark:text-white">My Projects</h2>
        <p className="text-sm text-bodydark2 mt-1">
          {active} active · {completed} completed
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: projects?.length || 0, icon: '📦', color: 'text-brand-500' },
          { label: 'Active', value: active, icon: '⚡', color: 'text-purple-500' },
          { label: 'Completed', value: completed, icon: '✅', color: 'text-green-500' },
          {
            label: 'On Hold',
            value: projects?.filter(p => p.status === 'on_hold').length || 0,
            icon: '⏸️',
            color: 'text-yellow-500'
          }
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark"
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <p className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
            <p className="text-xs text-bodydark2">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Projects list */}
      {!projects?.length ? (
        <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark p-12 text-center">
          <p className="text-5xl mb-4">📦</p>
          <p className="font-semibold text-black dark:text-white mb-2">No projects yet</p>
          <p className="text-sm text-bodydark2 mb-6">Order a service to get started</p>
          <Link
            href="/dashboard/services"
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-all"
          >
            Browse Services →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project: any) => (
            <div
              key={project.id}
              className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden"
            >
              {/* Project header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-black dark:text-white text-lg mb-1">{project.title}</h5>
                    {project.description && (
                      <p className="text-sm text-bodydark2 line-clamp-2">{project.description}</p>
                    )}
                  </div>
                  <span
                    className={`text-xs px-3 py-1.5 rounded-full font-medium flex-shrink-0 ${
                      STATUS_STYLES[project.status] || STATUS_STYLES.pending
                    }`}
                  >
                    {project.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-bodydark2 mb-1.5">
                    <span>Progress</span>
                    <span className="font-semibold text-brand-500">{project.progress || 0}%</span>
                  </div>
                  <div className="h-2 w-full bg-stroke dark:bg-strokedark rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap gap-4 mt-4 text-xs text-bodydark2">
                  {project.due_date && (
                    <span className="flex items-center gap-1">
                      📅 Due: {format(new Date(project.due_date), 'MMM d, yyyy')}
                    </span>
                  )}
                  {project.budget && (
                    <span className="flex items-center gap-1">
                      💰 Budget: ₦{Number(project.budget).toLocaleString()}
                    </span>
                  )}
                  {project.tasks?.[0]?.count > 0 && (
                    <span className="flex items-center gap-1">
                      ✅ Tasks: {project.tasks[0].count}
                    </span>
                  )}
                </div>
              </div>

              {/* Latest update */}
              {project.project_updates?.length > 0 && (
                <div className="mx-6 mb-6 rounded-lg bg-brand-500/5 border border-brand-500/20 p-4">
                  <p className="text-xs font-semibold text-brand-500 mb-1">Latest Update</p>
                  <p className="text-sm text-black dark:text-white">{project.project_updates[0].message}</p>
                  <p className="text-xs text-bodydark2 mt-1">
                    {format(new Date(project.project_updates[0].created_at), 'MMM d, yyyy — h:mm a')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
