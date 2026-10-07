import type { EntityId, IsoDateString } from './common'

/** Billing cycle of a membership plan — mirrors `plan_interval` enum. */
export type PlanInterval = 'monthly' | 'quarterly' | 'yearly'

/** Membership plans a member can subscribe to. */
export interface Plan {
  id: EntityId
  name: string
  description: string
  /** Price in the smallest sensible unit is out of scope here; a float maps to `numeric(10,2)`. */
  price: number
  interval: PlanInterval
  /** Class bookings allowed per month; `null` means unlimited. */
  maxBookingsPerMonth: number | null
  features: string[]
  isActive: boolean
  createdAt: IsoDateString
}

/** Payload used to create a plan (admin CRUD). */
export interface CreatePlanInput {
  name: string
  description: string
  price: number
  interval: PlanInterval
  maxBookingsPerMonth?: number | null
  features: string[]
  isActive?: boolean
}

/** Partial payload used to update a plan (admin CRUD). */
export type UpdatePlanInput = Partial<CreatePlanInput>