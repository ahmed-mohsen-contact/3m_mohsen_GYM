import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../utils/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  actions?: ReactNode
  /** Adds default padding to the body (default: true). */
  padded?: boolean
}

/** Themed surface with an optional header row — used everywhere for content blocks. */
export function Card({ title, description, actions, padded = true, className, children, ...rest }: CardProps) {
  return (
    <section className={cn('rounded-2xl border border-zinc-800 bg-zinc-900/60', className)} {...rest}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800/70 px-5 py-4">
          <div>
            {title && (
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-white">
                {title}
              </h2>
            )}
            {description && <p className="mt-0.5 text-sm text-zinc-400">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn(padded && 'p-5')}>{children}</div>
    </section>
  )
}