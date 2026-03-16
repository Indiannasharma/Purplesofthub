'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

type ProjectDetail = {
  _id: string
  title: string
  description?: string
  status?: string
  progress?: number
  dueDate?: string
  startDate?: string
  updates?: { message: string; createdAt: string }[]
  client?: { _id: string; firstName?: string; lastName?: string; email?: string }
  service?: { name?: string; category?: string }
}

type ProjectUpdatePayload = {
  status?: string
  progress?: number
  dueDate?: string | null
  startDate?: string | null
}

type TaskItem = {
  _id: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'done'
}

type FileItem = {
  _id: string
  name: string
  url?: string
  fileType?: string
  createdAt?: string
  publicId?: string
}

const STATUS_OPTIONS = ['planning', 'design', 'development', 'review', 'completed'] as const

const TASK_COLUMNS: Array<{ key: TaskItem['status']; label: string; next?: TaskItem['status'] }> = [
  { key: 'todo', label: 'To Do', next: 'in-progress' },
  { key: 'in-progress', label: 'In Progress', next: 'done' },
  { key: 'done', label: 'Done' },
]

export default function AdminProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const projectId = params?.id
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [newUpdate, setNewUpdate] = useState('')
  const [taskTitle, setTaskTitle] = useState<Record<string, string>>({})
  const [taskDescription, setTaskDescription] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState(false)
  const [fileCategory, setFileCategory] = useState('deliverable')

  const fetchProject = async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Failed to load project.')
        setLoading(false)
        return
      }
      setProject(data?.project || null)
      setTasks(data?.tasks || [])
      setFiles(data?.files || [])
    } catch (err) {
      console.error('Project fetch error:', err)
      setError('Failed to load project.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProject()
  }, [projectId])

  const groupedTasks = useMemo(() => {
    return TASK_COLUMNS.reduce<Record<string, TaskItem[]>>((acc, col) => {
      acc[col.key] = tasks.filter((task) => task.status === col.key)
      return acc
    }, {})
  }, [tasks])

  const updateProject = async (payload: ProjectUpdatePayload) => {
    if (!projectId) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Failed to update project.')
        setSaving(false)
        return
      }
      setProject((prev) => (prev ? { ...prev, ...data.project } : prev))
    } catch (err) {
      console.error('Project update error:', err)
      setError('Failed to update project.')
    } finally {
      setSaving(false)
    }
  }

  const createTask = async (status: TaskItem['status']) => {
    if (!projectId) return
    const title = (taskTitle[status] || '').trim()
    if (!title) return

    try {
      const res = await fetch(`/api/admin/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: taskDescription[status] || '', status }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Failed to create task.')
        return
      }
      setTasks((prev) => [...prev, data.task])
      setTaskTitle((prev) => ({ ...prev, [status]: '' }))
      setTaskDescription((prev) => ({ ...prev, [status]: '' }))
    } catch (err) {
      console.error('Task create error:', err)
      setError('Failed to create task.')
    }
  }

  const moveTask = async (task: TaskItem, nextStatus: TaskItem['status']) => {
    if (!projectId) return
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/tasks/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Failed to update task.')
        return
      }
      setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, status: nextStatus } : t)))
    } catch (err) {
      console.error('Task move error:', err)
      setError('Failed to update task.')
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!projectId) return
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setError(data?.error || 'Failed to delete task.')
        return
      }
      setTasks((prev) => prev.filter((task) => task._id !== taskId))
    } catch (err) {
      console.error('Task delete error:', err)
      setError('Failed to delete task.')
    }
  }

  const addUpdate = async () => {
    if (!projectId || !newUpdate.trim()) return
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newUpdate }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Failed to post update.')
        return
      }
      setProject((prev) => (prev ? { ...prev, updates: data.project?.updates } : prev))
      setNewUpdate('')
    } catch (err) {
      console.error('Add update error:', err)
      setError('Failed to post update.')
    }
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!projectId || !event.target.files?.[0]) return
    const file = event.target.files[0]
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', projectId)
      formData.append('category', fileCategory)
      formData.append('uploadedBy', 'admin')

      const res = await fetch('/api/files/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Failed to upload file.')
        setUploading(false)
        return
      }
      setFiles((prev) => [data.file || data, ...prev])
    } catch (err) {
      console.error('File upload error:', err)
      setError('Failed to upload file.')
    } finally {
      setUploading(false)
    }
  }

  const deleteFile = async (file: FileItem) => {
    try {
      const res = await fetch('/api/files/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: file.publicId, fileId: file._id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Failed to delete file.')
        return
      }
      setFiles((prev) => prev.filter((f) => f._id !== file._id))
    } catch (err) {
      console.error('File delete error:', err)
      setError('Failed to delete file.')
    }
  }

  if (loading) {
    return <div style={{ color: '#9d8fd4', fontSize: 14 }}>Loading project...</div>
  }

  if (error || !project) {
    return (
      <div style={{ color: '#f87171', fontSize: 14 }}>
        {error || 'Project not found.'}
      </div>
    )
  }

  const clientName = `${project.client?.firstName || ''} ${project.client?.lastName || ''}`.trim() || 'Client'

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <section
        style={{
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(124,58,237,.18)',
          borderRadius: 16,
          padding: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#e2d9f3' }}>{project.title}</h1>
            <div style={{ fontSize: 13, color: '#9d8fd4', marginTop: 6 }}>
              Client:{' '}
              <Link href={`/admin/clients/${project.client?._id}`} style={{ color: '#a855f7', textDecoration: 'none', fontWeight: 600 }}>
                {clientName}
              </Link>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 20 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#9d8fd4' }}>Status</span>
            <select
              value={project.status}
              onChange={(e) => updateProject({ status: e.target.value })}
              style={{ ...inputStyle, height: 42 }}
              disabled={saving}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#9d8fd4' }}>Progress ({project.progress ?? 0}%)</span>
            <input
              type="range"
              min={0}
              max={100}
              value={project.progress ?? 0}
              onChange={(e) => updateProject({ progress: Number(e.target.value) })}
              disabled={saving}
            />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#9d8fd4' }}>Due Date</span>
            <input
              type="date"
              value={project.dueDate ? project.dueDate.slice(0, 10) : ''}
              onChange={(e) => updateProject({ dueDate: e.target.value || null })}
              style={inputStyle}
              disabled={saving}
            />
          </label>
        </div>
      </section>

      <section
        style={{
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(124,58,237,.18)',
          borderRadius: 16,
          padding: 24,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2d9f3', marginBottom: 16 }}>Tasks</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {TASK_COLUMNS.map((column) => (
            <div key={column.key} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(124,58,237,.12)', borderRadius: 14, padding: 14 }}>
              <div style={{ fontWeight: 700, color: '#e2d9f3', marginBottom: 10 }}>{column.label}</div>

              <div style={{ display: 'grid', gap: 10, marginBottom: 12 }}>
                {groupedTasks[column.key]?.map((task) => (
                  <div key={task._id} style={{ background: 'rgba(8,6,16,.8)', border: '1px solid rgba(124,58,237,.15)', borderRadius: 12, padding: 12 }}>
                    <div style={{ fontWeight: 600, color: '#e2d9f3' }}>{task.title}</div>
                    {task.description && <div style={{ fontSize: 12, color: '#9d8fd4', marginTop: 4 }}>{task.description}</div>}
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      {column.next && (
                        <button
                          onClick={() => moveTask(task, column.next!)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 8,
                            border: '1px solid rgba(124,58,237,.3)',
                            background: 'transparent',
                            color: '#a855f7',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Move →
                        </button>
                      )}
                      <button
                        onClick={() => deleteTask(task._id)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 8,
                          border: '1px solid rgba(239,68,68,.3)',
                          background: 'rgba(239,68,68,.12)',
                          color: '#f87171',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                <input
                  value={taskTitle[column.key] || ''}
                  onChange={(e) => setTaskTitle((prev) => ({ ...prev, [column.key]: e.target.value }))}
                  placeholder="Task title"
                  style={inputStyle}
                />
                <input
                  value={taskDescription[column.key] || ''}
                  onChange={(e) => setTaskDescription((prev) => ({ ...prev, [column.key]: e.target.value }))}
                  placeholder="Description"
                  style={inputStyle}
                />
                <button
                  onClick={() => createTask(column.key)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid rgba(124,58,237,.3)',
                    background: 'transparent',
                    color: '#a855f7',
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  + Add Task
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(124,58,237,.18)',
          borderRadius: 16,
          padding: 24,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2d9f3', marginBottom: 16 }}>Updates</h2>
        <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
          {(project.updates || []).slice().reverse().map((update, index) => (
            <div key={`${update.createdAt}-${index}`} style={{ background: 'rgba(8,6,16,.8)', border: '1px solid rgba(124,58,237,.15)', borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12, color: '#3d2f60', marginBottom: 6 }}>
                {new Date(update.createdAt).toLocaleString('en-US')}
              </div>
              <div style={{ color: '#e2d9f3' }}>{update.message}</div>
            </div>
          ))}
          {(!project.updates || project.updates.length === 0) && (
            <div style={{ color: '#9d8fd4', fontSize: 13 }}>No updates yet.</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            value={newUpdate}
            onChange={(e) => setNewUpdate(e.target.value)}
            placeholder="Share a project update..."
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            onClick={addUpdate}
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Post Update
          </button>
        </div>
      </section>

      <section
        style={{
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(124,58,237,.18)',
          borderRadius: 16,
          padding: 24,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2d9f3', marginBottom: 16 }}>Files</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <select value={fileCategory} onChange={(e) => setFileCategory(e.target.value)} style={{ ...inputStyle, height: 42 }}>
            <option value="brief">Brief</option>
            <option value="design">Design</option>
            <option value="asset">Asset</option>
            <option value="deliverable">Deliverable</option>
            <option value="report">Report</option>
            <option value="invoice">Invoice</option>
            <option value="other">Other</option>
          </select>
          <input type="file" onChange={handleUpload} disabled={uploading} style={{ color: '#9d8fd4' }} />
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {files.length === 0 ? (
            <div style={{ color: '#9d8fd4', fontSize: 13 }}>No files uploaded yet.</div>
          ) : (
            files.map((file) => (
              <div key={file._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid rgba(124,58,237,.08)', paddingBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#e2d9f3' }}>{file.name}</div>
                  <div style={{ fontSize: 12, color: '#9d8fd4' }}>{file.fileType || 'File'}</div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {file.url && (
                    <a href={file.url} target="_blank" rel="noreferrer" style={{ color: '#a855f7', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                      Download →
                    </a>
                  )}
                  <button
                    onClick={() => deleteFile(file)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 8,
                      border: '1px solid rgba(239,68,68,.3)',
                      background: 'rgba(239,68,68,.12)',
                      color: '#f87171',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,.04)',
  border: '1px solid rgba(124,58,237,.2)',
  borderRadius: 10,
  padding: '10px 12px',
  color: '#e2d9f3',
  fontSize: 14,
  outline: 'none',
}
