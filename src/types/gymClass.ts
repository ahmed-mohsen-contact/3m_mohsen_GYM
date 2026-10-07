import type { EntityId, IsoDateString } from './common'

/** Training category used for scheduling/filtering. */
export type ClassCategory =
  | 'strength'
  | 'cardio'
  | 'hiit'
  | 'yoga'
  | 'mobility'
  | 'boxing'

/** Lifecycle of a class instance — mirrors `class_status` enum. */
export type ClassStatus = 'scheduled' | 'completed' | 'cancelled'

/** A single scheduled group-training session. */
export interface GymClass {
  id: EntityId
  name: string
  description: string
  category: ClassCategory
  /** FK -> User (role = trainer). */
  trainerId: EntityId
  capacity: number
  durationMinutes: number
  startsAt: IsoDateString
  room: string
  status: ClassStatus
  createdAt: IsoDateString
}

/** Payload used to create a class (admin + trainer CRUD). */
export interface CreateClassInput {
  name: string
  description: string
  category: ClassCategory
  trainerId: EntityId
  capacity: number
  durationMinutes: number
  startsAt: IsoDateString
  room: string
  status?: ClassStatus
}

/** Partial payload used to update a class. */
export type UpdateClassInput = Partial<CreateClassInput>