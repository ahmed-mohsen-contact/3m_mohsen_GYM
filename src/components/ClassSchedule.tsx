import { useMemo, useState } from 'react'
import { useGym } from '../hooks/useGym'
import type { ClassCategory, GymClass } from '../types'
import { cn } from '../utils/cn'
import { ClassCard } from './ClassCard'
import { EmptyState } from './EmptyState'

const FILTERS: Array<{ value: 'all' | ClassCategory; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'strength', label: 'Strength' },
  { value: 'hiit', label: 'HIIT' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'boxing', label: 'Boxing' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'mobility', label: 'Mobility' },
]

interface ClassScheduleProps {
  classes: GymClass[]
  isLoading?: boolean
  showFilters?: boolean
  emptyTitle?: string
  emptyDescription?: string
}

/**
 * Reusable schedule grid with live search + category pills and unified
 * loading/empty states. Used by the public Classes page and member area.
 */
export function ClassSchedule({
  classes,
  isLoading = false,
  showFilters = true,
  emptyTitle = 'No classes to show',
  emptyDescription = 'Check back soon — new sessions are added every week.',
}: ClassScheduleProps) {
  const { getUserById } = useGym()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'all' | ClassCategory>('all')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return classes.filter((cls) => {
      const trainer = getUserById(cls.trainerId)
      const trainerName = trainer ? `${trainer.firstName} ${trainer.lastName}`.toLowerCase() : ''
      const inCategory = category === 'all' || cls.category === category
      const inQuery =
        needle === '' ||
        cls.name.toLowerCase().includes(needle) ||
        cls.room.toLowerCase().includes(needle) ||
        trainerName.includes(needle)
      return inCategory && inQuery
    })
  }, [classes, category, query, getUserById])

  return (
    <div className="space-y-6">
      {showFilters && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter by category">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                role="tab"
                aria-selected={category === filter.value}
                onClick={() => setCategory(filter.value)}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                  category === filter.value
                    ? 'bg-brand-500 text-white'
                    : 'bg-zinc-900 text-zinc-400 ring-1 ring-inset ring-zinc-800 hover:text-white',
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="relative sm:w-64">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.45 4.4l3.07 3.08a.75.75 0 1 1-1.06 1.06l-3.08-3.07A7 7 0 0 1 2 9Z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search classes, rooms, trainers…"
              aria-label="Search classes"
              className="input pl-9"
            />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading classes">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/60" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cls) => (
            <ClassCard key={cls.id} cls={cls} />
          ))}
        </div>
      )}
    </div>
  )
}