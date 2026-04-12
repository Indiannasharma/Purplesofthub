import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
// TODO: Restore FileUploadClient component from git
// import FileUploadClient from '@/components/Client/FileUpload'

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
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 900,
          color: 'var(--cmd-heading)',
          margin: '0 0 4px',
        }}>
          My Files
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'var(--cmd-body)',
          margin: 0,
        }}>
          {files?.length || 0} files
        </p>
      </div>

      {/* Info banner */}
      <div style={{
        background: 'rgba(124,58,237,0.08)',
        border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: '10px',
        padding: '12px 16px',
        marginBottom: '24px',
        color: '#a855f7',
        fontSize: '14px',
      }}>
        File upload feature is being restored. Check back soon!
      </div>

      {/* Files list or empty state */}
      {!files?.length ? (
        <div style={{
          background: 'var(--cmd-card)',
          border: '1px solid rgba(124,58,237,0.15)',
          borderRadius: '16px',
          padding: '60px 24px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '48px', margin: '0 0 16px' }}>📁</p>
          <p style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--cmd-heading)',
            margin: '0 0 8px',
          }}>
            No files yet
          </p>
          <p style={{
            fontSize: '13px',
            color: 'var(--cmd-body)',
            margin: 0,
          }}>
            Upload project briefs, assets, or reference files
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {files.map((file: any) => (
            <div
              key={file.id}
              style={{
                background: 'var(--cmd-card)',
                border: '1px solid rgba(124,58,237,0.12)',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              {/* File icon */}
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'rgba(124,58,237,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                flexShrink: 0,
              }}>
                {getFileIcon(file.file_url || '')}
              </div>

              {/* File info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--cmd-heading)',
                  margin: '0 0 4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {file.file_name || 'Unnamed file'}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: 'var(--cmd-muted)',
                  margin: 0,
                }}>
                  {file.file_type ? file.file_type.toUpperCase() : '—'}
                  {file.projects?.title ? ` · ${file.projects.title}` : ''}
                </p>
              </div>

              {/* File size + date */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '4px',
                flexShrink: 0,
              }}>
                <span style={{
                  fontSize: '12px',
                  color: 'var(--cmd-muted)',
                }}>
                  {formatFileSize(file.file_size)}
                </span>
                <span style={{
                  fontSize: '11px',
                  color: 'var(--cmd-muted)',
                }}>
                  {format(new Date(file.created_at), 'MMM d, yyyy')}
                </span>
              </div>

              {/* Download button */}
              <a
                href={file.file_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flexShrink: 0,
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(124,58,237,0.35)',
                  background: 'transparent',
                  color: '#a855f7',
                  fontSize: '12px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
