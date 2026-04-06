'use client'

import { format } from 'date-fns'
import dynamic from 'next/dynamic'

// TODO: Restore chart components from git
// const RevenueChart = dynamic(
//   () => import('@/components/charts/RevenueChart'),
//   { ssr: false }
// )

// const ProjectsDonut = dynamic(
//   () => import('@/components/charts/ProjectsDonut'),
//   { ssr: false }
// )

// const ClientGrowthChart = dynamic(
//   () => import('@/components/charts/ClientGrowthChart'),
//   { ssr: false }
// )

// const InvoiceStatsChart = dynamic(
//   () => import('@/components/charts/InvoiceStatsChart'),
//   { ssr: false }
// )

// const ClientWorldMap = dynamic(
//   () => import('@/components/Maps/ClientWorldMap'),
//   { ssr: false }
// )

interface AdminContentProps {
  totalClients: number
  activeProjects: number
  totalRevenue: number
  pendingInvoices: number
  newLeads: number
  subscribers: number
  totalProjects: number
  revenueData: { month: string; revenue: number }[]
  projectsDonutData: { status: string; count: number }[]
  clientGrowthData: { month: string; count: number }[]
  invoiceStatsData: { month: string; paid: number; pending: number; overdue: number }[]
  mapData: Record<string, number>
  recentClients: any[]
  recentProjects: any[]
}

export default function AdminContent({
  totalClients,
  activeProjects,
  totalRevenue,
  pendingInvoices,
  newLeads,
  subscribers,
  totalProjects,
  revenueData,
  projectsDonutData,
  clientGrowthData,
  invoiceStatsData,
  mapData,
  recentClients,
  recentProjects,
}: AdminContentProps) {
  return (
    <>
      {/* Page header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-black dark:text-white">Admin Dashboard</h2>
        <p className="text-sm text-bodydark2 mt-1">
          Welcome back Emmanuel 💜 — {format(new Date(), 'EEEE, MMMM d yyyy')}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6 mb-8">
        {[
          { label: 'Total Clients', value: totalClients || 0, icon: '👥', color: 'text-brand-500', bg: 'bg-brand-500/10' },
          { label: 'Active Projects', value: activeProjects || 0, icon: '📦', color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Total Revenue', value: `₦${(totalRevenue/1000).toFixed(0)}k`, icon: '💰', color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Pending Invoices', value: pendingInvoices || 0, icon: '🧾', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'Chat Leads', value: newLeads || 0, icon: '💬', color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Subscribers', value: subscribers || 0, icon: '📧', color: 'text-pink-400', bg: 'bg-pink-500/10' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
            <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center text-xl mb-3`}>
              {stat.icon}
            </div>
            <p className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
            <p className="text-xs text-bodydark2">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
        <div className="lg:col-span-2 rounded-xl border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h5 className="font-semibold text-black dark:text-white">Revenue Overview</h5>
              <p className="text-sm text-bodydark2 mt-1">Last 6 months</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-brand-500">₦{totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-bodydark2">Total revenue</p>
            </div>
          </div>
          <div className="h-[300px] bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-gray-600 dark:text-gray-400">
            {/* TODO: Restore RevenueChart component from git */}
            Revenue Chart placeholder
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <h5 className="font-semibold text-black dark:text-white mb-1">Projects by Status</h5>
          <p className="text-sm text-bodydark2 mb-4">{totalProjects || 0} total</p>
          {projectsDonutData.length > 0 ? (
            <div className="h-[280px] bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-gray-600 dark:text-gray-400">
              {/* TODO: Restore ProjectsDonut component from git */}
              Projects Chart placeholder
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-bodydark2 text-sm">No projects yet</div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
        <div className="rounded-xl border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <h5 className="font-semibold text-black dark:text-white mb-1">Client Growth</h5>
          <p className="text-sm text-bodydark2 mb-4">New clients per month</p>
          <div className="h-[300px] bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-gray-600 dark:text-gray-400">
            {/* TODO: Restore ClientGrowthChart component from git */}
            Client Growth Chart placeholder
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <h5 className="font-semibold text-black dark:text-white mb-1">Invoice Statistics</h5>
          <p className="text-sm text-bodydark2 mb-4">Paid vs Pending vs Overdue</p>
          <div className="h-[300px] bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-gray-600 dark:text-gray-400">
            {/* TODO: Restore InvoiceStatsChart component from git */}
            Invoice Stats Chart placeholder
          </div>
        </div>
      </div>

      {/* World Map */}
      <div className="rounded-xl border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h5 className="font-semibold text-black dark:text-white">Clients Worldwide</h5>
            <p className="text-sm text-bodydark2 mt-1">Geographic distribution</p>
          </div>
          <div className="flex gap-4 text-xs text-bodydark2">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-brand-500 inline-block" />
              High
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-brand-800 inline-block" />
              Low
            </span>
          </div>
        </div>
        <div className="h-[400px] bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-gray-600 dark:text-gray-400">
          {/* TODO: Restore ClientWorldMap component from git */}
          World Map placeholder
        </div>
      </div>

      {/* Recent Tables Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Clients */}
        <div className="rounded-xl border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-semibold text-black dark:text-white">Recent Clients</h5>
            <a href="/admin/clients" className="text-sm text-brand-500 hover:underline">View All →</a>
          </div>
          {!recentClients?.length ? (
            <p className="text-sm text-bodydark2 text-center py-6">No clients yet</p>
          ) : (
            <div className="space-y-3">
              {recentClients.map((client: any) => (
                <div key={client.id} className="flex items-center justify-between py-3 border-b border-stroke/50 dark:border-strokedark/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {(client.full_name || client.email || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black dark:text-white leading-tight">{client.full_name || 'No name'}</p>
                      <p className="text-xs text-bodydark2">{client.email}</p>
                    </div>
                  </div>
                  <span className="text-xs text-bodydark2 flex-shrink-0">{format(new Date(client.created_at), 'MMM d')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Projects */}
        <div className="rounded-xl border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-semibold text-black dark:text-white">Recent Projects</h5>
            <a href="/admin/projects" className="text-sm text-brand-500 hover:underline">View All →</a>
          </div>
          {!recentProjects?.length ? (
            <p className="text-sm text-bodydark2 text-center py-6">No projects yet</p>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((project: any) => (
                <div key={project.id} className="flex items-center justify-between py-3 border-b border-stroke/50 dark:border-strokedark/50 last:border-0">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm font-medium text-black dark:text-white truncate">{project.title}</p>
                    <p className="text-xs text-bodydark2">{(project.profiles as any)?.full_name || 'Unknown client'}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-brand-500 mb-1">{project.progress || 0}%</p>
                      <div className="w-16 h-1.5 bg-stroke dark:bg-strokedark rounded-full">
                        <div className="h-full bg-brand-500 rounded-full" style={{ width: `${project.progress || 0}%` }} />
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      project.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      project.status === 'in_progress' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400' :
                      project.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 rounded-xl border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
        <h5 className="font-semibold text-black dark:text-white mb-4">Quick Actions</h5>
        <div className="flex flex-wrap gap-3">
          {[
            { label: '+ New Project', href: '/admin/projects/new', color: 'bg-brand-500 text-white hover:bg-brand-600' },
            { label: '+ New Invoice', href: '/admin/invoices/new', color: 'bg-green-500 text-white hover:bg-green-600' },
            { label: '+ New Blog Post', href: '/admin/blog/new', color: 'bg-purple-500 text-white hover:bg-purple-600' },
            { label: 'View Chat Leads', href: '/admin/leads', color: 'border border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white' },
            { label: 'All Clients', href: '/admin/clients', color: 'border border-stroke dark:border-strokedark text-bodydark2 hover:border-brand-500 hover:text-brand-500' },
            { label: 'Music Promos', href: '/admin/music', color: 'border border-stroke dark:border-strokedark text-bodydark2 hover:border-brand-500 hover:text-brand-500' },
          ].map(action => (
            <a
              key={action.label}
              href={action.href}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${action.color}`}
            >
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </>
  )
}
