export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import File from '@/lib/models/File'

const CATEGORY_ICONS: Record<string, string> = {
  brief:       '📋',
  design:      '🎨',
  asset:       '📦',
  deliverable: '✅',
  report:      '📊',
  invoice:     '🧾',
  other:       '📄',
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default async function ClientFilesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  await connectDB()
  const user = await User.findOne({ clerkId: userId }).lean() as Record<string, unknown> | null
  if (!user) redirect('/dashboard')

  const files = await File.find({ client: user._id })
    .sort({ createdAt: -1 })
    .populate('project', 'title')
    .lean() as Array<Record<string, unknown>>

  const byCategory = files.reduce<Record<string, Array<Record<string, unknown>>>>((acc, f) => {
    const cat = String(f.category || 'other')
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(f)
    return acc
  }, {})

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">My Files</h2>
        <p className="text-sm text-gray-400 mt-0.5">{files.length} file{files.length !== 1 ? 's' : ''} shared with you</p>
      </div>

      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-800 bg-gray-900 p-16 text-center">
          <p className="text-5xl mb-4">📁</p>
          <p className="text-sm font-semibold text-white mb-1">No files yet</p>
          <p className="text-xs text-gray-400">Files shared by your project team will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byCategory).map(([category, catFiles]) => (
            <div key={category} className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
              <div className="border-b border-gray-800 px-6 py-3 flex items-center gap-2">
                <span className="text-base">{CATEGORY_ICONS[category] || '📄'}</span>
                <h5 className="text-sm font-semibold text-white capitalize">{category}</h5>
                <span className="ml-auto text-xs text-gray-500">{catFiles.length} file{catFiles.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="divide-y divide-gray-800">
                {catFiles.map((file) => {
                  const project = file.project as Record<string, unknown> | null
                  return (
                    <div key={String(file._id)} className="flex items-center justify-between px-6 py-3 hover:bg-gray-800/40 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">{String(file.name || file.originalName)}</p>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                          {project && <span>📦 {String(project.title)}</span>}
                          {!!file.fileType && <span>{String(file.fileType)}</span>}
                          {!!file.fileSize && <span>{formatSize(Number(file.fileSize))}</span>}
                          <span>{new Date(String(file.createdAt)).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <a
                        href={String(file.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 shrink-0 rounded-full border border-brand-500/50 px-3 py-1.5 text-xs font-medium text-brand-400 hover:bg-brand-500 hover:text-white transition-all"
                      >
                        Download
                      </a>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
