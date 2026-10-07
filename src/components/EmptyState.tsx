import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title?: string
  description?: string
  action?: ReactNode
}

/** Friendly "nothing to show" block used across tables and lists. */
export function EmptyState({ icon, title = 'Nothing here yet', description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      {icon && <div className="text-zinc-600">{icon}</div>}
      <p className="text-sm font-semibold text-zinc-300">{title}</p>
      {description && <p className="max-w-sm text-sm text-zinc-500">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}