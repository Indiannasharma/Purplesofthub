export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import Project from '@/lib/models/Project'
import Link from 'next/link'

const STATUS_COLORS: Record<string, string> = {
  planning:    'bg-blue-500/20 text-blue-400',
  design:      'bg-yellow-500/20 text-yellow-400',
  development: 'bg-brand-500/20 text-brand-400',
  review:      'bg-orange-500/20 text-orange-400',
  completed:   'bg-green-500/20 text-green-400',
  'on-hold':   'bg-gray-500/20 text-gray-400',
}

export default async function ClientProjectsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  await connectDB()
  const user = await User.findOne({ clerkId: userId }).lean() as Record<string, unknown> | null
  if (!user) redirect('/dashboard')

  const projects = await Project.find({ client: user._id })
    .sort({ updatedAt: -1 })
    .lean() as Array<Record<string, unknown>>

  const activeCount = projects.filter((p) => !['completed', 'on-hold'].includes(String(p.status))).length
  const completedCount = projects.filter((p) => p.status === 'completed').length

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">My Projects</h2>
        <p className="text-sm text-gray-400 mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: projects.length, color: 'text-white' },
          { label: 'Active', value: activeCount, color: 'text-brand-400' },
          { label: 'Completed', value: completedCount, color: 'text-green-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-800 bg-gray-900 p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-800 bg-gray-900 p-16 text-center">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-sm font-semibold text-white mb-1">No projects yet</p>
          <p className="mb-4 text-xs text-gray-400">Browse our services to start your first project</p>
          <Link href="/dashboard/services" className="rounded-full bg-brand-500 px-5 py-2 text-xs font-semibold text-white hover:bg-brand-600 transition-all">
            Browse Services →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => {
            const progress = Number(project.progress ?? 0)
            return (
              <div key={String(project._id)} className="rounded-xl border border-gray-800 bg-gray-900 p-5 hover:border-gray-700 transition-all">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{String(project.title)}</h3>
                    {!!project.description && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{String(project.description)}</p>
                    )}
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[String(project.status)] || 'bg-gray-500/20 text-gray-400'}`}>
                    {String(project.status)}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="mb-1.5 flex justify-between text-xs text-gray-400">
                    <span>Progress</span>
                    <span className="text-white font-medium">{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
                    <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  {!!project.startDate && (
                    <span>Started {new Date(String(project.startDate)).toLocaleDateString()}</span>
                  )}
                  {!!project.dueDate && (
                    <span>Due {new Date(String(project.dueDate)).toLocaleDateString()}</span>
                  )}
                  {!!project.completedDate && (
                    <span className="text-green-400">Completed {new Date(String(project.completedDate)).toLocaleDateString()}</span>
                  )}
                </div>

                {(project.updates as Array<Record<string, unknown>>)?.length > 0 && (
                  <div className="mt-3 border-t border-gray-800 pt-3">
                    <p className="text-xs text-gray-500 mb-1">Latest update</p>
                    <p className="text-xs text-gray-400">
                      {String((project.updates as Array<Record<string, unknown>>).at(-1)?.message || '')}
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
