import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useGym } from '../hooks/useGym'
import { useNow } from '../hooks/useNow'
import type { GymClass } from '../types'
import { formatDateTime, formatTime } from '../utils/format'
import { Badge } from './Badge'
import { cn } from '../utils/cn'

const categoryLabel: Record<GymClass['category'], string> = {
  strength: 'Strength',
  cardio: 'Cardio',
  hiit: 'HIIT',
  yoga: 'Yoga',
  mobility: 'Mobility',
  boxing: 'Boxing',
}

/**
 * One class "card" on schedule pages. Owns the whole booking interaction:
 * role gates, subscription check, capacity, already-booked state, and the
 * async book/cancel buttons (with per-button pending indicators).
 */
export function ClassCard({ cls }: { cls: GymClass }) {
  const { bookings, bookClass, cancelBooking, getActiveSubscriptionForMember, getUserById } = useGym()
  const { user } = useAuth()
  const [isBooking, setIsBooking] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const now = useNow()

  const trainer = cls.trainerId ? getUserById(cls.trainerId) : undefined

  const confirmedCount = bookings.filter(
    (record) => record.classId === cls.id && record.status === 'confirmed',
  ).length
  const spotsLeft = Math.max(cls.capacity - confirmedCount, 0)
  const isFull = spotsLeft === 0
  const isUpcoming = new Date(cls.startsAt).getTime() > now

  const myActiveBooking = user
    ? bookings.find(
        (record) =>
          record.memberId === user.id && record.classId === cls.id && record.status === 'confirmed',
      )
    : undefined

  const hasActiveSubscription = user ? Boolean(getActiveSubscriptionForMember(user.id)) : false

  const handleBook = async (): Promise<void> => {
    if (!user) return
    setIsBooking(true)
    try {
      await bookClass(cls.id, user.id)
    } catch {
      // Error is surfaced through the gym context; keep the card usable.
    } finally {
      setIsBooking(false)
    }
  }

  const handleCancel = async (): Promise<void> => {
    if (!myActiveBooking) return
    setIsCancelling(true)
    try {
      await cancelBooking(myActiveBooking.id)
    } catch {
      // Error is surfaced through the gym context.
    } finally {
      setIsCancelling(false)
    }
  }

  const isCancelled = cls.status === 'cancelled'
  const isPast = !isUpcoming

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition-colors hover:border-zinc-700">
      <div className="flex items-start justify-between gap-3">
        <Badge tone="brand">{categoryLabel[cls.category]}</Badge>
        {isCancelled ? (
          <Badge tone="red">Cancelled</Badge>
        ) : isPast ? (
          <Badge tone="zinc">Ended</Badge>
        ) : (
          <time className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            {formatTime(cls.startsAt)}
          </time>
        )}
      </div>

      <div>
        <h3 className="font-display text-xl font-semibold text-white">{cls.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{cls.description}</p>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden />
          {trainer ? `${trainer.firstName} ${trainer.lastName}` : 'Unassigned'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-volt-400" aria-hidden />
          {cls.room}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500" aria-hidden />
          {cls.durationMinutes} min
        </span>
      </div>

      <footer className="mt-auto flex items-center justify-between gap-3 border-t border-zinc-800/70 pt-4">
        <p className="text-sm text-zinc-500">
          {isCancelled || !isUpcoming ? (
            <span className="text-zinc-600">{formatDateTime(cls.startsAt)}</span>
          ) : isFull ? (
            <span className="font-medium text-red-400">Full · waitlist available in-gym</span>
          ) : (
            <span>
              <span className="font-semibold text-zinc-200">{spotsLeft}</span> of {cls.capacity} spots
              left
            </span>
          )}
        </p>

        {/* Booking actions */}
        {isCancelled || isPast ? null : !user ? (
          <Link to="/login" state={{ from: '/classes' }} className="btn btn-ghost shrink-0">
            Sign in to book
          </Link>
        ) : user.role !== 'member' ? (
          <Badge tone="zinc">Staff</Badge>
        ) : myActiveBooking ? (
          <button
            type="button"
            className="btn btn-secondary shrink-0"
            onClick={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? 'Cancelling…' : 'Cancel booking'}
          </button>
        ) : isFull ? (
          <button type="button" className="btn btn-secondary shrink-0" disabled>
            Class full
          </button>
        ) : !hasActiveSubscription ? (
          <Link to="/pricing" className="btn btn-ghost shrink-0 text-volt-300">
            Subscribe to book
          </Link>
        ) : (
          <button
            type="button"
            className={cn('btn btn-primary shrink-0', isBooking && 'opacity-60')}
            onClick={handleBook}
            disabled={isBooking}
          >
            {isBooking ? 'Booking…' : 'Book now'}
          </button>
        )}
      </footer>
    </article>
  )
}