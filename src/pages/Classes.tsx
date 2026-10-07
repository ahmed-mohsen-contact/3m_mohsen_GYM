import { useMemo } from 'react'
import { useGym } from '../hooks/useGym'
import { useNow } from '../hooks/useNow'
import { usePageTitle } from '../hooks/usePageTitle'
import { ClassSchedule } from '../components/ClassSchedule'
import { PageHeader } from '../components/PageHeader'
import { Loader } from '../components/Loader'

/** Public class schedule with search + category filters + booking. */
export function Classes() {
  usePageTitle('Class Schedule')
  const { classes, isLoading } = useGym()
  const now = useNow()

  const upcoming = useMemo(
    () =>
      classes
        .filter((cls) => cls.status === 'scheduled' && new Date(cls.startsAt).getTime() > now)
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    [classes, now],
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Class schedule"
        description="Book a session with one of our coaches. A membership is required to reserve — first class is on us."
        actions={
          <span className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm text-zinc-400 ring-1 ring-inset ring-zinc-800">
            {upcoming.length} sessions coming up
          </span>
        }
      />

      {isLoading ? (
        <Loader fullScreen label="Loading the schedule…" />
      ) : (
        <ClassSchedule classes={upcoming} isLoading={false} />
      )}
    </div>
  )
}