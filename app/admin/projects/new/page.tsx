import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import Project from '@/lib/models/Project'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function getClients() {
  await connectDB()
  return User.find({ role: 'client' }).select('firstName lastName email').sort({ firstName: 1 }).lean() as Promise<Array<Record<string, unknown>>>
}

export default async function NewProjectPage() {
  const clients = await getClients()

  async function createProject(formData: FormData) {
    'use server'
    const { default: connectDBFn } = await import('@/lib/mongodb')
    const { default: ProjectModel } = await import('@/lib/models/Project')
    await connectDBFn()
    await ProjectModel.create({
      title: String(formData.get('title') || '').trim(),
      description: String(formData.get('description') || '').trim(),
      client: formData.get('clientId'),
      status: formData.get('status') || 'planning',
      progress: Number(formData.get('progress')) || 0,
      startDate: formData.get('startDate') ? new Date(String(formData.get('startDate'))) : undefined,
      dueDate: formData.get('dueDate') ? new Date(String(formData.get('dueDate'))) : undefined,
    })
    redirect('/admin/projects')
  }

  return (
    <>
      <div className="mb-6">
        <Link href="/admin/projects" className="text-xs text-gray-400 hover:text-brand-400 mb-3 inline-block">
          ← Back to Projects
        </Link>
        <h2 className="text-2xl font-bold text-white">New Project</h2>
        <p className="text-sm text-gray-400 mt-0.5">Create a new client project</p>
      </div>

      <div className="max-w-2xl rounded-xl border border-gray-800 bg-gray-900 p-6">
        <form action={createProject} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Project Title <span className="text-red-400">*</span></label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Brand Website Redesign"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Client <span className="text-red-400">*</span></label>
            <select
              name="clientId"
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
            >
              <option value="">— Select a client —</option>
              {clients.map((c) => (
                <option key={String(c._id)} value={String(c._id)}>
                  {String(c.firstName || '')} {String(c.lastName || '')} ({String(c.email)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Description</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Project scope and objectives…"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Status</label>
              <select
                name="status"
                defaultValue="planning"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
              >
                {['planning', 'design', 'development', 'review', 'completed', 'on-hold'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Progress (%)</label>
              <input
                type="number"
                name="progress"
                min="0"
                max="100"
                defaultValue="0"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Start Date</label>
              <input
                type="date"
                name="startDate"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Due Date</label>
              <input
                type="date"
                name="dueDate"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-all"
            >
              Create Project
            </button>
            <Link href="/admin/projects" className="text-sm text-gray-400 hover:text-white">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  )
}
