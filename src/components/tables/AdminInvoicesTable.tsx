'use client'

import { format } from 'date-fns'
import DataTable from '@/src/components/tables/DataTable'

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
}

export default function AdminInvoicesTable({
  invoices
}: { invoices: any[] }) {
  const columns = [
    {
      key: 'id',
      label: 'Invoice',
      render: (row: any) => (
        <span className="font-mono text-xs text-bodydark2">
          #{row.id.slice(0, 8).toUpperCase()}
        </span>
      )
    },
    {
      key: 'client',
      label: 'Client',
      sortable: true,
      render: (row: any) => (
        <div>
          <p className="text-sm font-medium text-black dark:text-white">
            {row.profiles?.full_name || 'Unknown'}
          </p>
          <p className="text-xs text-bodydark2">{row.profiles?.email}</p>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (row: any) => (
        <span className="font-semibold text-black dark:text-white text-sm">
          ₦{(row.amount || 0).toLocaleString()}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row: any) => (
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[row.status] || STATUS_STYLES.draft}`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'due_date',
      label: 'Due Date',
      sortable: true,
      render: (row: any) => (
        <span className={`text-sm ${row.status === 'overdue' ? 'text-red-500 font-medium' : 'text-bodydark2'}`}>
          {row.due_date ? format(new Date(row.due_date), 'MMM d, yyyy') : '—'}
        </span>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (row: any) => (
        <div className="flex gap-2">
          <a
            href={`/admin/invoices/${row.id}`}
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
      data={invoices}
      columns={columns as any}
      searchPlaceholder="Search invoices..."
      emptyMessage="No invoices yet"
    />
  )
}
