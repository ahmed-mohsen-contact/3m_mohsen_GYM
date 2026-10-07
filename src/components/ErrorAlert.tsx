import { cn } from '../utils/cn'

interface ErrorAlertProps {
  message: string
  onRetry?: () => void
  className?: string
}

/** Non-blocking error banner with an optional retry action. */
export function ErrorAlert({ message, onRetry, className }: ErrorAlertProps) {
  return (
    <div role="alert" className={cn('flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300', className)}>
      <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden>
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.75a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5ZM10 13a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z"
          clipRule="evenodd"
        />
      </svg>
      <div className="flex-1">{message}</div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="shrink-0 font-semibold text-red-200 underline underline-offset-2 hover:text-white">
          Retry
        </button>
      )}
    </div>
  )
}