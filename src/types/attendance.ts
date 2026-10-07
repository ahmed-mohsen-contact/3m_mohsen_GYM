import type { EntityId, IsoDateString } from './common'

/** How a member showed up — mirrors `attendance_status` enum. */
export type AttendanceStatus = 'present' | 'absent' | 'late'

/** A member check-in. `classId` is null for free/open-gym visits. */
export interface Attendance {
  id: EntityId
  /** FK -> User (role = member). */
  memberId: EntityId
  /** FK -> GymClass, nullable for open-gym sessions. */
  classId: EntityId | null
  checkInAt: IsoDateString
  checkOutAt: IsoDateString | null
  status: AttendanceStatus
}

/** Payload used when a member checks in / attendance is recorded. */
export interface CreateAttendanceInput {
  memberId: EntityId
  classId?: EntityId | null
  checkInAt?: IsoDateString
  checkOutAt?: IsoDateString | null
  status?: AttendanceStatus
}