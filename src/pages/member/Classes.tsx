import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClassSchedule } from '../../components/ClassSchedule'
import { Loader } from '../../components/Loader'
import { PageHeader } from '../../components/PageHeader'
import { useAuth } from '../../hooks/useAuth'
import { useGym } from '../../hooks/useGym'
import { useNow } from '../../hooks/useNow'
import { usePageTitle } from '../../hooks/usePageTitle'
import { cn } from '../../utils/cn'

/** Member class area: full schedule with booking/cancel, plus a "my classes" filter. */
export function Classes() {
  usePageTitle('My Classes')
  const { user } = useAuth()
  const { classes, bookings, getActiveSubscriptionForMember, isLoading } = useGym()
  const now = useNow()

  const [onlyMine, setOnlyMine] = useState(false)

  const hasActiveSubscription = user ? Boolean(getActiveSubscriptionForMember(user.id)) : false

  const upcoming = useMemo(
    () =>
      classes
        .filter((cls) => cls.status === 'scheduled' && new Date(cls.startsAt).getTime() > now)
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    [classes, now],
  )

  const visibleClasses = useMemo(() => {
    if (!onlyMine || !user) return upcoming
    const myClassIds = new Set(
      bookings
        .filter((record) => record.memberId === user.id && record.status === 'confirmed')
        .map((record) => record.classId),
    )
    return upcoming.filter((cls) => myClassIds.has(cls.id))
  }, [onlyMine, upcoming, bookings, user])

  if (isLoading) {
    return <Loader fullScreen label="Loading classes…" />
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="My classes"
        description={
          hasActiveSubscription
            ? 'Book a session or manage the ones you’re in.'
            : 'You need an active membership to book classes.'
        }
        actions={
          <>
            <button
              type="button"
              onClick={() => setOnlyMine((value) => !value)}
              className={cn('btn', onlyMine ? 'btn-primary' : 'btn-secondary')}
            >
              {onlyMine ? 'Showing my classes' : 'Show only mine'}
            </button>
            {!hasActiveSubscription && (
              <Link to="/pricing" className="btn btn-volt">
                Get a membership
              </Link>
            )}
          </>
        }
      />

      <ClassSchedule
        classes={visibleClasses}
        showFilters={!onlyMine}
        emptyTitle={onlyMine ? 'You have no upcoming bookings' : 'No classes right now'}
        emptyDescription={
          onlyMine
            ? 'Book into a class and it will show up here.'
            : 'New sessions are added to the schedule every week.'
        }
      />
    </div>
  )
}