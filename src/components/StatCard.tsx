import type { ReactNode } from 'react'
import type { BadgeTone } from '../utils/status'
import { cn } from '../utils/cn'

interface StatCardProps {
  label: string
  value: ReactNode
  sub?: string
  /** Accent dot color. */
  tone?: BadgeTone
  className?: string
}

const dots: Record<BadgeTone, string> = {
  brand: 'bg-brand-500',
  volt: 'bg-volt-400',
  green: 'bg-emerald-500',
  red: 'bg-red-500',
  amber: 'bg-amber-400',
  zinc: 'bg-zinc-500',
  blue: 'bg-sky-500',
}

/** KPI card for dashboards (members, revenue, upcoming classes, …). */
export function StatCard({ label, value, sub, tone = 'brand', className }: StatCardProps) {
  return (
    <div className={cn('rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
        <span aria-hidden className={cn('h-2 w-2 rounded-full', dots[tone])} />
      </div>
      <p className="mt-2 font-display text-3xl font-semibold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
    </div>
  )
}