'use client'

import { format } from 'date-fns'
import DataTable from '@/src/components/tables/DataTable'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  in_progress: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  on_hold: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
}

export default function AdminProjectsTable({
  projects
}: { projects: any[] }) {
  const columns = [
    {
      key: 'title',
      label: 'Project',
      sortable: true,
      render: (row: any) => (
        <div>
          <p className="font-medium text-black dark:text-white text-sm">{row.title}</p>
          <p className="text-xs text-bodydark2 mt-0.5">
            {row.profiles?.full_name || row.profiles?.email || 'Unknown'}
          </p>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row: any) => (
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[row.status] || STATUS_STYLES.pending}`}>
          {row.status.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'progress',
      label: 'Progress',
      render: (row: any) => (
        <div className="flex items-center gap-2 min-w-[100px]">
          <div className="flex-1 h-1.5 bg-stroke dark:bg-strokedark rounded-full">
            <div
              className="h-full bg-brand-500 rounded-full"
              style={{ width: `${row.progress || 0}%` }}
            />
          </div>
          <span className="text-xs text-bodydark2 w-8 text-right">{row.progress || 0}%</span>
        </div>
      )
    },
    {
      key: 'due_date',
      label: 'Due Date',
      sortable: true,
      render: (row: any) => (
        <span className="text-sm text-bodydark2">
          {row.due_date ? format(new Date(row.due_date), 'MMM d, yyyy') : '—'}
        </span>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (row: any) => (
        <a
          href={`/admin/projects/${row.id}`}
          className="text-xs px-3 py-1.5 rounded-lg border border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white transition-all"
        >
          Manage
        </a>
      )
    },
  ]

  return (
    <DataTable
      data={projects}
      columns={columns as any}
      searchPlaceholder="Search projects..."
      emptyMessage="No projects yet"
    />
  )
}
