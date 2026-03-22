'use client'

import { useState } from 'react'

interface Column<T> {
  key: keyof T | string
  label: string
  render?: (row: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchable?: boolean
  searchPlaceholder?: string
  emptyMessage?: string
  onRowClick?: (row: T) => void
}

export default function DataTable<T extends
  Record<string, any>>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No data found',
  onRowClick
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] =
    useState<string>('')
  const [sortDir, setSortDir] =
    useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const perPage = 10

  // Filter
  const filtered = data.filter(row =>
    Object.values(row).some(val =>
      String(val).toLowerCase()
        .includes(search.toLowerCase())
    )
  )

  // Sort
  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const aVal = a[sortKey]
        const bVal = b[sortKey]
        const dir = sortDir === 'asc' ? 1 : -1
        return aVal > bVal ? dir : -dir
      })
    : filtered

  // Paginate
  const totalPages =
    Math.ceil(sorted.length / perPage)
  const paginated = sorted.slice(
    (page - 1) * perPage,
    page * perPage
  )

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d =>
        d === 'asc' ? 'desc' : 'asc'
      )
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div>
      {/* Search */}
      {searchable && (
        <div className="mb-4">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full md:w-72
              px-4 py-2.5 rounded-lg
              border border-stroke
              dark:border-strokedark
              bg-transparent
              text-sm text-black
              dark:text-white
              placeholder-bodydark2
              focus:outline-none
              focus:border-brand-500"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full
          text-sm text-left">
          <thead>
            <tr className="border-b
              border-stroke
              dark:border-strokedark">
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  onClick={() =>
                    col.sortable &&
                    handleSort(String(col.key))
                  }
                  className={`px-4 py-3
                    font-semibold
                    text-xs uppercase
                    tracking-wider
                    text-bodydark2
                    ${col.sortable
                      ? 'cursor-pointer hover:text-brand-500'
                      : ''
                    }`}
                >
                  {col.label}
                  {col.sortable &&
                    sortKey === String(col.key) && (
                    <span className="ml-1">
                      {sortDir === 'asc'
                        ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8
                    text-center
                    text-bodydark2"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={i}
                  onClick={() =>
                    onRowClick?.(row)
                  }
                  className={`border-b
                    border-stroke/50
                    dark:border-strokedark/50
                    hover:bg-brand-500/5
                    transition-colors
                    ${onRowClick
                      ? 'cursor-pointer'
                      : ''
                    }`}
                >
                  {columns.map(col => (
                    <td
                      key={String(col.key)}
                      className="px-4 py-3
                        text-black
                        dark:text-white"
                    >
                      {col.render
                        ? col.render(row)
                        : row[col.key as string]
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center
          justify-between mt-4 pt-4
          border-t border-stroke
          dark:border-strokedark">
          <p className="text-sm
            text-bodydark2">
            Showing {(page-1)*perPage+1} to{' '}
            {Math.min(
              page*perPage,
              sorted.length
            )}{' '}
            of {sorted.length} results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setPage(p =>
                  Math.max(1, p-1)
                )
              }
              disabled={page === 1}
              className="px-3 py-1.5
                rounded-lg border
                border-stroke
                dark:border-strokedark
                text-sm text-bodydark2
                hover:border-brand-500
                hover:text-brand-500
                disabled:opacity-40
                transition-all"
            >
              ← Prev
            </button>
            {Array.from(
              { length: totalPages },
              (_, i) => i + 1
            )
            .filter(p =>
              p === 1 ||
              p === totalPages ||
              Math.abs(p - page) <= 1
            )
            .map((p, i, arr) => (
              <>
                {i > 0 &&
                  arr[i-1] !== p-1 && (
                  <span className="px-2
                    text-bodydark2">
                    ...
                  </span>
                )}
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1.5
                    rounded-lg border
                    text-sm transition-all
                    ${page === p
                      ? 'bg-brand-500 border-brand-500 text-white'
                      : 'border-stroke dark:border-strokedark text-bodydark2 hover:border-brand-500 hover:text-brand-500'
                    }`}
                >
                  {p}
                </button>
              </>
            ))}
            <button
              onClick={() =>
                setPage(p =>
                  Math.min(totalPages, p+1)
                )
              }
              disabled={page === totalPages}
              className="px-3 py-1.5
                rounded-lg border
                border-stroke
                dark:border-strokedark
                text-sm text-bodydark2
                hover:border-brand-500
                hover:text-brand-500
                disabled:opacity-40
                transition-all"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
