import { useEffect, useState } from 'react'

/**
 * Returns the current timestamp, refreshed on an interval.
 *
 * Time-based views (upcoming classes, schedules, KPI windows) read the clock
 * through this hook instead of calling `Date.now()` directly during render, so
 * React sees a stable value and the UI refreshes itself as time passes.
 */
export function useNow(intervalMs = 60_000): number {
  // Reading the clock once at mount is intentional; the interval keeps it fresh.
  // eslint-disable-next-line react/purity
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])

  return now
}