export const dynamic = 'force-dynamic'

import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import Project from '@/lib/models/Project'
import Invoice from '@/lib/models/Invoice'
import ChatLead from '@/lib/models/ChatLead'
import Subscriber from '@/lib/models/Subscriber'
import Link from 'next/link'

async function getAdminStats() {
  await connectDB()
  const [totalClients, activeProjects, pendingInvoices, newLeads, totalSubscribers, recentClients] =
    await Promise.all([
      User.countDocuments({ role: 'client' }),
      Project.countDocuments({ status: { $nin: ['completed', 'cancelled'] } }),
      Invoice.countDocuments({ status: { $in: ['sent', 'overdue'] } }),
      ChatLead.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      Subscriber.countDocuments({ status: 'active' }),
      User.find({ role: 'client' }).sort({ createdAt: -1 }).limit(5).lean(),
    ])
  return { totalClients, activeProjects, pendingInvoices, newLeads, totalSubscribers, recentClients }
}

const statCards = [
  { key: 'totalClients',     icon: '👥', label: 'Total Clients',     href: '/admin/clients' },
  { key: 'activeProjects',   icon: '📦', label: 'Active Projects',   href: '/admin/projects' },
  { key: 'pendingInvoices',  icon: '🧾', label: 'Pending Invoices',  href: '/admin/invoices' },
  { key: 'newLeads',         icon: '💬', label: 'Leads (7 days)',    href: '/admin/leads' },
  { key: 'totalSubscribers', icon: '📧', label: 'Subscribers',       href: '/admin/subscribers' },
]

const quickActions = [
  { label: '+ New Project',   href: '/admin/projects/new' },
  { label: '+ New Invoice',   href: '/admin/invoices/new' },
  { label: '+ New Blog Post', href: '/admin/blog/new' },
  { label: 'Chat Leads',      href: '/admin/leads' },
  { label: 'Subscribers',     href: '/admin/subscribers' },
  { label: 'All Clients',     href: '/admin/clients' },
]

export default async function AdminDashboard() {
  const stats = await getAdminStats()

  return (
    <>
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
          <p className="text-sm text-gray-400 mt-0.5">Welcome back, Emmanuel 💜</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-all"
        >
          + New Project
        </Link>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map(({ key, icon, label, href }) => (
          <Link
            key={key}
            href={href}
            className="group flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900 p-5 hover:border-brand-500/50 transition-all"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-2xl">
              {icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{(stats as Record<string, unknown>)[key] as number}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900 p-5">
        <h5 className="mb-4 text-sm font-semibold text-white">Quick Actions</h5>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="rounded-full border border-brand-500/50 px-4 py-1.5 text-xs font-medium text-brand-400 hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-all"
            >
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent clients */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
          <h5 className="text-sm font-semibold text-white">Recent Clients</h5>
          <Link href="/admin/clients" className="text-xs text-brand-400 hover:underline">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {(stats.recentClients as Array<Record<string, unknown>>).map((client) => (
                <tr key={String(client._id)} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="px-6 py-4 font-medium text-white">
                    {String(client.firstName || '')} {String(client.lastName || '')}
                  </td>
                  <td className="px-6 py-4 text-gray-400">{String(client.email || '')}</td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(String(client.createdAt)).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/clients/${String(client._id)}`}
                      className="text-xs text-brand-400 hover:underline"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
              {stats.recentClients.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500 text-sm">
                    No clients yet. Share your site to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
