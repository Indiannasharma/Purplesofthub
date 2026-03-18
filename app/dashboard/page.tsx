export const dynamic = 'force-dynamic'

import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import Project from '@/lib/models/Project'
import Invoice from '@/lib/models/Invoice'
import Link from 'next/link'

const STATUS_COLORS: Record<string, string> = {
  planning:    'bg-blue-500/20 text-blue-400',
  design:      'bg-yellow-500/20 text-yellow-400',
  development: 'bg-brand-500/20 text-brand-400',
  review:      'bg-orange-500/20 text-orange-400',
  completed:   'bg-green-500/20 text-green-400',
  'on-hold':   'bg-gray-500/20 text-gray-400',
}

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  await connectDB()
  const clerkUser = await currentUser()
  const user = await User.findOne({ clerkId: userId }).lean() as Record<string, unknown> | null

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-5xl">⚙️</div>
          <p className="mb-2 text-sm font-medium text-white">Setting up your account…</p>
          <p className="mb-4 text-xs text-gray-400">This only takes a moment.</p>
          <Link href="/" className="text-sm text-brand-400 hover:underline">← Back to site</Link>
        </div>
      </div>
    )
  }

  const [projects, invoices] = await Promise.all([
    Project.find({ client: user._id }).sort({ updatedAt: -1 }).limit(6).lean() as Promise<Array<Record<string, unknown>>>,
    Invoice.find({ client: user._id }).sort({ createdAt: -1 }).limit(5).lean() as Promise<Array<Record<string, unknown>>>,
  ])

  const firstName = clerkUser?.firstName || String(user.firstName || 'there')
  const activeProjects = projects.filter((p) => p.status !== 'completed').length
  const completedProjects = projects.filter((p) => p.status === 'completed').length
  const pendingInvoices = invoices.filter((i) => i.status === 'sent' || i.status === 'overdue').length

  return (
    <>
      {/* Welcome */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Hey {firstName}! 💜</h2>
        <p className="text-sm text-gray-400 mt-0.5">Here's what's happening with your projects today.</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { icon: '📦', label: 'Active Projects',   value: activeProjects,   href: '/dashboard/projects' },
          { icon: '🧾', label: 'Pending Invoices',  value: pendingInvoices,  href: '/dashboard/invoices' },
          { icon: '✅', label: 'Completed Projects', value: completedProjects, href: '/dashboard/projects' },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900 p-5 hover:border-brand-500/50 transition-all"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-2xl">
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Projects */}
      <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
          <h5 className="text-sm font-semibold text-white">Your Projects</h5>
          <Link href="/dashboard/projects" className="text-xs text-brand-400 hover:underline">View All →</Link>
        </div>

        {projects.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mb-4 text-5xl">📦</div>
            <p className="mb-1 text-sm font-semibold text-white">No projects yet</p>
            <p className="mb-4 text-xs text-gray-400">Browse our services and start your first project</p>
            <Link
              href="/dashboard/services"
              className="inline-flex items-center rounded-full bg-brand-500 px-5 py-2 text-xs font-semibold text-white hover:bg-brand-600 transition-all"
            >
              Browse Services →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {projects.map((project) => (
              <div key={String(project._id)} className="flex items-center justify-between px-6 py-4 hover:bg-gray-800/40 transition-all">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{String(project.title)}</p>
                  <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[String(project.status)] || 'bg-gray-500/20 text-gray-400'}`}>
                    {String(project.status)}
                  </span>
                </div>
                <div className="ml-4 w-28 shrink-0">
                  <div className="mb-1 flex justify-between text-xs text-gray-400">
                    <span>Progress</span>
                    <span>{Number(project.progress ?? 0)}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all"
                      style={{ width: `${Number(project.progress ?? 0)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Music promo banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brand-500/30 bg-gradient-to-r from-brand-900/40 to-brand-500/10 p-6">
        <div>
          <h5 className="text-sm font-bold text-white mb-1">🎵 Promote Your Music</h5>
          <p className="text-xs text-gray-400">Get your tracks on 150+ platforms and build your fanbase worldwide.</p>
        </div>
        <Link
          href="/dashboard/music"
          className="shrink-0 rounded-full bg-gradient-to-r from-brand-700 to-brand-500 px-5 py-2 text-xs font-bold text-white hover:opacity-90 transition-all"
        >
          Get Started →
        </Link>
      </div>
    </>
  )
}
