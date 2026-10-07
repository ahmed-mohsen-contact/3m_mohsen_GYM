import type { EntityId, IsoDateString } from './common'

/** Application roles — mirrors a `user_role` enum in PostgreSQL. */
export type Role = 'admin' | 'trainer' | 'member'

/** User table. `password` exists only inside the mock service layer. */
export interface User {
  id: EntityId
  firstName: string
  lastName: string
  email: string
  /** Plain text ONLY in the mock layer — a real backend stores a hash. */
  password: string
  role: Role
  phone: string
  avatarUrl: string | null
  isActive: boolean
  createdAt: IsoDateString
  updatedAt: IsoDateString
}

/** Payload used to create a user (register + admin CRUD). */
export interface CreateUserInput {
  firstName: string
  lastName: string
  email: string
  password: string
  role: Role
  phone?: string
  avatarUrl?: string | null
  isActive?: boolean
}

/** Partial payload used to update a user. */
export interface UpdateUserInput {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  role?: Role
  phone?: string
  avatarUrl?: string | null
  isActive?: boolean
}

/** User as exposed to the UI — the password never leaves the service layer. */
export type PublicUser = Omit<User, 'password'>