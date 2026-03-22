import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Admin Dashboard | PurpleSoftHub',
  description: 'PurpleSoftHub Admin Dashboard',
}

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) redirect('/sign-in')

  // Fetch real stats from Supabase
  const [
    { count: totalClients },
    { count: activeProjects },
    { count: pendingInvoices },
    { count: newLeads },
    { count: totalSubscribers },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'client'),
    supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .not('status', 'eq', 'completed'),
    supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'overdue']),
    supabase
      .from('chat_leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true }),
  ])

  // Fetch recent clients
  const { data: recentClients } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'client')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black dark:text-white">Admin Dashboard</h2>
        <p className="text-sm text-bodydark2 mt-1">Welcome back Emmanuel 💜</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
        {[
          {
            title: 'Total Clients',
            value: totalClients || 0,
            icon: '👥',
            color: 'bg-brand-500/10',
          },
          {
            title: 'Active Projects',
            value: activeProjects || 0,
            icon: '📦',
            color: 'bg-brand-500/10',
          },
          {
            title: 'Pending Invoices',
            value: pendingInvoices || 0,
            icon: '🧾',
            color: 'bg-yellow-500/10',
          },
          {
            title: 'Chat Leads (7d)',
            value: newLeads || 0,
            icon: '💬',
            color: 'bg-green-500/10',
          },
        ].map((stat) => (
          <div
            key={stat.title}
            className="rounded-xl border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark"
          >
            <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center text-2xl mb-4`}>
              {stat.icon}
            </div>
            <h4 className="text-3xl font-bold text-black dark:text-white mb-1">{stat.value}</h4>
            <p className="text-sm text-bodydark2">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-8">
        <div className="rounded-xl border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <h5 className="font-semibold text-black dark:text-white mb-1">📧 Newsletter Subscribers</h5>
          <p className="text-4xl font-bold text-brand-500">{totalSubscribers || 0}</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <h5 className="font-semibold text-black dark:text-white mb-1">🚀 Quick Actions</h5>
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              ['+New Project', '/admin/projects/new'],
              ['+New Invoice', '/admin/invoices/new'],
              ['+Blog Post', '/admin/blog/new'],
              ['View Leads', '/admin/leads'],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="text-xs font-medium border border-brand-500 text-brand-500 rounded-full px-3 py-1.5 hover:bg-brand-500 hover:text-white transition-all"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Recent clients */}
      <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div className="px-6 py-4 border-b border-stroke dark:border-strokedark flex justify-between items-center">
          <h5 className="font-semibold text-black dark:text-white">Recent Clients</h5>
          <a href="/admin/clients" className="text-sm text-brand-500 hover:underline">
            View All →
          </a>
        </div>
        <div className="p-6">
          {!recentClients?.length ? (
            <p className="text-sm text-bodydark2 text-center py-4">No clients yet</p>
          ) : (
            <div className="space-y-3">
              {recentClients.map((client: any) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between py-2 border-b border-stroke dark:border-strokedark last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">
                      {(client.full_name?.[0] || client.email?.[0])?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black dark:text-white">{client.full_name || 'No name'}</p>
                      <p className="text-xs text-bodydark2">{client.email}</p>
                    </div>
                  </div>
                  <span className="text-xs text-bodydark2">
                    {new Date(client.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
