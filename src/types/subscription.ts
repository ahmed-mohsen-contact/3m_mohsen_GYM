import type { EntityId, IsoDateString } from './common'
import type { Payment } from './payment'

/** Lifecycle of a subscription — mirrors `subscription_status` enum. */
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired'

/** A member's membership subscription tied to a Plan. */
export interface Subscription {
  id: EntityId
  memberId: EntityId
  planId: EntityId
  startDate: IsoDateString
  endDate: IsoDateString
  status: SubscriptionStatus
  autoRenew: boolean
  createdAt: IsoDateString
}

/** Result of starting a subscription — the new subscription + its first payment. */
export interface SubscribeResult {
  subscription: Subscription
  payment: Payment
}