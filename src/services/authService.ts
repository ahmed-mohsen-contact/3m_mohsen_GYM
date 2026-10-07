/**
 * Auth data-access layer.
 *
 * Fake backend for authentication + profile management. Every function is
 * async, waits ~300ms and reads/writes the localStorage "database". The
 * internals can later be swapped for Axios calls without touching callers.
 */
import type {
  DemoAccount,
  LoginCredentials,
  PublicUser,
  RegisterInput,
  UpdateUserInput,
  User,
} from '../types'
import { ApiError, runWithLatency } from './client'
import { readDatabase, writeDatabase } from './localDatabase'

/** Next stable-ish id, prefixed so tables stay readable. */
export function createId(prefix: string): string {
  return `${prefix}_${globalThis.crypto.randomUUID().slice(0, 8)}`
}

/** Removes the password before a user object leaves the service layer. */
export function toPublicUser(user: User): PublicUser {
  const { password: _password, ...publicUser } = user
  return publicUser
}

/** Case-insensitive email lookup. */
function findByEmail(db: ReturnType<typeof readDatabase>, email: string): User | undefined {
  return db.users.find((user) => user.email.toLowerCase() === email.toLowerCase())
}

/** Currently hydrated "now" timestamp. */
function nowIso(): string {
  return new Date().toISOString()
}

/* ------------------------------------------------------------------ */
/* Session & credentials                                               */
/* ------------------------------------------------------------------ */

export interface LoginResult extends PublicUser {}

/** Validates credentials and returns the signed-in user (no password). */
export async function login(credentials: LoginCredentials): Promise<LoginResult> {
  return runWithLatency(() => {
    const db = readDatabase()
    const user = findByEmail(db, credentials.email)

    // Fail with the same message for unknown user or wrong password.
    if (!user || user.password !== credentials.password) {
      throw new ApiError('Invalid email or password.', 401)
    }
    if (!user.isActive) {
      throw new ApiError('This account is disabled. Contact support.', 403)
    }
    return toPublicUser(user)
  })
}

export interface RegisterResult extends PublicUser {}

/** Creates a member account. */
export async function register(input: RegisterInput): Promise<RegisterResult> {
  return runWithLatency(() => {
    const db = readDatabase()

    if (findByEmail(db, input.email)) {
      throw new ApiError('An account with this email already exists.', 409)
    }

    const user: User = {
      id: createId('usr'),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
      role: 'member',
      phone: input.phone?.trim() ?? '',
      avatarUrl: null,
      isActive: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }

    db.users.push(user)
    writeDatabase(db)
    return toPublicUser(user)
  })
}

/** Hydrates a persisted session (called on app boot with the stored user id). */
export async function getSessionUser(userId: string): Promise<PublicUser | null> {
  return runWithLatency(() => {
    const db = readDatabase()
    const user = db.users.find((candidate) => candidate.id === userId)
    if (!user || !user.isActive) return null
    return toPublicUser(user)
  })
}

/** Updates profile fields for the signed-in user. */
export async function updateProfile(
  userId: string,
  patch: UpdateUserInput,
): Promise<PublicUser> {
  return runWithLatency(() => {
    const db = readDatabase()
    const user = db.users.find((candidate) => candidate.id === userId)
    if (!user) throw new ApiError('User not found.', 404)

    if (patch.email && patch.email.toLowerCase() !== user.email.toLowerCase()) {
      const taken = findByEmail(db, patch.email)
      if (taken && taken.id !== userId) {
        throw new ApiError('That email is already in use.', 409)
      }
    }

    Object.assign(user, patch, { email: patch.email?.trim().toLowerCase(), updatedAt: nowIso() })
    writeDatabase(db)
    return toPublicUser(user)
  })
}

/* ------------------------------------------------------------------ */
/* Login page helpers                                                  */
/* ------------------------------------------------------------------ */

/** Demo accounts shown on the Login page so any role can be tried instantly. */
const DEMO_ACCOUNTS: DemoAccount[] = [
  { role: 'admin', label: 'Admin', name: 'Alex Carter', email: 'admin@ironforge.fit', password: 'admin123' },
  { role: 'trainer', label: 'Trainer', name: 'Maya Rodriguez', email: 'maya@ironforge.fit', password: 'trainer123' },
  { role: 'member', label: 'Member', name: 'Emma Wilson', email: 'emma@example.com', password: 'member123' },
]

/** Returns the demo credentials surfaced on the Login page. */
export async function getDemoAccounts(): Promise<DemoAccount[]> {
  return runWithLatency(() => DEMO_ACCOUNTS.map((account) => ({ ...account })))
}

/** No-op placeholder that mirrors `POST /auth/logout` for future parity. */
export async function logout(): Promise<void> {
  return runWithLatency(() => undefined)
}