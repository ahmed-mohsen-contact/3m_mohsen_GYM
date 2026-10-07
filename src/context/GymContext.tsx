/**
 * GymContext — the app's single data store.
 *
 * Hydrates every collection from the mock service layer once on mount and
 * keeps React state in sync after each action. Components never call
 * services directly; they use `useGym()`.
 */
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as gymService from '../services/gymService'
import { toErrorMessage } from '../services/client'
import type {
  Attendance,
  Booking,
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
} from '../types'

export interface GymContextValue {
  /* Collections (mirror DB tables). */
  users: PublicUser[]
  members: PublicUser[]
  trainers: PublicUser[]
  plans: Plan[]
  subscriptions: Subscription[]
  classes: GymClass[]
  bookings: Booking[]
  payments: Payment[]
  attendance: Attendance[]

  /* UI state. */
  isLoading: boolean
  isMutating: boolean
  error: string | null
  clearError: () => void
  /** Re-fetches every collection from the "backend". */
  refresh: () => Promise<void>

  /* Member actions. */
  subscribe: (memberId: string, planId: string) => Promise<SubscribeResult>
  cancelSubscription: (subscriptionId: string) => Promise<Subscription>
  bookClass: (classId: string, memberId: string) => Promise<Booking>
  cancelBooking: (bookingId: string) => Promise<Booking>

  /* Admin CRUD — users (members & trainers). */
  createUser: (input: CreateUserInput) => Promise<PublicUser>
  updateUser: (userId: string, patch: UpdateUserInput) => Promise<PublicUser>
  deleteUser: (userId: string) => Promise<string>

  /* Admin CRUD — plans. */
  createPlan: (input: CreatePlanInput) => Promise<Plan>
  updatePlan: (planId: string, patch: UpdatePlanInput) => Promise<Plan>
  deletePlan: (planId: string) => Promise<string>

  /* Admin CRUD — classes. */
  createClass: (input: CreateClassInput) => Promise<GymClass>
  updateClass: (classId: string, patch: UpdateClassInput) => Promise<GymClass>
  deleteClass: (classId: string) => Promise<string>

  /* Admin CRUD — payments. */
  createPayment: (input: CreatePaymentInput) => Promise<Payment>
  updatePayment: (paymentId: string, patch: UpdatePaymentInput) => Promise<Payment>
  deletePayment: (paymentId: string) => Promise<string>

  /* Convenience selectors. */
  getPlanById: (planId: string) => Plan | undefined
  getClassById: (classId: string) => GymClass | undefined
  getUserById: (userId: string) => PublicUser | undefined
  getActiveSubscriptionForMember: (memberId: string) => Subscription | undefined
}

// eslint-disable-next-line react-refresh/only-export-components
export const GymContext = createContext<GymContextValue | undefined>(undefined)

export function GymProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<PublicUser[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [classes, setClasses] = useState<GymClass[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /** Fetches every collection in parallel (single ~300ms "round trip"). */
  const loadCollections = useCallback(async () => {
    const [allUsers, allPlans, allSubs, allClasses, allBookings, allPayments, allAttendance] =
      await Promise.all([
        gymService.getUsers(),
        gymService.getPlans(),
        gymService.getSubscriptions(),
        gymService.getClasses(),
        gymService.getBookings(),
        gymService.getPayments(),
        gymService.getAttendance(),
      ])
    // Clear any stale error only once the load actually succeeds.
    setError(null)
    setUsers(allUsers)
    setPlans(allPlans)
    setSubscriptions(allSubs)
    setClasses(allClasses)
    setBookings(allBookings)
    setPayments(allPayments)
    setAttendance(allAttendance)
  }, [])

  /**
   * Manual re-fetch with the loader shown. The mount effect below shares the
   * same fetch but drives loading independently so nothing runs synchronously
   * inside an effect.
   */
  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      await loadCollections()
    } catch (cause) {
      setError(toErrorMessage(cause))
    } finally {
      setIsLoading(false)
    }
  }, [loadCollections])

  useEffect(() => {
    let cancelled = false

    async function bootstrap(): Promise<void> {
      try {
        await loadCollections()
      } catch (cause) {
        if (!cancelled) setError(toErrorMessage(cause))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void bootstrap()
    return () => {
      cancelled = true
    }
  }, [loadCollections])

  /** Wraps every mutation: pending flag on, errors normalized & surfaced. */
  const mutate = useCallback(async <T,>(action: () => Promise<T>): Promise<T> => {
    setIsMutating(true)
    setError(null)
    try {
      return await action()
    } catch (cause) {
      setError(toErrorMessage(cause))
      throw cause
    } finally {
      setIsMutating(false)
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  /* ------------------------------------------------------------------ */
  /* Member actions                                                      */
  /* ------------------------------------------------------------------ */

  const subscribe = useCallback(
    (memberId: string, planId: string) =>
      mutate(async () => {
        const result = await gymService.subscribe(memberId, planId)
        setSubscriptions((prev) => [...prev, result.subscription])
        setPayments((prev) => [result.payment, ...prev])
        return result
      }),
    [mutate],
  )

  const cancelSubscription = useCallback(
    (subscriptionId: string) =>
      mutate(async () => {
        const updated = await gymService.cancelSubscription(subscriptionId)
        setSubscriptions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
        return updated
      }),
    [mutate],
  )

  const bookClass = useCallback(
    (classId: string, memberId: string) =>
      mutate(async () => {
        const record = await gymService.bookClass({ classId, memberId })
        setBookings((prev) => [record, ...prev])
        return record
      }),
    [mutate],
  )

  const cancelBooking = useCallback(
    (bookingId: string) =>
      mutate(async () => {
        const updated = await gymService.cancelBooking(bookingId)
        setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
        return updated
      }),
    [mutate],
  )

  /* ------------------------------------------------------------------ */
  /* Admin CRUD — users                                                  */
  /* ------------------------------------------------------------------ */

  const createUser = useCallback(
    (input: CreateUserInput) =>
      mutate(async () => {
        const user = await gymService.createUser(input)
        setUsers((prev) => [...prev, user])
        return user
      }),
    [mutate],
  )

  const updateUser = useCallback(
    (userId: string, patch: UpdateUserInput) =>
      mutate(async () => {
        const user = await gymService.updateUser(userId, patch)
        setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)))
        return user
      }),
    [mutate],
  )

  const deleteUser = useCallback(
    (userId: string) =>
      mutate(async () => {
        const id = await gymService.deleteUser(userId)
        setUsers((prev) => prev.filter((u) => u.id !== id))
        // Cascade removal mirrors the service-side cascades.
        setSubscriptions((prev) => prev.filter((s) => s.memberId !== id))
        setBookings((prev) => prev.filter((b) => b.memberId !== id))
        setPayments((prev) => prev.filter((p) => p.userId !== id))
        setAttendance((prev) => prev.filter((a) => a.memberId !== id))
        return id
      }),
    [mutate],
  )

  /* ------------------------------------------------------------------ */
  /* Admin CRUD — plans                                                  */
  /* ------------------------------------------------------------------ */

  const createPlan = useCallback(
    (input: CreatePlanInput) =>
      mutate(async () => {
        const plan = await gymService.createPlan(input)
        setPlans((prev) => [...prev, plan])
        return plan
      }),
    [mutate],
  )

  const updatePlan = useCallback(
    (planId: string, patch: UpdatePlanInput) =>
      mutate(async () => {
        const plan = await gymService.updatePlan(planId, patch)
        setPlans((prev) => prev.map((p) => (p.id === plan.id ? plan : p)))
        return plan
      }),
    [mutate],
  )

  const deletePlan = useCallback(
    (planId: string) =>
      mutate(async () => {
        const id = await gymService.deletePlan(planId)
        setPlans((prev) => prev.filter((p) => p.id !== id))
        return id
      }),
    [mutate],
  )

  /* ------------------------------------------------------------------ */
  /* Admin CRUD — classes                                                */
  /* ------------------------------------------------------------------ */

  const createClass = useCallback(
    (input: CreateClassInput) =>
      mutate(async () => {
        const cls = await gymService.createClass(input)
        setClasses((prev) => [...prev, cls].sort((a, b) => a.startsAt.localeCompare(b.startsAt)))
        return cls
      }),
    [mutate],
  )

  const updateClass = useCallback(
    (classId: string, patch: UpdateClassInput) =>
      mutate(async () => {
        const cls = await gymService.updateClass(classId, patch)
        setClasses((prev) => prev.map((c) => (c.id === cls.id ? cls : c)))
        return cls
      }),
    [mutate],
  )

  const deleteClass = useCallback(
    (classId: string) =>
      mutate(async () => {
        const id = await gymService.deleteClass(classId)
        setClasses((prev) => prev.filter((c) => c.id !== id))
        setBookings((prev) => prev.filter((b) => b.classId !== id))
        setAttendance((prev) => prev.filter((a) => a.classId !== id))
        return id
      }),
    [mutate],
  )

  /* ------------------------------------------------------------------ */
  /* Admin CRUD — payments                                               */
  /* ------------------------------------------------------------------ */

  const createPayment = useCallback(
    (input: CreatePaymentInput) =>
      mutate(async () => {
        const payment = await gymService.createPayment(input)
        setPayments((prev) => [payment, ...prev])
        return payment
      }),
    [mutate],
  )

  const updatePayment = useCallback(
    (paymentId: string, patch: UpdatePaymentInput) =>
      mutate(async () => {
        const payment = await gymService.updatePayment(paymentId, patch)
        setPayments((prev) => prev.map((p) => (p.id === payment.id ? payment : p)))
        return payment
      }),
    [mutate],
  )

  const deletePayment = useCallback(
    (paymentId: string) =>
      mutate(async () => {
        const id = await gymService.deletePayment(paymentId)
        setPayments((prev) => prev.filter((p) => p.id !== id))
        return id
      }),
    [mutate],
  )

  /* ------------------------------------------------------------------ */
  /* Derived slices + selectors                                          */
  /* ------------------------------------------------------------------ */

  const value = useMemo<GymContextValue>(() => {
    const members = users.filter((user) => user.role === 'member')
    const trainers = users.filter((user) => user.role === 'trainer')

    return {
      users,
      members,
      trainers,
      plans,
      subscriptions,
      classes,
      bookings,
      payments,
      attendance,

      isLoading,
      isMutating,
      error,
      clearError,
      refresh,

      subscribe,
      cancelSubscription,
      bookClass,
      cancelBooking,

      createUser,
      updateUser,
      deleteUser,

      createPlan,
      updatePlan,
      deletePlan,

      createClass,
      updateClass,
      deleteClass,

      createPayment,
      updatePayment,
      deletePayment,

      getPlanById: (planId) => plans.find((plan) => plan.id === planId),
      getClassById: (classId) => classes.find((cls) => cls.id === classId),
      getUserById: (userId) => users.find((user) => user.id === userId),
      getActiveSubscriptionForMember: (memberId) =>
        subscriptions.find(
          (s) =>
            s.memberId === memberId &&
            s.status === 'active' &&
            new Date(s.endDate).getTime() > Date.now(),
        ),
    }
  }, [
    users, plans, subscriptions, classes, bookings, payments, attendance,
    isLoading, isMutating, error, clearError, refresh,
    subscribe, cancelSubscription, bookClass, cancelBooking,
    createUser, updateUser, deleteUser,
    createPlan, updatePlan, deletePlan,
    createClass, updateClass, deleteClass,
    createPayment, updatePayment, deletePayment,
  ])

  return <GymContext.Provider value={value}>{children}</GymContext.Provider>
}