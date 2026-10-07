import type { EntityId, IsoDateString } from './common'

/** Booking lifecycle — mirrors `booking_status` enum. */
export type BookingStatus = 'confirmed' | 'cancelled' | 'waitlisted'

/** A member's reservation for a class instance. */
export interface Booking {
  id: EntityId
  /** FK -> GymClass. */
  classId: EntityId
  /** FK -> User (role = member). */
  memberId: EntityId
  status: BookingStatus
  bookedAt: IsoDateString
  cancelledAt: IsoDateString | null
}

/** Input for creating a booking. */
export interface BookClassInput {
  classId: EntityId
  memberId: EntityId
}