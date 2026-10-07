import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

/** 404 fallback for unknown routes. */
export function NotFound() {
  usePageTitle('Page not found')
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:py-32">
      <p className="font-display text-7xl font-semibold text-brand-500">404</p>
      <h1 className="mt-4 font-display text-3xl font-semibold uppercase tracking-wide text-white">
        Off the map
      </h1>
      <p className="mt-3 text-sm text-zinc-400">
        That page doesn&apos;t exist — or you don&apos;t have access. Head back to a place
        that does.
      </p>
      <Link to="/" className="btn btn-primary mt-8">
        Back to home
      </Link>
    </div>
  )
}