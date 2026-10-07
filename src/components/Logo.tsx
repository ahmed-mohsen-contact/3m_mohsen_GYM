import { Link } from 'react-router-dom'
import { cn } from '../utils/cn'

interface LogoProps {
  className?: string
}

/** IronForge brand mark (dumbbell glyph + wordmark). */
export function Logo({ className }: LogoProps) {
  return (
    <Link to="/" className={cn('inline-flex items-center gap-2.5', className)} aria-label="IronForge Fitness — home">
      <svg viewBox="0 0 64 64" className="h-8 w-8 shrink-0" aria-hidden>
        <rect width="64" height="64" rx="14" fill="#0c0a09" stroke="#27272a" strokeWidth="2" />
        <g fill="none" stroke="#ff5c1f" strokeWidth="5" strokeLinecap="round">
          <path d="M10 26v12M18 20v24M24 32h16M40 20v24M48 26v12M54 26v12" />
        </g>
        <circle cx="12" cy="32" r="3" fill="#b6f214" />
        <circle cx="52" cy="32" r="3" fill="#b6f214" />
      </svg>
      <span className="font-display text-lg font-semibold uppercase tracking-widest text-white">
        Iron<span className="text-brand-500">Forge</span>
      </span>
    </Link>
  )
}