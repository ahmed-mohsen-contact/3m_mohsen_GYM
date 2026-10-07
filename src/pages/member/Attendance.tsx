import { useMemo, useState } from 'react'
import { Badge } from '../../components/Badge'
import { Card } from '../../components/Card'
import { EmptyState } from '../../components/EmptyState'
import { Loader } from '../../components/Loader'
import { PageHeader } from '../../components/PageHeader'
import { StatCard } from '../../components/StatCard'
import { Table } from '../../components/Table'
import { useAuth } from '../../hooks/useAuth'
import { useGym } from '../../hooks/useGym'
import { usePageTitle } from '../../hooks/usePageTitle'
import type { Attendance } from '../../types'
import { formatDateTime } from '../../utils/format'
import { attendanceStatusTone } from '../../utils/status'

/** Member attendance history: summary stats + full check-in log. */
export function AttendanceHistory() {
  usePageTitle('My Attendance')
  const { user } = useAuth()
  const { attendance, classes, isLoading, error } = useGym()

  const [monthFilter, setMonthFilter] = useState<'all' | string>('all')

  const myRecords = useMemo(
    () => (user ? attendance.filter((record) => record.memberId === user.id) : []),
    [attendance, user],
  )

  const months = useMemo(
    () =>
      Array.from(
        new Set(
          myRecords.map((record) => {
            const date = new Date(record.checkInAt)
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          }),
        ),
      ).sort().reverse(),
    [myRecords],
  )

  const visibleRecords =
    monthFilter === 'all' ? myRecords : myRecords.filter((record) => record.checkInAt.startsWith(monthFilter))

  const totalVisits = myRecords.length
  const present = myRecords.filter((record) => record.status === 'present').length
  const late = myRecords.filter((record) => record.status === 'late').length

  if (isLoading) {
    return <Loader fullScreen label="Loading attendance…" />
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Attendance history"
        description="Every check-in across classes and open gym sessions."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total visits" tone="brand" value={totalVisits} sub="All time" />
        <StatCard label="On time" tone="green" value={present} sub={`${totalVisits ? Math.round((present / totalVisits) * 100) : 0}% of visits`} />
        <StatCard label="Late arrivals" tone="amber" value={late} sub="Better early than absent" />
      </div>

      <Card className="mt-8" title="Check-in log">
        {months.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setMonthFilter('all')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                monthFilter === 'all' ? 'bg-brand-500 text-white' : 'bg-zinc-900 text-zinc-400 ring-1 ring-zinc-800 hover:text-white'
              }`}
            >
              All time
            </button>
            {months.map((month) => {
              const [year, monthNumber] = month.split('-')
              const label = new Date(Number(year), Number(monthNumber) - 1, 1).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })
              return (
                <button
                  key={month}
                  type="button"
                  onClick={() => setMonthFilter(month)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    monthFilter === month ? 'bg-brand-500 text-white' : 'bg-zinc-900 text-zinc-400 ring-1 ring-zinc-800 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        )}

        {visibleRecords.length === 0 ? (
          <EmptyState
            title="No check-ins recorded"
            description="Visits from classes and open gym will show up here."
          />
        ) : (
          <Table<Attendance>
            rows={visibleRecords}
            error={error}
            getRowKey={(record) => record.id}
            columns={[
              {
                key: 'date',
                header: 'Checked in',
                render: (record) => <span className="text-zinc-300">{formatDateTime(record.checkInAt)}</span>,
              },
              {
                key: 'class',
                header: 'Session',
                render: (record) => {
                  const cls = classes.find((item) => item.id === record.classId)
                  return cls ? <span className="text-zinc-200">{cls.name}</span> : <span className="text-zinc-500">Open gym</span>
                },
              },
              {
                key: 'checkout',
                header: 'Checked out',
                render: (record) => (
                  <span className="text-zinc-400">
                    {record.checkOutAt ? formatDateTime(record.checkOutAt) : 'Still in gym'}
                  </span>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (record) => (
                  <Badge tone={attendanceStatusTone[record.status]} className="capitalize">
                    {record.status}
                  </Badge>
                ),
              },
            ]}
          />
        )}
      </Card>
    </div>
  )
}