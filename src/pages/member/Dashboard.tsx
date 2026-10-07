import { Link } from 'react-router-dom'
import { Badge } from '../../components/Badge'
import { Card } from '../../components/Card'
import { ClassCard } from '../../components/ClassCard'
import { EmptyState } from '../../components/EmptyState'
import { Loader } from '../../components/Loader'
import { PageHeader } from '../../components/PageHeader'
import { StatCard } from '../../components/StatCard'
import { useAuth } from '../../hooks/useAuth'
import { useGym } from '../../hooks/useGym'
import { useNow } from '../../hooks/useNow'
import { usePageTitle } from '../../hooks/usePageTitle'
import { formatCurrency, formatDateTime, formatFullDate } from '../../utils/format'
import { subscriptionStatusTone } from '../../utils/status'

/** Member home: plan summary, next class, upcoming bookings and quick links. */
export function Dashboard() {
  usePageTitle('My Dashboard')
  const { user } = useAuth()
  const { plans, classes, bookings, attendance, getActiveSubscriptionForMember, getUserById, isLoading } = useGym()
  const now = useNow()
  const activeSubscription = user ? getActiveSubscriptionForMember(user.id) : undefined
  const activePlan = activeSubscription ? plans.find((plan) => plan.id === activeSubscription.planId) : undefined

  const myConfirmedBookings = user
    ? bookings.filter((record) => record.memberId === user.id && record.status === 'confirmed')
    : []

  const upcomingBookings = myConfirmedBookings
    .flatMap((record) => {
      const cls = classes.find((item) => item.id === record.classId)
      return cls ? [{ record, cls }] : []
    })
    .filter((entry) => new Date(entry.cls.startsAt).getTime() > now)
    .sort((a, b) => a.cls.startsAt.localeCompare(b.cls.startsAt))

  const nextBooking = upcomingBookings[0]

  const visitsThisMonth = user
    ? attendance.filter((record) => {
        if (record.memberId !== user.id) return false
        const checkIn = new Date(record.checkInAt)
        const nowDate = new Date(now)
        return checkIn.getMonth() === nowDate.getMonth() && checkIn.getFullYear() === nowDate.getFullYear()
      })
    : []

  if (isLoading) {
    return <Loader fullScreen label="Loading your dashboard…" />
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title={`Welcome back, ${user?.firstName ?? 'member'}`}
        description="Here’s your training at a glance."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Membership"
          tone={activeSubscription ? 'green' : 'red'}
          value={activePlan?.name ?? 'No active plan'}
          sub={
            activeSubscription
              ? `Renews ${formatFullDate(activeSubscription.endDate)}`
              : 'Choose a plan to book classes'
          }
        />
        <StatCard
          label="Upcoming bookings"
          tone="brand"
          value={upcomingBookings.length}
          sub={nextBooking ? `Next: ${nextBooking.cls.name}` : 'Nothing booked yet'}
        />
        <StatCard
          label="Check-ins this month"
          tone="volt"
          value={visitsThisMonth.length}
          sub="Gym visits, classes and open gym"
        />
        <StatCard label="Plan price" tone="blue" value={activePlan ? formatCurrency(activePlan.price) : '—'} sub={activePlan ? `per ${activePlan.interval}` : undefined} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card
            title="Upcoming bookings"
            description="Classes you’re booked into."
            actions={
              <Link to="/member/classes" className="btn btn-ghost">
                Browse classes
              </Link>
            }
          >
            {upcomingBookings.length === 0 ? (
              <EmptyState
                title="No upcoming classes"
                description="Book a session to get back on the schedule."
                action={
                  <Link to="/member/classes" className="btn btn-primary">
                    Book a class
                  </Link>
                }
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {upcomingBookings.slice(0, 6).map(({ record, cls }) => (
                  <ClassCard key={record.id} cls={cls} />
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Your membership">
            {activeSubscription ? (
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-500">Status</dt>
                  <dd>
                    <Badge tone={subscriptionStatusTone[activeSubscription.status]}>
                      {activeSubscription.status}
                    </Badge>
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-500">Plan</dt>
                  <dd className="font-semibold text-white">{activePlan?.name}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-500">Monthly fee</dt>
                  <dd className="text-white">{activePlan ? formatCurrency(activePlan.price) : '—'}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-500">Renews on</dt>
                  <dd className="text-zinc-300">{formatDateOnly(activeSubscription.endDate)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-500">Auto-renew</dt>
                  <dd className="text-zinc-300">{activeSubscription.autoRenew ? 'On' : 'Off'}</dd>
                </div>
                <Link to="/member/subscription" className="btn btn-secondary mt-2 w-full">
                  Manage subscription
                </Link>
              </dl>
            ) : (
              <div className="space-y-3 text-sm text-zinc-400">
                <p>You don’t have an active membership, so class bookings are paused.</p>
                <Link to="/pricing" className="btn btn-primary w-full">
                  View plans
                </Link>
              </div>
            )}
          </Card>

          {nextBooking && (
            <Card title="Next up">
              <p className="font-display text-lg font-semibold text-white">{nextBooking.cls.name}</p>
              <p className="mt-1 text-sm text-zinc-400">{formatDateTime(nextBooking.cls.startsAt)}</p>
              <p className="mt-1 text-sm text-zinc-500">
                {getUserById(nextBooking.cls.trainerId)
                  ? `${getUserById(nextBooking.cls.trainerId)?.firstName} ${getUserById(nextBooking.cls.trainerId)?.lastName}`
                  : 'Unassigned'}{' '}
                · {nextBooking.cls.room} · {nextBooking.cls.durationMinutes} min
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function formatDateOnly(iso: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso))
}