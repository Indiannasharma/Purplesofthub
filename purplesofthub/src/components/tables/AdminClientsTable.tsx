'use client'

import { format } from 'date-fns'
import DataTable from '@/src/components/tables/DataTable'

interface Client {
  id: string
  full_name: string
  email: string
  created_at: string
  country: string
  projects: { count: number }[]
  invoices: { count: number }[]
}

export default function AdminClientsTable({
  clients
}: { clients: Client[] }) {
  const columns = [
    {
      key: 'full_name',
      label: 'Client',
      sortable: true,
      render: (row: Client) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {(row.full_name || row.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-black dark:text-white text-sm">
              {row.full_name || 'No name'}
            </p>
            <p className="text-xs text-bodydark2">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'country',
      label: 'Country',
      sortable: true,
      render: (row: Client) => (
        <span className="text-sm text-bodydark2">{row.country || '—'}</span>
      )
    },
    {
      key: 'projects',
      label: 'Projects',
      render: (row: Client) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-500/10 text-brand-500 text-sm font-semibold">
          {row.projects?.[0]?.count || 0}
        </span>
      )
    },
    {
      key: 'invoices',
      label: 'Invoices',
      render: (row: Client) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/10 text-purple-500 text-sm font-semibold">
          {row.invoices?.[0]?.count || 0}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Joined',
      sortable: true,
      render: (row: Client) => (
        <span className="text-sm text-bodydark2">
          {format(new Date(row.created_at), 'MMM d, yyyy')}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: Client) => (
        <div className="flex gap-2">
          <a
            href={`/admin/clients/${row.id}`}
            className="text-xs px-3 py-1.5 rounded-lg border border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white transition-all"
          >
            View
          </a>
        </div>
      )
    },
  ]

  return (
    <DataTable
      data={clients}
      columns={columns as any}
      searchPlaceholder="Search clients..."
      emptyMessage="No clients yet"
    />
  )
}
