import type { ReactElement, ReactNode } from 'react'
import { cn } from '../utils/cn'
import { Loader } from './Loader'
import { EmptyState } from './EmptyState'

export interface TableColumn<T> {
  key: string
  header: string
  className?: string
  cellClassName?: string
  render?: (row: T) => ReactNode
}

interface TableProps<T> {
  columns: TableColumn<T>[]
  rows: T[]
  getRowKey: (row: T) => string
  isLoading?: boolean
  /** Non-fatal data error shown as a banner above the table. */
  error?: string | null
  emptyTitle?: string
  emptyDescription?: string
}

/**
 * Generic data table with built-in loading skeletons, empty and error states —
 * the workhorse for admin CRUD lists and history views.
 */
export function Table<T>({
  columns,
  rows,
  getRowKey,
  isLoading = false,
  error = null,
  emptyTitle = 'No records yet',
  emptyDescription = 'Records you add will show up here.',
}: TableProps<T>): ReactElement {
  const hasNoData = !isLoading && rows.length === 0

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800">
      {error && (
        <div role="alert" className="border-b border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-800 text-sm">
          <thead className="bg-zinc-900">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500',
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/70 bg-zinc-950/40">
            {isLoading &&
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="animate-pulse">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3">
                      <div className="h-4 w-24 rounded bg-zinc-800" />
                    </td>
                  ))}
                </tr>
              ))}

            {hasNoData && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-2">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            )}

            {!isLoading &&
              rows.map((row) => (
                <tr key={getRowKey(row)} className="transition-colors hover:bg-zinc-900/60">
                  {columns.map((column) => (
                    <td key={column.key} className={cn('px-4 py-3 align-middle', column.cellClassName)}>
                      {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {isLoading && <Loader size="sm" label="Loading records…" className="py-4" />}
    </div>
  )
}