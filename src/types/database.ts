import type { User } from './user'
import type { Plan } from './plan'
import type { Subscription } from './subscription'
import type { GymClass } from './gymClass'
import type { Booking } from './booking'
import type { Payment } from './payment'
import type { Attendance } from './attendance'

/**
 * The complete fake database persisted to localStorage.
 * Each prop maps to a table in the future PostgreSQL schema.
 */
export interface AppDatabase {
  /** Bump to force a reseed when the shape of stored data changes. */
  version: number
  users: User[]
  plans: Plan[]
  subscriptions: Subscription[]
  classes: GymClass[]
  bookings: Booking[]
  payments: Payment[]
  attendance: Attendance[]
}