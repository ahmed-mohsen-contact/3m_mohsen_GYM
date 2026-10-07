import type { ReactNode } from 'react'
import type { BadgeTone } from '../utils/status'
import { cn } from '../utils/cn'

const tones: Record<BadgeTone, string> = {
  brand: 'bg-brand-500/15 text-brand-400 ring-brand-500/30',
  volt: 'bg-volt-400/10 text-volt-300 ring-volt-400/30',
  green: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/30',
  red: 'bg-red-500/10 text-red-400 ring-red-500/30',
  amber: 'bg-amber-500/10 text-amber-300 ring-amber-500/30',
  zinc: 'bg-zinc-500/10 text-zinc-400 ring-zinc-500/30',
  blue: 'bg-sky-500/10 text-sky-400 ring-sky-500/30',
}

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}

/** Small status pill with a semantic color tone. */
export function Badge({ tone = 'zinc', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}