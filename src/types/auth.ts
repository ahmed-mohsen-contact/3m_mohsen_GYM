import type { Role } from './user'
import type { PublicUser } from './user'

/** Payload for the login form. */
export interface LoginCredentials {
  email: string
  password: string
}

/** Payload for the registration form (always creates a `member`). */
export interface RegisterInput {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
}

/**
 * What we persist in localStorage instead of a real JWT.
 * The user identity is hydrated from the service layer on boot.
 */
export interface SessionRecord {
  userId: PublicUser['id']
  issuedAt: string
}

/** Pre-seeded login hint surfaced on the Login page for quick demos. */
export interface DemoAccount {
  role: Role
  label: string
  name: string
  email: string
  password: string
}