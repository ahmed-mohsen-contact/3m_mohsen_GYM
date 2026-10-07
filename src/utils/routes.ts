import type { Role } from '../types'

/** Default landing path for each role after login. */
export function roleHomePath(role: Role): string {
  switch (role) {
    case 'admin':
      return '/admin'
    case 'trainer':
      return '/trainer'
    case 'member':
      return '/member'
  }
}