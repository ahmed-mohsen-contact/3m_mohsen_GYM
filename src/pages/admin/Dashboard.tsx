import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/Badge'
import { Card } from '../../components/Card'
import { EmptyState } from '../../components/EmptyState'
import { Loader } from '../../components/Loader'
import { PageHeader } from '../../components/PageHeader'
import { StatCard } from '../../components/StatCard'
import { Table } from '../../components/Table'
import { useGym } from '../../hooks/useGym'
import { useNow } from '../../hooks/useNow'
import { usePageTitle } from '../../hooks/usePageTitle'
import type { Payment } from '../../types'
import { compactNumber, formatCurrency, formatDateTime } from '../../utils/format'
import { classStatusTone, paymentStatusTone } from '../../utils/status'

/** Admin home: club-wide KPIs, recent payments and the next sessions. */
export function Dashboard() {
  usePageTitle('Admin Dashboard')
  const { members, trainers, plans, subscriptions, classes, bookings, payments, getPlanById, getUserById, isLoading, error } = useGym()
  const now = useNow()

  const stats = useMemo(() => {
    const activeSubscriptions = subscriptions.filter((subscription) => subscription.status === 'active')
    const recurringRevenue = activeSubscriptions.reduce((sum, subscription) => {
      const plan = getPlanById(subscription.planId)
      return sum + (plan?.price ?? 0)
    }, 0)

    const upcomingClasses = classes.filter(
      (cls) => cls.status === 'scheduled' && new Date(cls.startsAt).getTime() > now,
    )
    const scheduledThisWeek = classes.filter((cls) => {
      if (cls.status !== 'scheduled') return false
      const start = new Date(cls.startsAt).getTime()
      const reference = new Date(now)
      const startOfWeek = new Date(now)
      startOfWeek.setHours(0, 0, 0, 0)
      const day = (reference.getDay() + 6) % 7
      startOfWeek.setDate(reference.getDate() - day)
      return start >= startOfWeek.getTime() && start < startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000
    }).length

    const paidVolume = payments
      .filter((payment) => payment.status === 'paid')
      .reduce((sum, payment) => sum + payment.amount, 0)
    const pendingCount = payments.filter((payment) => payment.status === 'pending').length
    const bookingsThisMonth = bookings.filter((record) => {
      const date = new Date(record.bookedAt)
      const reference = new Date(now)
      return date.getMonth() === reference.getMonth() && date.getFullYear() === reference.getFullYear()
    }).length

    return {
      totalMembers: members.length,
      activeSubscriptions: activeSubscriptions.length,
      recurringRevenue,
      upcomingClasses: upcomingClasses.length,
      scheduledThisWeek,
      paidVolume,
      pendingCount,
      bookingsThisMonth,
    }
  }, [members, subscriptions, classes, bookings, payments, getPlanById, now])

  const recentPayments = useMemo(
    () => [...payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6),
    [payments],
  )

  const upcomingClasses = useMemo(
    () =>
      classes
        .filter((cls) => cls.status === 'scheduled' && new Date(cls.startsAt).getTime() > now)
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
        .slice(0, 5),
    [classes, now],
  )

  if (isLoading) {
    return <Loader fullScreen label="Loading club metrics…" />
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Club overview"
        description="How IronForge is doing this week."
        actions={
          <Link to="/admin/members" className="btn btn-primary">
            + Add member
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard label="Members" tone="brand" value={stats.totalMembers} sub={`${compactNumber(stats.activeSubscriptions)} with an active plan`} />
        <StatCard label="Recurring revenue" tone="green" value={formatCurrency(stats.recurringRevenue)} sub="/ month across active plans" />
        <StatCard label="Classes this week" tone="volt" value={stats.scheduledThisWeek} sub={`${stats.upcomingClasses} upcoming total`} />
        <StatCard label="Bookings this month" tone="blue" value={stats.bookingsThisMonth} sub="Class reservations" />
        <StatCard label="Revenue collected" tone="green" value={formatCurrency(stats.paidVolume)} sub="All-time paid volume" />
        <StatCard label="Pending payments" tone="amber" value={stats.pendingCount} sub="Awaiting action" />
        <StatCard label="Trainers" tone="zinc" value={trainers.length} sub="On the coaching staff" />
        <StatCard label="Active plans" tone="zinc" value={plans.filter((plan) => plan.isActive).length} sub={`${plans.length} plans total`} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card
          title="Recent payments"
          description="Latest transactions across the club."
          actions={
            <Link to="/admin/payments" className="btn btn-ghost">
              View all
            </Link>
          }
        >
          {recentPayments.length === 0 ? (
            <EmptyState title="No payments yet" />
          ) : (
            <Table<Payment>
              rows={recentPayments}
              error={error}
              getRowKey={(payment) => payment.id}
              columns={[
                {
                  key: 'member',
                  header: 'Member',
                  render: (payment) => {
                    const member = getUserById(payment.userId)
                    return member ? (
                      <span className="text-zinc-200">
                        {member.firstName} {member.lastName}
                      </span>
                    ) : (
                      <span className="text-zinc-500">Unknown</span>
                    )
                  },
                },
                {
                  key: 'amount',
                  header: 'Amount',
                  render: (payment) => <span className="font-semibold text-white">{formatCurrency(payment.amount)}</span>,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (payment) => (
                    <Badge tone={paymentStatusTone[payment.status]} className="capitalize">
                      {payment.status}
                    </Badge>
                  ),
                },
              ]}
            />
          )}
        </Card>

        <Card
          title="Next sessions"
          description="The next classes on the schedule."
          actions={
            <Link to="/admin/classes" className="btn btn-ghost">
              Manage classes
            </Link>
          }
        >
          {upcomingClasses.length === 0 ? (
            <EmptyState title="Nothing scheduled" description="Schedule a class so sessions keep rolling." />
          ) : (
            <ul className="divide-y divide-zinc-800/70">
              {upcomingClasses.map((cls) => {
                const trainer = getUserById(cls.trainerId)
                return (
                  <li key={cls.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{cls.name}</p>
                      <p className="truncate text-xs text-zinc-500">
                        {formatDateTime(cls.startsAt)} · {cls.room}
                        {trainer ? ` · ${trainer.firstName} ${trainer.lastName}` : ''}
                      </p>
                    </div>
                    <Badge tone={classStatusTone[cls.status]} className="capitalize shrink-0">
                      {cls.status}
                    </Badge>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}