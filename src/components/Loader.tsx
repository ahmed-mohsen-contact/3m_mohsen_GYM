import { cn } from '../utils/cn'

interface LoaderProps {
  /** Accessible description shown next to (or instead of) the spinner. */
  label?: string
  size?: 'sm' | 'md' | 'lg'
  /** Centers the loader in a full-section wrapper. */
  fullScreen?: boolean
  className?: string
}

const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
} as const

/** Branded spinner used for every loading state in the app. */
export function Loader({ label = 'Loading…', size = 'md', fullScreen = false, className }: LoaderProps) {
  const content = (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex items-center justify-center gap-3 text-sm text-zinc-400', className)}
    >
      <span
        aria-hidden
        className={cn(
          'animate-spin rounded-full border-current border-t-transparent text-brand-500',
          sizes[size],
        )}
      />
      <span>{label}</span>
    </div>
  )

  if (fullScreen) {
    return <div className="flex min-h-[60vh] items-center justify-center">{content}</div>
  }
  return content
}