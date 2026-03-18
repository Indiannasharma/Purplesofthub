export const dynamic = 'force-dynamic'

import connectDB from '@/lib/mongodb'
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

async function getProjects() {
  await connectDB()
  return Project.find({})
    .sort({ updatedAt: -1 })
    .populate('client', 'firstName lastName email')
    .lean() as Promise<Array<Record<string, unknown>>>
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Projects</h2>
          <p className="text-sm text-gray-400 mt-0.5">{projects.length} total project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-all"
        >
          + New Project
        </Link>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const client = project.client as Record<string, unknown> | null
                const progress = Number(project.progress ?? 0)
                return (
                  <tr key={String(project._id)} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-white max-w-xs">
                      <span className="truncate block">{String(project.title)}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                      {client ? `${String(client.firstName || '')} ${String(client.lastName || '')}`.trim() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[String(project.status)] || 'bg-gray-500/20 text-gray-400'}`}>
                        {String(project.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 w-36">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-800">
                          <div className="h-full rounded-full bg-brand-500" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                      {project.dueDate ? new Date(String(project.dueDate)).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/projects/${String(project._id)}`} className="text-xs text-brand-400 hover:underline">
                        View →
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No projects yet. <Link href="/admin/projects/new" className="text-brand-400 hover:underline">Create one →</Link>
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
