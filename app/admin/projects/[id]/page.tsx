export const dynamic = 'force-dynamic'

import connectDB from '@/lib/mongodb'
import Project from '@/lib/models/Project'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const STATUS_COLORS: Record<string, string> = {
  planning:    'bg-blue-500/20 text-blue-400',
  design:      'bg-yellow-500/20 text-yellow-400',
  development: 'bg-brand-500/20 text-brand-400',
  review:      'bg-orange-500/20 text-orange-400',
  completed:   'bg-green-500/20 text-green-400',
  'on-hold':   'bg-gray-500/20 text-gray-400',
}

const STATUSES = ['planning', 'design', 'development', 'review', 'completed', 'on-hold']

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectDB()

  const project = await Project.findById(id)
    .populate('client', 'firstName lastName email company')
    .lean() as Record<string, unknown> | null
  if (!project) notFound()

  const client = project.client as Record<string, unknown> | null
  const updates = (project.updates as Array<Record<string, unknown>>) ?? []
  const progress = Number(project.progress ?? 0)

  async function updateStatus(formData: FormData) {
    'use server'
    const { default: connectDBFn } = await import('@/lib/mongodb')
    const { default: ProjectModel } = await import('@/lib/models/Project')
    await connectDBFn()
    await ProjectModel.findByIdAndUpdate(id, {
      status: formData.get('status'),
      progress: Number(formData.get('progress')) || 0,
    })
    const { revalidatePath } = await import('next/cache')
    revalidatePath(`/admin/projects/${id}`)
  }

  async function addUpdate(formData: FormData) {
    'use server'
    const message = String(formData.get('message') || '').trim()
    if (!message) return
    const { default: connectDBFn } = await import('@/lib/mongodb')
    const { default: ProjectModel } = await import('@/lib/models/Project')
    await connectDBFn()
    await ProjectModel.findByIdAndUpdate(id, {
      $push: { updates: { message, createdAt: new Date() } },
    })
    const { revalidatePath } = await import('next/cache')
    revalidatePath(`/admin/projects/${id}`)
  }

  return (
    <>
      <div className="mb-6">
        <Link href="/admin/projects" className="text-xs text-gray-400 hover:text-brand-400 mb-3 inline-block">
          ← Back to Projects
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{String(project.title)}</h2>
            {client && (
              <p className="text-sm text-gray-400 mt-0.5">
                Client: <Link href={`/admin/clients/${String(client._id)}`} className="text-brand-400 hover:underline">
                  {String(client.firstName || '')} {String(client.lastName || '')}
                </Link>
              </p>
            )}
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[String(project.status)] || 'bg-gray-500/20 text-gray-400'}`}>
            {String(project.status)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Progress + status edit */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h5 className="mb-4 text-sm font-semibold text-white">Progress</h5>
            <div className="mb-4">
              <div className="mb-2 flex justify-between text-xs text-gray-400">
                <span>Completion</span>
                <span className="text-white font-semibold">{progress}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-800">
                <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <form action={updateStatus} className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[140px]">
                <label className="mb-1 block text-xs text-gray-400">Status</label>
                <select
                  name="status"
                  defaultValue={String(project.status)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[100px]">
                <label className="mb-1 block text-xs text-gray-400">Progress %</label>
                <input
                  type="number"
                  name="progress"
                  min="0"
                  max="100"
                  defaultValue={progress}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-all"
              >
                Update
              </button>
            </form>
          </div>

          {/* Description */}
          {!!project.description && (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <h5 className="mb-3 text-sm font-semibold text-white">Description</h5>
              <p className="text-sm text-gray-400 leading-relaxed">{String(project.description)}</p>
            </div>
          )}

          {/* Updates timeline */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h5 className="mb-4 text-sm font-semibold text-white">Project Updates</h5>
            <form action={addUpdate} className="mb-4 flex gap-2">
              <input
                type="text"
                name="message"
                placeholder="Add an update…"
                className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-all"
              >
                Post
              </button>
            </form>
            {updates.length === 0 ? (
              <p className="text-sm text-gray-500">No updates yet.</p>
            ) : (
              <div className="space-y-3">
                {[...updates].reverse().map((u, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                    <div>
                      <p className="text-sm text-gray-300">{String(u.message)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{new Date(String(u.createdAt)).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h5 className="mb-4 text-sm font-semibold text-white">Project Info</h5>
            <div className="space-y-3">
              {[
                { label: 'Start Date', value: project.startDate ? new Date(String(project.startDate)).toLocaleDateString() : '—' },
                { label: 'Due Date', value: project.dueDate ? new Date(String(project.dueDate)).toLocaleDateString() : '—' },
                { label: 'Completed', value: project.completedDate ? new Date(String(project.completedDate)).toLocaleDateString() : '—' },
                { label: 'Last Updated', value: new Date(String(project.updatedAt)).toLocaleDateString() },
              ].map((f) => (
                <div key={f.label} className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="text-xs text-gray-500">{f.label}</span>
                  <span className="text-xs text-gray-300">{f.value}</span>
                </div>
              ))}
            </div>
          </div>

          {client && (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <h5 className="mb-4 text-sm font-semibold text-white">Client</h5>
              <p className="text-sm font-medium text-white">{String(client.firstName || '')} {String(client.lastName || '')}</p>
              <p className="text-xs text-gray-400 mt-0.5">{String(client.email || '')}</p>
              {!!client.company && <p className="text-xs text-gray-400 mt-0.5">{String(client.company)}</p>}
              <Link href={`/admin/clients/${String(client._id)}`} className="mt-3 inline-block text-xs text-brand-400 hover:underline">
                View Client →
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
