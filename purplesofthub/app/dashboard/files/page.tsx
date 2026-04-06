import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import FileUploadClient from '@/src/components/Client/FileUpload'

export default async function ClientFilesPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) redirect('/sign-in')

  const { data: files } = await supabase
    .from('files')
    .select(
      `
      *,
      projects(title)
    `
    )
    .eq('uploaded_by', user.id)
    .order('created_at', { ascending: false })

  const FILE_ICONS: Record<string, string> = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    mp4: '🎬',
    mp3: '🎵',
    zip: '📦',
    default: '📎'
  }

  const getFileIcon = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase() || 'default'
    return FILE_ICONS[ext] || FILE_ICONS.default
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white">My Files</h2>
          <p className="text-sm text-bodydark2 mt-1">{files?.length || 0} files</p>
        </div>
        <FileUploadClient userId={user.id} />
      </div>

      {!files?.length ? (
        <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark p-12 text-center">
          <p className="text-5xl mb-4">📁</p>
          <p className="font-semibold text-black dark:text-white mb-2">No files yet</p>
          <p className="text-sm text-bodydark2">Upload project briefs, assets, or reference files</p>
        </div>
      ) : (
        <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stroke dark:border-strokedark">
                {['File', 'Project', 'Size', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-bodydark2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {files.map((file: any) => (
                <tr key={file.id} className="border-b border-stroke/50 dark:border-strokedark/50 hover:bg-brand-500/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getFileIcon(file.file_url || '')}</span>
                      <div>
                        <p className="text-sm font-medium text-black dark:text-white line-clamp-1">
                          {file.file_name || 'Unnamed file'}
                        </p>
                        <p className="text-xs text-bodydark2 uppercase">{file.file_type || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-bodydark2">{file.projects?.title || '—'}</td>
                  <td className="px-6 py-4 text-sm text-bodydark2">{formatFileSize(file.file_size)}</td>
                  <td className="px-6 py-4 text-sm text-bodydark2">
                    {format(new Date(file.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3 py-1.5 rounded-lg border border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white transition-all"
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
