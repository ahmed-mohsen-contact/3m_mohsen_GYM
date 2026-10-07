import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { Role } from '../types'
import { roleHomePath } from '../utils/routes'
import { Loader } from './Loader'

interface ProtectedRouteProps {
  /** Roles allowed to view the nested routes. */
  roles?: Role[]
}

/**
 * Guards nested routes:
 *  - shows a loader while the session is being restored,
 *  - redirects guests to /login (remembering where they were headed),
 *  - redirects authenticated users with the wrong role to their own home.
 */
export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { user, status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <Loader fullScreen label="Restoring your session…" />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={roleHomePath(user.role)} replace />
  }

  return <Outlet />
}