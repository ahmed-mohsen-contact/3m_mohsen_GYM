import type { EntityId, IsoDateString } from './common'

/** Payment instrument — mirrors `payment_method` enum. */
export type PaymentMethod = 'card' | 'cash' | 'bank_transfer'

/** Payment lifecycle — mirrors `payment_status` enum. */
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded'

/** Financial record for subscriptions or manual point-of-sale charges. */
export interface Payment {
  id: EntityId
  /** FK -> User. */
  userId: EntityId
  /** FK -> Subscription, nullable for one-off charges. */
  subscriptionId: EntityId | null
  amount: number
  /** ISO-4217 code; kept for future multi-currency support. */
  currency: string
  method: PaymentMethod | null
  status: PaymentStatus
  description: string
  paidAt: IsoDateString | null
  createdAt: IsoDateString
}

/** Payload used to record a payment (admin CRUD). */
export interface CreatePaymentInput {
  userId: EntityId
  subscriptionId?: EntityId | null
  amount: number
  currency?: string
  method?: PaymentMethod | null
  status?: PaymentStatus
  description: string
  paidAt?: IsoDateString | null
}

/** Partial payload used to update/refund a payment. */
export type UpdatePaymentInput = Partial<CreatePaymentInput>