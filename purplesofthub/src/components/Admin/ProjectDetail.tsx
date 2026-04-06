'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import Link from 'next/link'

const STATUS_OPTIONS = ['pending', 'in_progress', 'completed', 'on_hold', 'cancelled']

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  in_progress: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  on_hold: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
}

export default function ProjectDetailClient({
  project: initialProject,
  tasks: initialTasks,
  updates: initialUpdates
}: {
  project: any
  tasks: any[]
  updates: any[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const [project, setProject] = useState(initialProject)
  const [tasks, setTasks] = useState(initialTasks)
  const [updates, setUpdates] = useState(initialUpdates)
  const [newTask, setNewTask] = useState('')
  const [newUpdate, setNewUpdate] = useState('')
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'tasks' | 'updates' | 'details'>('tasks')

  // Update project status
  const updateStatus = async (status: string) => {
    const { error } = await supabase
      .from('projects')
      .update({ status })
      .eq('id', project.id)
    if (!error) {
      setProject((p: any) => ({ ...p, status }))
    }
  }

  // Update progress
  const updateProgress = async (progress: number) => {
    const { error } = await supabase
      .from('projects')
      .update({ progress })
      .eq('id', project.id)
    if (!error) {
      setProject((p: any) => ({ ...p, progress }))
    }
  }

  // Add task
  const addTask = async () => {
    if (!newTask.trim()) return
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        project_id: project.id,
        title: newTask,
        status: 'todo',
        order: tasks.length
      })
      .select()
      .single()
    if (!error && data) {
      setTasks(t => [...t, data])
      setNewTask('')
    }
  }

  // Update task status
  const updateTaskStatus = async (taskId: string, status: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({
        status,
        completed_at: status === 'done' ? new Date().toISOString() : null
      })
      .eq('id', taskId)
    if (!error) {
      setTasks(t => t.map(task => (task.id === taskId ? { ...task, status } : task)))
    }
  }

  // Delete task
  const deleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
    if (!error) {
      setTasks(t => t.filter(task => task.id !== taskId))
    }
  }

  // Add update
  const addUpdate = async () => {
    if (!newUpdate.trim()) return
    setSaving(true)
    const { data, error } = await supabase
      .from('project_updates')
      .insert({
        project_id: project.id,
        message: newUpdate
      })
      .select()
      .single()
    if (!error && data) {
      setUpdates(u => [data, ...u])
      setNewUpdate('')
    }
    setSaving(false)
  }

  const todoTasks = tasks.filter(t => t.status === 'todo')
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress')
  const doneTasks = tasks.filter(t => t.status === 'done')

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Link
            href="/admin/projects"
            className="text-bodydark2 hover:text-brand-500 transition-colors text-sm"
          >
            ← Projects
          </Link>
        </div>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-black dark:text-white">{project.title}</h2>
            <p className="text-sm text-bodydark2 mt-1">
              Client:{' '}
              <span className="text-brand-500">
                {project.profiles?.full_name || project.profiles?.email}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={project.status}
              onChange={e => updateStatus(e.target.value)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium border-0 cursor-pointer ${
                STATUS_STYLES[project.status] || STATUS_STYLES.pending
              }`}
            >
              {STATUS_OPTIONS.map(s => (
                <option
                  key={s}
                  value={s}
                  className="bg-white dark:bg-boxdark text-black dark:text-white"
                >
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Progress slider */}
        <div className="mt-4 rounded-xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-black dark:text-white">Progress</span>
            <span className="text-sm font-bold text-brand-500">{project.progress || 0}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={project.progress || 0}
            onChange={e => updateProgress(Number(e.target.value))}
            className="w-full accent-brand-500"
          />
          <div className="mt-2 h-2 bg-stroke dark:bg-strokedark rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all"
              style={{ width: `${project.progress || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-stroke dark:border-strokedark">
        {(['tasks', 'updates', 'details'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-all ${
              activeTab === tab
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-bodydark2 hover:text-brand-500'
            }`}
          >
            {tab}
            {tab === 'tasks' && (
              <span className="ml-2 text-xs bg-brand-500/10 text-brand-500 px-1.5 py-0.5 rounded-full">
                {tasks.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tasks tab — Kanban */}
      {activeTab === 'tasks' && (
        <div>
          {/* Add task */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              placeholder="Add a task..."
              className="flex-1 px-4 py-2.5 rounded-lg border border-stroke dark:border-strokedark bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-brand-500"
            />
            <button
              onClick={addTask}
              className="px-4 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-all"
            >
              + Add
            </button>
          </div>

          {/* Kanban columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: 'To Do',
                status: 'todo',
                tasks: todoTasks,
                color: 'border-yellow-500',
                bg: 'bg-yellow-500/5'
              },
              {
                title: 'In Progress',
                status: 'in_progress',
                tasks: inProgressTasks,
                color: 'border-brand-500',
                bg: 'bg-brand-500/5'
              },
              {
                title: 'Done',
                status: 'done',
                tasks: doneTasks,
                color: 'border-green-500',
                bg: 'bg-green-500/5'
              }
            ].map(col => (
              <div key={col.status} className={`rounded-xl border-t-4 ${col.color} border border-stroke dark:border-strokedark ${col.bg} p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <h6 className="font-semibold text-black dark:text-white text-sm">{col.title}</h6>
                  <span className="text-xs text-bodydark2 bg-white dark:bg-boxdark px-2 py-0.5 rounded-full">
                    {col.tasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {col.tasks.map(task => (
                    <div key={task.id} className="bg-white dark:bg-boxdark rounded-lg p-3 shadow-sm border border-stroke dark:border-strokedark">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-black dark:text-white flex-1">{task.title}</p>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-bodydark2 hover:text-red-500 transition-colors text-xs flex-shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {STATUS_OPTIONS.filter(s => ['todo', 'in_progress', 'done'].includes(s))
                          .filter(s => s !== task.status)
                          .map(s => (
                            <button
                              key={s}
                              onClick={() => updateTaskStatus(task.id, s)}
                              className="text-xs px-2 py-0.5 rounded border border-stroke dark:border-strokedark text-bodydark2 hover:border-brand-500 hover:text-brand-500 transition-all"
                            >
                              → {s.replace('_', ' ')}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                  {col.tasks.length === 0 && (
                    <p className="text-xs text-bodydark2 text-center py-4">No tasks</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Updates tab */}
      {activeTab === 'updates' && (
        <div>
          {/* Add update */}
          <div className="mb-6 rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark p-4">
            <textarea
              value={newUpdate}
              onChange={e => setNewUpdate(e.target.value)}
              placeholder="Post an update to the client..."
              rows={3}
              className="w-full bg-transparent text-sm text-black dark:text-white placeholder-bodydark2 focus:outline-none resize-none mb-3"
            />
            <div className="flex justify-end">
              <button
                onClick={addUpdate}
                disabled={saving || !newUpdate.trim()}
                className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-all disabled:opacity-50"
              >
                {saving ? 'Posting...' : 'Post Update'}
              </button>
            </div>
          </div>

          {/* Updates list */}
          <div className="space-y-3">
            {updates.length === 0 ? (
              <p className="text-sm text-bodydark2 text-center py-8">No updates yet</p>
            ) : (
              updates.map((update: any) => (
                <div key={update.id} className="rounded-xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
                  <p className="text-sm text-black dark:text-white mb-2">{update.message}</p>
                  <p className="text-xs text-bodydark2">{format(new Date(update.created_at), 'MMM d, yyyy — h:mm a')}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Details tab */}
      {activeTab === 'details' && (
        <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark p-6">
          <dl className="space-y-4">
            {[
              { label: 'Client', value: project.profiles?.full_name || project.profiles?.email },
              { label: 'Status', value: project.status.replace('_', ' ') },
              { label: 'Progress', value: `${project.progress || 0}%` },
              {
                label: 'Start Date',
                value: project.start_date ? format(new Date(project.start_date), 'MMM d, yyyy') : '—'
              },
              {
                label: 'Due Date',
                value: project.due_date ? format(new Date(project.due_date), 'MMM d, yyyy') : '—'
              },
              { label: 'Budget', value: project.budget ? `₦${Number(project.budget).toLocaleString()}` : '—' },
              { label: 'Description', value: project.description || '—' }
            ].map(item => (
              <div key={item.label} className="flex gap-4">
                <dt className="w-32 flex-shrink-0 text-sm font-medium text-bodydark2">{item.label}</dt>
                <dd className="text-sm text-black dark:text-white capitalize">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  )
}
