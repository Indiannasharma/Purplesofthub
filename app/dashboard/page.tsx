import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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

  return (
    <>
      {/* Welcome */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black dark:text-white">Hey {firstName}! 💜</h2>
        <p className="text-sm text-bodydark2 mt-1">Here is what is happening with your projects today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
        {[
          {
            title: 'Active Projects',
            value: activeProjects,
            icon: '📦',
            href: '/dashboard/projects',
          },
          {
            title: 'Pending Invoices',
            value: pendingInvoices,
            icon: '🧾',
            href: '/dashboard/invoices',
          },
          {
            title: 'Completed',
            value: projects?.filter((p) => p.status === 'completed').length || 0,
            icon: '✅',
            href: '/dashboard/projects',
          },
        ].map((stat) => (
          <a
            key={stat.title}
            href={stat.href}
            className="rounded-xl border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark hover:border-brand-500 transition-all block"
          >
            <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center text-2xl mb-4">
              {stat.icon}
            </div>
            <h4 className="text-3xl font-bold text-black dark:text-white mb-1">{stat.value}</h4>
            <p className="text-sm text-bodydark2">{stat.title}</p>
          </a>
        ))}
      </div>

      {/* Projects */}
      <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark mb-6">
        <div className="px-6 py-4 border-b border-stroke dark:border-strokedark flex justify-between items-center">
          <h5 className="font-semibold text-black dark:text-white">Your Projects</h5>
          <a href="/dashboard/projects" className="text-sm text-brand-500 hover:underline">
            View All →
          </a>
        </div>
        <div className="p-6">
          {!projects?.length ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">📦</p>
              <p className="font-medium text-black dark:text-white mb-2">No projects yet</p>
              <p className="text-sm text-bodydark2 mb-4">Browse our services to get started</p>
              <a
                href="/services"
                className="inline-flex items-center rounded-full bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-all"
              >
                Browse Services →
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project: any) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-stroke dark:border-strokedark hover:border-brand-500 transition-all"
                >
                  <div>
                    <p className="font-medium text-black dark:text-white">{project.title}</p>
                    <span
                      className={`
                      inline-flex mt-1
                      rounded-full px-2.5 py-0.5 text-xs font-medium
                      ${
                        project.status === 'completed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : project.status === 'in_progress'
                            ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                    >
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-brand-500 mb-1">{project.progress || 0}%</p>
                    <div className="w-24 h-1.5 bg-stroke dark:bg-strokedark rounded-full">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${project.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Music promo banner */}
      <div className="rounded-xl bg-gradient-to-r from-purple-900 to-brand-600 p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h5 className="font-bold text-white mb-1">🎵 Promote Your Music</h5>
          <p className="text-sm text-purple-200">Get your tracks on 150+ platforms worldwide</p>
        </div>
        <a
          href="/services/music-distribution"
          className="rounded-full bg-white px-5 py-2 text-sm font-bold text-brand-600 hover:bg-purple-50 transition-all whitespace-nowrap"
        >
          Get Started →
        </a>
      </div>
    </>
  )
}
