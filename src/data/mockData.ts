/**
 * MOCK DATA — the ONLY module in the app that owns sample data.
 *
 * `createSeedDatabase()` returns a brand-new, fully hydrated fake database
 * every time it is called so a "reset demo data" always starts from a fresh
 * state with relative dates (recent past / upcoming classes).
 *
 * NOTE: Components and Context must NEVER import this file directly —
 * always go through src/services (authService / gymService). Those services
 * will later swap their internals for Axios calls without touching here.
 */
import type {
  AppDatabase,
  Attendance,
  Booking,
  GymClass,
  Payment,
  Plan,
  Subscription,
  User,
} from '../types'

const DAY_MS = 24 * 60 * 60 * 1000

/** ISO date for `days` from today at a given local hour/minute. */
function daysFromNow(days: number, hour: number, minute = 0): string {
  const d = new Date(Date.now() + days * DAY_MS)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

/** Adds `months` to an ISO date, preserving the day/hour. */
function addMonths(iso: string, months: number): string {
  const d = new Date(iso)
  d.setMonth(d.getMonth() + months)
  return d.toISOString()
}

/** Adds `days` to an ISO date, preserving the time. */
function addDays(iso: string, days: number): string {
  return new Date(new Date(iso).getTime() + days * DAY_MS).toISOString()
}

/* ------------------------------------------------------------------ */
/* Users                                                              */
/* ------------------------------------------------------------------ */

const ADMIN: User = {
  id: 'a1',
  firstName: 'Alex',
  lastName: 'Carter',
  email: 'admin@ironforge.fit',
  password: 'admin123',
  role: 'admin',
  phone: '+1 555 010 1100',
  avatarUrl: null,
  isActive: true,
  createdAt: daysFromNow(-400, 9),
  updatedAt: daysFromNow(-2, 9),
}

const TRAINERS: User[] = [
  {
    id: 't1',
    firstName: 'Maya',
    lastName: 'Rodriguez',
    email: 'maya@ironforge.fit',
    password: 'trainer123',
    role: 'trainer',
    phone: '+1 555 010 2201',
    avatarUrl: null,
    isActive: true,
    createdAt: daysFromNow(-360, 9),
    updatedAt: daysFromNow(-10, 9),
  },
  {
    id: 't2',
    firstName: 'Daniel',
    lastName: 'Kim',
    email: 'daniel@ironforge.fit',
    password: 'trainer123',
    role: 'trainer',
    phone: '+1 555 010 2202',
    avatarUrl: null,
    isActive: true,
    createdAt: daysFromNow(-300, 9),
    updatedAt: daysFromNow(-20, 9),
  },
  {
    id: 't3',
    firstName: 'Sofia',
    lastName: 'Bennett',
    email: 'sofia@ironforge.fit',
    password: 'trainer123',
    role: 'trainer',
    phone: '+1 555 010 2203',
    avatarUrl: null,
    isActive: true,
    createdAt: daysFromNow(-280, 9),
    updatedAt: daysFromNow(-5, 9),
  },
]

/**
 * Demo members:
 * m1–m5 active subscriptions | m6 expired | m7 cancelled | m8 none.
 */
const MEMBERS: User[] = [
  {
    id: 'm1',
    firstName: 'Emma',
    lastName: 'Wilson',
    email: 'emma@example.com',
    password: 'member123',
    role: 'member',
    phone: '+1 555 010 3301',
    avatarUrl: null,
    isActive: true,
    createdAt: daysFromNow(-120, 10),
    updatedAt: daysFromNow(-1, 10),
  },
  {
    id: 'm2',
    firstName: 'Liam',
    lastName: 'Chen',
    email: 'liam@example.com',
    password: 'member123',
    role: 'member',
    phone: '+1 555 010 3302',
    avatarUrl: null,
    isActive: true,
    createdAt: daysFromNow(-100, 10),
    updatedAt: daysFromNow(-1, 10),
  },
  {
    id: 'm3',
    firstName: 'Ava',
    lastName: 'Patel',
    email: 'ava@example.com',
    password: 'member123',
    role: 'member',
    phone: '+1 555 010 3303',
    avatarUrl: null,
    isActive: true,
    createdAt: daysFromNow(-90, 10),
    updatedAt: daysFromNow(-3, 10),
  },
  {
    id: 'm4',
    firstName: 'Noah',
    lastName: 'Garcia',
    email: 'noah@example.com',
    password: 'member123',
    role: 'member',
    phone: '+1 555 010 3304',
    avatarUrl: null,
    isActive: true,
    createdAt: daysFromNow(-80, 10),
    updatedAt: daysFromNow(-3, 10),
  },
  {
    id: 'm5',
    firstName: 'Zara',
    lastName: 'Ahmed',
    email: 'zara@example.com',
    password: 'member123',
    role: 'member',
    phone: '+1 555 010 3305',
    avatarUrl: null,
    isActive: true,
    createdAt: daysFromNow(-60, 10),
    updatedAt: daysFromNow(-2, 10),
  },
  {
    id: 'm6',
    firstName: 'Milo',
    lastName: 'Turner',
    email: 'milo@example.com',
    password: 'member123',
    role: 'member',
    phone: '+1 555 010 3306',
    avatarUrl: null,
    isActive: true,
    createdAt: daysFromNow(-150, 10),
    updatedAt: daysFromNow(-70, 10),
  },
  {
    id: 'm7',
    firstName: 'Ivy',
    lastName: 'Brooks',
    email: 'ivy@example.com',
    password: 'member123',
    role: 'member',
    phone: '+1 555 010 3307',
    avatarUrl: null,
    isActive: true,
    createdAt: daysFromNow(-140, 10),
    updatedAt: daysFromNow(-40, 10),
  },
  {
    id: 'm8',
    firstName: 'Leo',
    lastName: 'Novak',
    email: 'leo@example.com',
    password: 'member123',
    role: 'member',
    phone: '+1 555 010 3308',
    avatarUrl: null,
    isActive: true,
    createdAt: daysFromNow(-45, 10),
    updatedAt: daysFromNow(-45, 10),
  },
]

const USERS: User[] = [ADMIN, ...TRAINERS, ...MEMBERS]

/* ------------------------------------------------------------------ */
/* Plans                                                              */
/* ------------------------------------------------------------------ */

const PLANS: Plan[] = [
  {
    id: 'p1',
    name: 'Basic',
    description: 'Everything you need to start. Full gym floor + 4 classes a month.',
    price: 29,
    interval: 'monthly',
    maxBookingsPerMonth: 4,
    features: [
      'Full gym floor access',
      '4 classes per month',
      'Locker room access',
      'IronForge mobile app',
    ],
    isActive: true,
    createdAt: daysFromNow(-400, 9),
  },
  {
    id: 'p2',
    name: 'Pro',
    description: 'For regulars who train hard and want variety.',
    price: 59,
    interval: 'monthly',
    maxBookingsPerMonth: 12,
    features: [
      'Everything in Basic',
      '12 classes per month',
      'Guest pass (1 / month)',
      'Nationwide gym access',
    ],
    isActive: true,
    createdAt: daysFromNow(-400, 9),
  },
  {
    id: 'p3',
    name: 'Elite',
    description: 'Unlimited training with priority booking and sauna.',
    price: 99,
    interval: 'monthly',
    maxBookingsPerMonth: null,
    features: [
      'Unlimited classes',
      'Priority class booking',
      'Sauna + recovery zone',
      'Quarterly body composition scan',
      '1 free PT session / month',
    ],
    isActive: true,
    createdAt: daysFromNow(-400, 9),
  },
  {
    id: 'p4',
    name: 'All-Access Annual',
    description: 'One year of Elite, priced for the long haul. Two months free.',
    price: 499,
    interval: 'yearly',
    maxBookingsPerMonth: null,
    features: [
      'Everything in Elite',
      '12 months for the price of 10',
      'Freeze 4 weeks per year',
      'Friends & family discount',
    ],
    isActive: true,
    createdAt: daysFromNow(-400, 9),
  },
]

/* ------------------------------------------------------------------ */
/* Subscriptions                                                      */
/* ------------------------------------------------------------------ */

function sub(
  id: string,
  memberId: string,
  plan: Plan,
  startOffsetDays: number,
  status: Subscription['status'],
  autoRenew = true,
): Subscription {
  const startDate = daysFromNow(startOffsetDays, 9)
  const months = plan.interval === 'monthly' ? 1 : plan.interval === 'quarterly' ? 3 : 12
  const endDate =
    plan.interval === 'yearly' ? addDays(startDate, 365) : addMonths(startDate, months)
  return { id, memberId, planId: plan.id, startDate, endDate, status, autoRenew, createdAt: startDate }
}

const SUBSCRIPTIONS: Subscription[] = [
  sub('sub1', 'm1', PLANS[2], -10, 'active'), // Emma -> Elite
  sub('sub2', 'm2', PLANS[1], -2, 'active'), // Liam -> Pro
  sub('sub3', 'm3', PLANS[1], -20, 'active'), // Ava -> Pro
  sub('sub4', 'm4', PLANS[3], -60, 'active'), // Noah -> Annual
  sub('sub5', 'm5', PLANS[2], -1, 'active'), // Zara -> Elite
  sub('sub6', 'm6', PLANS[1], -90, 'expired', false), // Milo -> expired
  sub('sub7', 'm7', PLANS[0], -60, 'cancelled', false), // Ivy -> cancelled
]

/* ------------------------------------------------------------------ */
/* Classes                                                            */
/* ------------------------------------------------------------------ */

function gymClass(
  id: string,
  name: string,
  description: string,
  category: GymClass['category'],
  trainerId: string,
  capacity: number,
  durationMinutes: number,
  days: number,
  hour: number,
  minute: number,
  room: string,
  status: GymClass['status'] = 'scheduled',
): GymClass {
  return {
    id,
    name,
    description,
    category,
    trainerId,
    capacity,
    durationMinutes,
    startsAt: daysFromNow(days, hour, minute),
    room,
    status,
    createdAt: daysFromNow(-14, 9),
  }
}

const CLASSES: GymClass[] = [
  gymClass('c1', 'Powerlifting Basics', 'Master the squat, bench and deadlift with technique coaching on every set.', 'strength', 't1', 12, 75, 1, 18, 0, 'The Foundry'),
  gymClass('c2', 'Leg Day Destroyer', 'High-volume lower-body strength session to build serious size.', 'strength', 't1', 16, 60, 2, 6, 30, 'The Foundry'),
  gymClass('c3', 'HIIT Inferno', 'Full-body intervals that torch calories long after the bell rings.', 'hiit', 't2', 20, 45, 1, 7, 0, 'The Turf'),
  gymClass('c4', 'Boxing Fundamentals', 'Footwork, guard and heavy-bag work for any fitness level.', 'boxing', 't2', 14, 60, 0, 18, 30, 'Ring Room'),
  gymClass('c5', 'Kickboxing Conditioning', 'Combat-style conditioning: pads, combos and core work.', 'boxing', 't2', 12, 60, 3, 19, 0, 'Ring Room'),
  gymClass('c6', 'Vinyasa Flow', 'Breath-led yoga flow to build strength and flexibility.', 'yoga', 't3', 20, 60, 1, 18, 30, 'Studio B'),
  gymClass('c7', 'Mobility Reset', 'Improve range of motion and recover from heavy training.', 'mobility', 't3', 24, 45, 2, 12, 0, 'Studio B'),
  gymClass('c8', 'Sunrise Sprint', 'Interval sprint training to kick-start the day.', 'cardio', 't2', 16, 45, 2, 6, 0, 'The Turf'),
  gymClass('c9', 'Upper Body Builder', 'Push, pull and press — hypertrophy style.', 'strength', 't1', 16, 60, 4, 17, 30, 'The Foundry'),
  gymClass('c10', 'Weekend Warrior HIIT', 'Big Saturday session. Bring a towel and leave everything on the turf.', 'hiit', 't2', 24, 60, 5, 10, 0, 'The Turf'),
  gymClass('c11', 'Yoga for Athletes', 'Sport-focused yoga for recovery and performance.', 'yoga', 't3', 18, 60, 5, 9, 0, 'Studio B', 'cancelled'),
  gymClass('c12', 'Power Yoga', 'Strong, athletic yoga flow.', 'yoga', 't3', 18, 60, -2, 18, 0, 'Studio B', 'completed'),
  gymClass('c13', 'Treadmill Intervals', 'Structured speed work on the mill.', 'cardio', 't2', 18, 45, -3, 7, 0, 'The Turf', 'completed'),
  gymClass('c14', 'Foam Rolling & Release', 'Self myofascial release and full-body stretching.', 'mobility', 't3', 22, 45, -1, 12, 0, 'Studio B', 'completed'),
]

/* ------------------------------------------------------------------ */
/* Bookings                                                           */
/* ------------------------------------------------------------------ */

function booking(
  id: string,
  classId: string,
  memberId: string,
  daysAgo: number,
  status: Booking['status'],
): Booking {
  const bookedAt = daysFromNow(-daysAgo, 8)
  return {
    id,
    classId,
    memberId,
    status,
    bookedAt,
    cancelledAt: status === 'cancelled' ? daysFromNow(-daysAgo + 0.5, 12) : null,
  }
}

const BOOKINGS: Booking[] = [
  // c1 — Powerlifting Basics (+1d)
  booking('b1', 'c1', 'm1', 2, 'confirmed'),
  booking('b2', 'c1', 'm2', 2, 'confirmed'),
  booking('b3', 'c1', 'm3', 1, 'confirmed'),
  booking('b4', 'c1', 'm5', 1, 'confirmed'),
  // c2 — Leg Day Destroyer (+2d)
  booking('b5', 'c2', 'm1', 3, 'cancelled'),
  booking('b6', 'c2', 'm4', 2, 'confirmed'),
  booking('b7', 'c2', 'm5', 1, 'confirmed'),
  // c3 — HIIT Inferno (+1d)
  booking('b8', 'c3', 'm2', 2, 'confirmed'),
  booking('b9', 'c3', 'm3', 1, 'confirmed'),
  booking('b10', 'c3', 'm6', 1, 'confirmed'),
  booking('b11', 'c3', 'm7', 2, 'confirmed'),
  // c4 — Boxing Fundamentals (today)
  booking('b12', 'c4', 'm1', 1, 'confirmed'),
  booking('b13', 'c4', 'm2', 1, 'confirmed'),
  booking('b14', 'c4', 'm4', 0, 'confirmed'),
  // c6 — Vinyasa Flow (+1d)
  booking('b15', 'c6', 'm5', 1, 'confirmed'),
  booking('b16', 'c6', 'm7', 1, 'confirmed'),
  // c12 — Power Yoga (completed, -2d)
  booking('b17', 'c12', 'm3', 3, 'confirmed'),
  booking('b18', 'c12', 'm4', 3, 'confirmed'),
  // c13 — Treadmill Intervals (completed, -3d)
  booking('b19', 'c13', 'm1', 4, 'confirmed'),
  booking('b20', 'c13', 'm5', 3, 'confirmed'),
  // c14 — Foam Rolling (completed, -1d)
  booking('b21', 'c14', 'm5', 2, 'confirmed'),
]

/* ------------------------------------------------------------------ */
/* Payments                                                           */
/* ------------------------------------------------------------------ */

const PAYMENTS: Payment[] = [
  {
    id: 'pay1', userId: 'm1', subscriptionId: 'sub1', amount: 99, currency: 'USD',
    method: 'card', status: 'paid', description: 'IronForge membership — Elite (Monthly)',
    paidAt: daysFromNow(-10, 9), createdAt: daysFromNow(-10, 8, 55),
  },
  {
    id: 'pay2', userId: 'm2', subscriptionId: 'sub2', amount: 59, currency: 'USD',
    method: 'card', status: 'paid', description: 'IronForge membership — Pro (Monthly)',
    paidAt: daysFromNow(-2, 9), createdAt: daysFromNow(-2, 8, 55),
  },
  {
    id: 'pay3', userId: 'm3', subscriptionId: 'sub3', amount: 59, currency: 'USD',
    method: 'bank_transfer', status: 'paid', description: 'IronForge membership — Pro (Monthly)',
    paidAt: daysFromNow(-20, 9), createdAt: daysFromNow(-20, 8, 55),
  },
  {
    id: 'pay4', userId: 'm4', subscriptionId: 'sub4', amount: 499, currency: 'USD',
    method: 'card', status: 'paid', description: 'IronForge membership — All-Access Annual',
    paidAt: daysFromNow(-60, 9), createdAt: daysFromNow(-60, 8, 55),
  },
  {
    id: 'pay5', userId: 'm5', subscriptionId: 'sub5', amount: 99, currency: 'USD',
    method: 'card', status: 'paid', description: 'IronForge membership — Elite (Monthly)',
    paidAt: daysFromNow(-1, 9), createdAt: daysFromNow(-1, 8, 55),
  },
  {
    // Upcoming renewal, still awaiting capture.
    id: 'pay6', userId: 'm5', subscriptionId: 'sub5', amount: 99, currency: 'USD',
    method: 'card', status: 'pending', description: 'IronForge membership — Elite (Monthly)',
    paidAt: null, createdAt: daysFromNow(0, 8, 55),
  },
  {
    id: 'pay7', userId: 'm6', subscriptionId: 'sub6', amount: 59, currency: 'USD',
    method: 'cash', status: 'paid', description: 'IronForge membership — Pro (Monthly)',
    paidAt: daysFromNow(-90, 9), createdAt: daysFromNow(-90, 8, 55),
  },
  {
    id: 'pay8', userId: 'm7', subscriptionId: 'sub7', amount: 29, currency: 'USD',
    method: 'card', status: 'refunded', description: 'IronForge membership — Basic (Monthly)',
    paidAt: daysFromNow(-60, 9), createdAt: daysFromNow(-60, 8, 55),
  },
]

/* ------------------------------------------------------------------ */
/* Attendance                                                         */
/* ------------------------------------------------------------------ */

function attendance(
  id: string,
  memberId: string,
  classId: string | null,
  daysAgo: number,
  checkInHour: number,
  checkInMinute: number,
  checkOutHour: number,
  checkOutMinute: number,
  status: Attendance['status'],
): Attendance {
  return {
    id,
    memberId,
    classId,
    checkInAt: daysFromNow(-daysAgo, checkInHour, checkInMinute),
    checkOutAt: daysFromNow(-daysAgo, checkOutHour, checkOutMinute),
    status,
  }
}

const ATTENDANCE: Attendance[] = [
  attendance('att1', 'm1', 'c12', 2, 18, 8, 19, 0, 'present'),
  attendance('att2', 'm3', 'c12', 2, 18, 15, 19, 5, 'late'),
  attendance('att3', 'm4', 'c13', 3, 7, 5, 7, 55, 'present'),
  attendance('att4', 'm5', 'c13', 3, 7, 0, 7, 48, 'present'),
  attendance('att5', 'm5', 'c14', 1, 12, 2, 12, 50, 'present'),
  attendance('att6', 'm1', 'c13', 3, 7, 3, 7, 52, 'present'),
  // Open-gym visit (no class) recorded today.
  attendance('att7', 'm2', null, 0, 18, 2, 19, 30, 'present'),
]

/* ------------------------------------------------------------------ */
/* Seed factory                                                       */
/* ------------------------------------------------------------------ */

/** Builds a fresh AppDatabase with relative dates. Call on first boot/reset. */
export function createSeedDatabase(): AppDatabase {
  return {
    version: 1,
    users: USERS.map((user) => ({ ...user })),
    plans: PLANS.map((plan) => ({ ...plan, features: [...plan.features] })),
    subscriptions: SUBSCRIPTIONS.map((subscription) => ({ ...subscription })),
    classes: CLASSES.map((cls) => ({ ...cls })),
    bookings: BOOKINGS.map((bookingRow) => ({ ...bookingRow })),
    payments: PAYMENTS.map((payment) => ({ ...payment })),
    attendance: ATTENDANCE.map((record) => ({ ...record })),
  }
}