/**
 * Gym data-access layer.
 *
 * Fake backend for the whole gym domain (plans, classes, bookings,
 * subscriptions, payments, attendance) plus admin CRUD for members and
 * trainers. Every function is async, waits ~300ms and persists through
 * `localDatabase`. Swap the internals for Axios later without touching
 * callers.
 */
import type {
  Attendance,
  BookClassInput,
  Booking,
  CreateAttendanceInput,
  CreateClassInput,
  CreatePaymentInput,
  CreatePlanInput,
  CreateUserInput,
  GymClass,
  Payment,
  Plan,
  PublicUser,
  SubscribeResult,
  Subscription,
  UpdateClassInput,
  UpdatePaymentInput,
  UpdatePlanInput,
  UpdateUserInput,
  User,
} from '../types'
import { ApiError, runWithLatency } from './client'
import { createId, toPublicUser } from './authService'
import { readDatabase, writeDatabase } from './localDatabase'

/** Currently hydrated "now" timestamp. */
function nowIso(): string {
  return new Date().toISOString()
}

/** Sorts classes/events by start time, oldest first. */
function byStartDate(a: { startsAt: string }, b: { startsAt: string }): number {
  return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
}

/* ------------------------------------------------------------------ */
/* Users (members + trainers, admin CRUD)                              */
/* ------------------------------------------------------------------ */

/** Returns every user (optionally filtered by role) without passwords. */
export async function getUsers(role?: User['role']): Promise<PublicUser[]> {
  return runWithLatency(() => {
    const db = readDatabase()
    const filtered = role ? db.users.filter((user) => user.role === role) : db.users
    return filtered.map(toPublicUser)
  })
}

/** Convenience: active members only, newest first. */
export async function getMembers(): Promise<PublicUser[]> {
  return runWithLatency(() => {
    const db = readDatabase()
    return db.users
      .filter((user) => user.role === 'member')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(toPublicUser)
  })
}

/** Convenience: trainers only, newest first. */
export async function getTrainers(): Promise<PublicUser[]> {
  return runWithLatency(() => {
    const db = readDatabase()
    return db.users
      .filter((user) => user.role === 'trainer')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(toPublicUser)
  })
}

/** Creates a user (admin CRUD for members & trainers). */
export async function createUser(input: CreateUserInput): Promise<PublicUser> {
  return runWithLatency(() => {
    const db = readDatabase()

    const emailTaken = db.users.some(
      (user) => user.email.toLowerCase() === input.email.trim().toLowerCase(),
    )
    if (emailTaken) throw new ApiError('A user with this email already exists.', 409)

    const user: User = {
      id: createId('usr'),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
      role: input.role,
      phone: input.phone?.trim() ?? '',
      avatarUrl: input.avatarUrl ?? null,
      isActive: input.isActive ?? true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }

    db.users.push(user)
    writeDatabase(db)
    return toPublicUser(user)
  })
}

/** Updates any user (admin CRUD). */
export async function updateUser(userId: string, patch: UpdateUserInput): Promise<PublicUser> {
  return runWithLatency(() => {
    const db = readDatabase()
    const user = db.users.find((candidate) => candidate.id === userId)
    if (!user) throw new ApiError('User not found.', 404)

    if (patch.email) {
      const taken = db.users.some(
        (candidate) =>
          candidate.id !== userId &&
          candidate.email.toLowerCase() === patch.email!.trim().toLowerCase(),
      )
      if (taken) throw new ApiError('That email is already in use.', 409)
    }

    Object.assign(user, patch, {
      email: patch.email?.trim().toLowerCase(),
      updatedAt: nowIso(),
    })
    writeDatabase(db)
    return toPublicUser(user)
  })
}

/**
 * Deletes a user and cascades their dependents (bookings, attendance,
 * subscriptions, payments). Guards:
 *  - trainers who still teach an upcoming class cannot be deleted
 *  - the last admin cannot be deleted
 */
export async function deleteUser(userId: string): Promise<string> {
  return runWithLatency(() => {
    const db = readDatabase()
    const user = db.users.find((candidate) => candidate.id === userId)
    if (!user) throw new ApiError('User not found.', 404)

    if (user.role === 'trainer') {
      const hasUpcomingClass = db.classes.some(
        (cls) =>
          cls.trainerId === userId &&
          cls.status === 'scheduled' &&
          new Date(cls.startsAt).getTime() > Date.now(),
      )
      if (hasUpcomingClass) {
        throw new ApiError('This trainer still has upcoming classes. Reassign them first.', 409)
      }
    }

    if (user.role === 'admin' && db.users.filter((candidate) => candidate.role === 'admin').length <= 1) {
      throw new ApiError('The last admin account cannot be deleted.', 409)
    }

    db.users = db.users.filter((candidate) => candidate.id !== userId)
    db.subscriptions = db.subscriptions.filter((record) => record.memberId !== userId)
    db.bookings = db.bookings.filter((record) => record.memberId !== userId)
    db.attendance = db.attendance.filter((record) => record.memberId !== userId)
    db.payments = db.payments.filter((record) => record.userId !== userId)

    writeDatabase(db)
    return userId
  })
}

/* ------------------------------------------------------------------ */
/* Plans (admin CRUD)                                                  */
/* ------------------------------------------------------------------ */

/** Returns all plans, active first. */
export async function getPlans(): Promise<Plan[]> {
  return runWithLatency(() => {
    const db = readDatabase()
    return [...db.plans].sort(
      (a, b) => Number(b.isActive) - Number(a.isActive) || a.price - b.price,
    )
  })
}

export async function getPlanById(planId: string): Promise<Plan> {
  return runWithLatency(() => {
    const plan = readDatabase().plans.find((candidate) => candidate.id === planId)
    if (!plan) throw new ApiError('Plan not found.', 404)
    return { ...plan, features: [...plan.features] }
  })
}

/** Creates a membership plan (admin CRUD). */
export async function createPlan(input: CreatePlanInput): Promise<Plan> {
  return runWithLatency(() => {
    const db = readDatabase()
    const plan: Plan = {
      id: createId('pln'),
      name: input.name.trim(),
      description: input.description.trim(),
      price: input.price,
      interval: input.interval,
      maxBookingsPerMonth: input.maxBookingsPerMonth ?? null,
      features: input.features.map((feature) => feature.trim()),
      isActive: input.isActive ?? true,
      createdAt: nowIso(),
    }
    db.plans.push(plan)
    writeDatabase(db)
    return { ...plan, features: [...plan.features] }
  })
}

/** Updates a membership plan (admin CRUD). */
export async function updatePlan(planId: string, patch: UpdatePlanInput): Promise<Plan> {
  return runWithLatency(() => {
    const db = readDatabase()
    const plan = db.plans.find((candidate) => candidate.id === planId)
    if (!plan) throw new ApiError('Plan not found.', 404)
    Object.assign(plan, patch)
    writeDatabase(db)
    return { ...plan, features: [...plan.features] }
  })
}

/** Deletes a plan. Blocked while any subscription still references it. */
export async function deletePlan(planId: string): Promise<string> {
  return runWithLatency(() => {
    const db = readDatabase()
    const referenced = db.subscriptions.some((record) => record.planId === planId)
    if (referenced) {
      throw new ApiError('This plan still has subscriptions. Archive it instead.', 409)
    }
    const previous = db.plans.length
    db.plans = db.plans.filter((plan) => plan.id !== planId)
    if (db.plans.length === previous) throw new ApiError('Plan not found.', 404)
    writeDatabase(db)
    return planId
  })
}

/* ------------------------------------------------------------------ */
/* Subscriptions                                                       */
/* ------------------------------------------------------------------ */

export async function getSubscriptions(): Promise<Subscription[]> {
  return runWithLatency(() => [...readDatabase().subscriptions])
}

export async function getSubscriptionsByMember(memberId: string): Promise<Subscription[]> {
  return runWithLatency(() =>
    readDatabase().subscriptions
      .filter((record) => record.memberId === memberId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  )
}

/**
 * Starts a membership subscription for a member on a plan and records the
 * first payment. Blocked when the member already has a live subscription.
 */
export async function subscribe(memberId: string, planId: string): Promise<SubscribeResult> {
  return runWithLatency(() => {
    const db = readDatabase()
    const member = db.users.find((candidate) => candidate.id === memberId)
    if (!member || member.role !== 'member') {
      throw new ApiError('Member not found.', 404)
    }

    const plan = db.plans.find((candidate) => candidate.id === planId)
    if (!plan || !plan.isActive) throw new ApiError('That plan is not available.', 404)

    const now = Date.now()
    const hasLive = db.subscriptions.some(
      (record) => record.memberId === memberId && record.status === 'active' && new Date(record.endDate).getTime() > now,
    )
    if (hasLive) throw new ApiError('You already have an active subscription.', 409)

    const startDate = nowIso()
    const endDate = new Date(startDate)
    if (plan.interval === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else if (plan.interval === 'quarterly') {
      endDate.setMonth(endDate.getMonth() + 3)
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }

    const subscription: Subscription = {
      id: createId('sub'),
      memberId,
      planId,
      startDate,
      endDate: endDate.toISOString(),
      status: 'active',
      autoRenew: true,
      createdAt: startDate,
    }

    const payment: Payment = {
      id: createId('pay'),
      userId: memberId,
      subscriptionId: subscription.id,
      amount: plan.price,
      currency: 'USD',
      method: 'card',
      status: 'paid',
      description: `IronForge membership — ${plan.name}`,
      paidAt: startDate,
      createdAt: startDate,
    }

    db.subscriptions.push(subscription)
    db.payments.push(payment)
    writeDatabase(db)
    return { subscription, payment }
  })
}

/** Cancels a subscription (member profile / admin). */
export async function cancelSubscription(subscriptionId: string): Promise<Subscription> {
  return runWithLatency(() => {
    const db = readDatabase()
    const subscription = db.subscriptions.find((record) => record.id === subscriptionId)
    if (!subscription) throw new ApiError('Subscription not found.', 404)
    if (subscription.status === 'cancelled') {
      throw new ApiError('This subscription is already cancelled.', 409)
    }
    subscription.status = 'cancelled'
    subscription.autoRenew = false
    writeDatabase(db)
    return { ...subscription }
  })
}

/** Deletes a subscription outright (admin CRUD). */
export async function deleteSubscription(subscriptionId: string): Promise<string> {
  return runWithLatency(() => {
    const db = readDatabase()
    const previous = db.subscriptions.length
    db.subscriptions = db.subscriptions.filter((record) => record.id !== subscriptionId)
    if (db.subscriptions.length === previous) throw new ApiError('Subscription not found.', 404)
    writeDatabase(db)
    return subscriptionId
  })
}

/* ------------------------------------------------------------------ */
/* Classes (admin + trainer CRUD)                                      */
/* ------------------------------------------------------------------ */

export async function getClasses(): Promise<GymClass[]> {
  return runWithLatency(() => readDatabase().classes.sort(byStartDate))
}

export async function getClassById(classId: string): Promise<GymClass> {
  return runWithLatency(() => {
    const cls = readDatabase().classes.find((candidate) => candidate.id === classId)
    if (!cls) throw new ApiError('Class not found.', 404)
    return { ...cls }
  })
}

export async function getClassesByTrainer(trainerId: string): Promise<GymClass[]> {
  return runWithLatency(() =>
    readDatabase().classes
      .filter((cls) => cls.trainerId === trainerId)
      .sort(byStartDate),
  )
}

export async function getUpcomingClasses(): Promise<GymClass[]> {
  return runWithLatency(() =>
    readDatabase().classes
      .filter((cls) => cls.status === 'scheduled' && new Date(cls.startsAt).getTime() > Date.now())
      .sort(byStartDate),
  )
}

/** Creates a class (admin CRUD; trainers create their own too). */
export async function createClass(input: CreateClassInput): Promise<GymClass> {
  return runWithLatency(() => {
    const db = readDatabase()
    const trainer = db.users.find((candidate) => candidate.id === input.trainerId)
    if (!trainer || trainer.role !== 'trainer') {
      throw new ApiError('The assigned trainer does not exist.', 400)
    }
    if (input.capacity < 1) throw new ApiError('Capacity must be at least 1.', 400)

    const cls: GymClass = {
      id: createId('cls'),
      name: input.name.trim(),
      description: input.description.trim(),
      category: input.category,
      trainerId: input.trainerId,
      capacity: input.capacity,
      durationMinutes: input.durationMinutes,
      startsAt: input.startsAt,
      room: input.room.trim(),
      status: input.status ?? 'scheduled',
      createdAt: nowIso(),
    }
    db.classes.push(cls)
    writeDatabase(db)
    return { ...cls }
  })
}

/** Updates a class (admin CRUD + trainers). */
export async function updateClass(classId: string, patch: UpdateClassInput): Promise<GymClass> {
  return runWithLatency(() => {
    const db = readDatabase()
    const cls = db.classes.find((candidate) => candidate.id === classId)
    if (!cls) throw new ApiError('Class not found.', 404)

    if (patch.trainerId) {
      const trainer = db.users.find((candidate) => candidate.id === patch.trainerId)
      if (!trainer || trainer.role !== 'trainer') {
        throw new ApiError('The assigned trainer does not exist.', 400)
      }
    }

    const booked = bookingCountForClass(db.bookings, classId)
    if (patch.capacity !== undefined && patch.capacity < booked) {
      throw new ApiError(
        `This class has ${booked} confirmed member(s) — you cannot lower capacity below that.`,
        409,
      )
    }

    Object.assign(cls, patch, { name: patch.name?.trim(), room: patch.room?.trim() })
    writeDatabase(db)
    return { ...cls }
  })
}

/** Deletes a class and its cascade of bookings/attendance (admin CRUD). */
export async function deleteClass(classId: string): Promise<string> {
  return runWithLatency(() => {
    const db = readDatabase()
    const previous = db.classes.length
    db.classes = db.classes.filter((cls) => cls.id !== classId)
    if (db.classes.length === previous) throw new ApiError('Class not found.', 404)
    db.bookings = db.bookings.filter((record) => record.classId !== classId)
    db.attendance = db.attendance.filter((record) => record.classId !== classId)
    writeDatabase(db)
    return classId
  })
}

/* ------------------------------------------------------------------ */
/* Bookings                                                            */
/* ------------------------------------------------------------------ */

export async function getBookings(): Promise<Booking[]> {
  return runWithLatency(() => [...readDatabase().bookings])
}

export async function getBookingsByMember(memberId: string): Promise<Booking[]> {
  return runWithLatency(() =>
    readDatabase().bookings
      .filter((record) => record.memberId === memberId)
      .sort(
        (a, b) =>
          new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime(),
      ),
  )
}

export async function getBookingsForClass(classId: string): Promise<Booking[]> {
  return runWithLatency(() =>
    readDatabase().bookings.filter((record) => record.classId === classId),
  )
}

/** Members with an active booking for a class (used on trainer pages). */
export async function getMembersForClass(classId: string): Promise<PublicUser[]> {
  return runWithLatency(() => {
    const db = readDatabase()
    const memberIds = new Set(
      db.bookings
        .filter((record) => record.classId === classId && record.status === 'confirmed')
        .map((record) => record.memberId),
    )
    return db.users.filter((user) => memberIds.has(user.id)).map(toPublicUser)
  })
}

function bookingCountForClass(bookings: Booking[], classId: string): number {
  return bookings.filter(
    (record) => record.classId === classId && record.status === 'confirmed',
  ).length
}

/**
 * Books a member into a class after validating: class exists and is open,
 * the member has a live subscription, they are not double-booked, and the
 * class is not full.
 */
export async function bookClass(input: BookClassInput): Promise<Booking> {
  return runWithLatency(() => {
    const db = readDatabase()
    const { classId, memberId } = input

    const cls = db.classes.find((candidate) => candidate.id === classId)
    if (!cls) throw new ApiError('Class not found.', 404)
    if (cls.status !== 'scheduled') {
      throw new ApiError('This class is not open for booking.', 409)
    }
    if (new Date(cls.startsAt).getTime() <= Date.now()) {
      throw new ApiError('This class has already started.', 409)
    }

    const member = db.users.find((candidate) => candidate.id === memberId)
    if (!member || member.role !== 'member') {
      throw new ApiError('Member not found.', 404)
    }

    const now = Date.now()
    const hasLiveSubscription = db.subscriptions.some(
      (record) =>
        record.memberId === memberId &&
        record.status === 'active' &&
        new Date(record.endDate).getTime() > now,
    )
    if (!hasLiveSubscription) {
      throw new ApiError('Bookings require an active subscription. Subscribe first.', 402)
    }

    const alreadyBooked = db.bookings.some(
      (record) => record.memberId === memberId && record.classId === classId && record.status === 'confirmed',
    )
    if (alreadyBooked) throw new ApiError('You are already booked into this class.', 409)

    const booked = bookingCountForClass(db.bookings, classId)
    if (booked >= cls.capacity) {
      throw new ApiError('Sorry — this class is full.', 409)
    }

    const record: Booking = {
      id: createId('bkg'),
      classId,
      memberId,
      status: 'confirmed',
      bookedAt: nowIso(),
      cancelledAt: null,
    }
    db.bookings.push(record)
    writeDatabase(db)
    return { ...record }
  })
}

/** Cancels a member's booking (idempotency enforced with a clear error). */
export async function cancelBooking(bookingId: string): Promise<Booking> {
  return runWithLatency(() => {
    const db = readDatabase()
    const record = db.bookings.find((candidate) => candidate.id === bookingId)
    if (!record) throw new ApiError('Booking not found.', 404)
    if (record.status === 'cancelled') {
      throw new ApiError('This booking is already cancelled.', 409)
    }
    record.status = 'cancelled'
    record.cancelledAt = nowIso()
    writeDatabase(db)
    return { ...record }
  })
}

/* ------------------------------------------------------------------ */
/* Payments                                                            */
/* ------------------------------------------------------------------ */

export async function getPayments(): Promise<Payment[]> {
  return runWithLatency(() =>
    [...readDatabase().payments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  )
}

export async function getPaymentsByMember(memberId: string): Promise<Payment[]> {
  return runWithLatency(() =>
    readDatabase().payments
      .filter((record) => record.userId === memberId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  )
}

/** Records a payment manually (admin CRUD / front desk). */
export async function createPayment(input: CreatePaymentInput): Promise<Payment> {
  return runWithLatency(() => {
    const db = readDatabase()
    const member = db.users.find((candidate) => candidate.id === input.userId)
    if (!member) throw new ApiError('Member not found.', 404)

    const payment: Payment = {
      id: createId('pay'),
      userId: input.userId,
      subscriptionId: input.subscriptionId ?? null,
      amount: input.amount,
      currency: input.currency ?? 'USD',
      method: input.method ?? 'card',
      status: input.status ?? 'paid',
      description: input.description.trim(),
      paidAt: input.status === 'paid' ? (input.paidAt ?? nowIso()) : input.paidAt ?? null,
      createdAt: nowIso(),
    }
    db.payments.push(payment)
    writeDatabase(db)
    return { ...payment }
  })
}

/** Updates a payment — supports refunds, mark-as-paid, etc. (admin CRUD). */
export async function updatePayment(paymentId: string, patch: UpdatePaymentInput): Promise<Payment> {
  return runWithLatency(() => {
    const db = readDatabase()
    const payment = db.payments.find((candidate) => candidate.id === paymentId)
    if (!payment) throw new ApiError('Payment not found.', 404)
    Object.assign(payment, patch, {
      paidAt: patch.paidAt ?? payment.paidAt,
    })
    writeDatabase(db)
    return { ...payment }
  })
}

/** Deletes a payment record (admin CRUD). */
export async function deletePayment(paymentId: string): Promise<string> {
  return runWithLatency(() => {
    const db = readDatabase()
    const previous = db.payments.length
    db.payments = db.payments.filter((payment) => payment.id !== paymentId)
    if (db.payments.length === previous) throw new ApiError('Payment not found.', 404)
    writeDatabase(db)
    return paymentId
  })
}

/* ------------------------------------------------------------------ */
/* Attendance                                                          */
/* ------------------------------------------------------------------ */

export async function getAttendance(): Promise<Attendance[]> {
  return runWithLatency(() =>
    [...readDatabase().attendance].sort(
      (a, b) => new Date(b.checkInAt).getTime() - new Date(a.checkInAt).getTime(),
    ),
  )
}

export async function getAttendanceByMember(memberId: string): Promise<Attendance[]> {
  return runWithLatency(() =>
    readDatabase().attendance
      .filter((record) => record.memberId === memberId)
      .sort(
        (a, b) => new Date(b.checkInAt).getTime() - new Date(a.checkInAt).getTime(),
      ),
  )
}

/** Records a member check-in / attendance (front desk, admin). */
export async function createAttendance(input: CreateAttendanceInput): Promise<Attendance> {
  return runWithLatency(() => {
    const db = readDatabase()
    const member = db.users.find((candidate) => candidate.id === input.memberId)
    if (!member || member.role !== 'member') throw new ApiError('Member not found.', 404)

    const record: Attendance = {
      id: createId('att'),
      memberId: input.memberId,
      classId: input.classId ?? null,
      checkInAt: input.checkInAt ?? nowIso(),
      checkOutAt: input.checkOutAt ?? null,
      status: input.status ?? 'present',
    }
    db.attendance.push(record)
    writeDatabase(db)
    return { ...record }
  })
}