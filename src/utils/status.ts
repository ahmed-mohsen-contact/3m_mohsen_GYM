import type {
  AttendanceStatus,
  BookingStatus,
  ClassStatus,
  PaymentStatus,
  Role,
  SubscriptionStatus,
} from '../types'

/** Semantic tones used by Badge/StatCard across the app. */
export type BadgeTone = 'brand' | 'volt' | 'green' | 'red' | 'amber' | 'zinc' | 'blue'

export const roleTone: Record<Role, BadgeTone> = {
  admin: 'red',
  trainer: 'blue',
  member: 'green',
}

export const subscriptionStatusTone: Record<SubscriptionStatus, BadgeTone> = {
  active: 'green',
  paused: 'amber',
  cancelled: 'red',
  expired: 'zinc',
}

export const bookingStatusTone: Record<BookingStatus, BadgeTone> = {
  confirmed: 'green',
  cancelled: 'red',
  waitlisted: 'amber',
}

export const classStatusTone: Record<ClassStatus, BadgeTone> = {
  scheduled: 'blue',
  completed: 'zinc',
  cancelled: 'red',
}

export const paymentStatusTone: Record<PaymentStatus, BadgeTone> = {
  paid: 'green',
  pending: 'amber',
  failed: 'red',
  refunded: 'zinc',
}

export const attendanceStatusTone: Record<AttendanceStatus, BadgeTone> = {
  present: 'green',
  late: 'amber',
  absent: 'red',
}