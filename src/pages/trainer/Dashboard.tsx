import { useMemo, useState } from 'react'
import { Badge } from '../../components/Badge'
import { Card } from '../../components/Card'
import { EmptyState } from '../../components/EmptyState'
import { Loader } from '../../components/Loader'
import { Modal } from '../../components/Modal'
import { PageHeader } from '../../components/PageHeader'
import { StatCard } from '../../components/StatCard'
import { Table } from '../../components/Table'
import { useAuth } from '../../hooks/useAuth'
import { useGym } from '../../hooks/useGym'
import { useNow } from '../../hooks/useNow'
import { usePageTitle } from '../../hooks/usePageTitle'
import type { GymClass } from '../../types'
import { cn } from '../../utils/cn'
import { formatDateTime, initials } from '../../utils/format'
import { attendanceStatusTone, classStatusTone } from '../../utils/status'

/** Trainer overview: assigned classes, rosters and check-in status. */
export function Dashboard() {
  usePageTitle('Trainer Dashboard')
  const { user } = useAuth()
  const { classes, bookings, users, attendance, isLoading, error } = useGym()
  const now = useNow()
  const [rosterClass, setRosterClass] = useState<GymClass | null>(null)

  const trainerId = user?.id ?? ''

  const assigned = useMemo(() => classes.filter((cls) => cls.trainerId === trainerId), [classes, trainerId])

  const upcoming = useMemo(
    () =>
      assigned
        .filter((cls) => cls.status === 'scheduled' && new Date(cls.startsAt).getTime() > now)
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    [assigned, now],
  )

  const startOfWeek = useMemo(() => {
    const date = new Date(now)
    const day = (date.getDay() + 6) % 7 // Monday-first
    date.setDate(date.getDate() - day)
    date.setHours(0, 0, 0, 0)
    return date.getTime()
  }, [now])

  const endOfWeek = startOfWeek + 7 * 24 * 60 * 60 * 1000

  const sessionsThisWeek = upcoming.filter((cls) => {
    const start = new Date(cls.startsAt).getTime()
    return start >= startOfWeek && start < endOfWeek
  }).length

  const membersInUpcoming = useMemo(() => {
    const classIds = new Set(upcoming.map((cls) => cls.id))
    return new Set(
      bookings
        .filter((record) => classIds.has(record.classId) && record.status === 'confirmed')
        .map((record) => record.memberId),
    )
  }, [upcoming, bookings])

  const confirmedForClass = (classId: string): number =>
    bookings.filter((record) => record.classId === classId && record.status === 'confirmed').length

  const rosterMembers = (cls: GymClass) => {
    const memberIds = bookings
      .filter((record) => record.classId === cls.id && record.status === 'confirmed')
      .map((record) => record.memberId)
    return users.filter((member) => memberIds.includes(member.id))
  }

  const checkInStatusFor = (cls: GymClass, memberId: string) =>
    attendance.find((record) => record.classId === cls.id && record.memberId === memberId)

  if (isLoading) {
    return <Loader fullScreen label="Loading your classes…" />
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title={`Coach ${user?.lastName ?? ''}`}
        description="Your upcoming sessions and who’s booked in."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Upcoming sessions" tone="brand" value={upcoming.length} sub="You’re assigned to these" />
        <StatCard label="This week" tone="volt" value={sessionsThisWeek} sub="Sessions Mon–Sun" />
        <StatCard label="Members booked" tone="blue" value={membersInUpcoming.size} sub="Across upcoming classes" />
        <StatCard label="Total assigned" tone="zinc" value={assigned.length} sub="Including past sessions" />
      </div>

      <Card
        className="mt-8"
        title="Upcoming classes"
        description="Tap a roster to see who’s booked in and who has checked in."
      >
        {upcoming.length === 0 ? (
          <EmptyState
            title="No upcoming classes"
            description="Classes you’re assigned to will appear here once scheduled."
          />
        ) : (
          <Table<GymClass>
            rows={upcoming}
            error={error}
            getRowKey={(cls) => cls.id}
            columns={[
              {
                key: 'class',
                header: 'Class',
                render: (cls) => (
                  <div>
                    <p className="font-semibold text-white">{cls.name}</p>
                    <p className="text-xs text-zinc-500">{cls.room}</p>
                  </div>
                ),
              },
              {
                key: 'start',
                header: 'Starts',
                render: (cls) => <span className="text-zinc-300">{formatDateTime(cls.startsAt)}</span>,
              },
              {
                key: 'duration',
                header: 'Duration',
                render: (cls) => <span className="text-zinc-400">{cls.durationMinutes} min</span>,
              },
              {
                key: 'booked',
                header: 'Booked',
                render: (cls) => (
                  <span className={cn('font-semibold', confirmedForClass(cls.id) >= cls.capacity ? 'text-red-400' : 'text-zinc-200')}>
                    {confirmedForClass(cls.id)} / {cls.capacity}
                  </span>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (cls) => (
                  <Badge tone={classStatusTone[cls.status]} className="capitalize">
                    {cls.status}
                  </Badge>
                ),
              },
              {
                key: 'roster',
                header: 'Roster',
                cellClassName: 'text-right',
                render: (cls) => (
                  <button type="button" className="btn btn-secondary" onClick={() => setRosterClass(cls)}>
                    View roster
                  </button>
                ),
              },
            ]}
          />
        )}
      </Card>

      <Modal
        open={rosterClass !== null}
        title={rosterClass ? `Roster — ${rosterClass.name}` : ''}
        onClose={() => setRosterClass(null)}
        size="lg"
      >
        {rosterClass && (() => {
          const members = rosterMembers(rosterClass)
          return members.length === 0 ? (
            <EmptyState title="No members booked yet" description="This class still has open spots." />
          ) : (
            <ul className="divide-y divide-zinc-800">
              {members.map((member) => {
                const checkIn = checkInStatusFor(rosterClass, member.id)
                return (
                  <li key={member.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-200">
                        {initials(member.firstName, member.lastName)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="truncate text-xs text-zinc-500">{member.email}</p>
                      </div>
                    </div>
                    {checkIn ? (
                      <Badge tone={attendanceStatusTone[checkIn.status]} className="capitalize">
                        {checkIn.status} · {formatDateTime(checkIn.checkInAt)}
                      </Badge>
                    ) : (
                      <Badge tone="zinc">No check-in yet</Badge>
                    )}
                  </li>
                )
              })}
            </ul>
          )
        })()}
      </Modal>
    </div>
  )
}