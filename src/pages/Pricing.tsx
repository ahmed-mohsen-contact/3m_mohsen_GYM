import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useGym } from '../hooks/useGym'
import { usePageTitle } from '../hooks/usePageTitle'
import { useReveal } from '../hooks/useReveal'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import { Loader } from '../components/Loader'
import { PageHeader } from '../components/PageHeader'
import { formatCurrency } from '../utils/format'

/** Membership plans. Members with no live subscription can sign up instantly. */
export function Pricing() {
  usePageTitle('Membership Plans')
  const { plans, getActiveSubscriptionForMember, subscribe } = useGym()
  const { user, isAuthenticating } = useAuth()
  const navigate = useNavigate()
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null)
  const { ref: pricingRevealRef } = useReveal<HTMLDivElement>({ delayMs: 40 })

  const myActivePlanId = user ? getActiveSubscriptionForMember(user.id)?.planId : undefined

  const handleSubscribe = async (planId: string): Promise<void> => {
    if (!user) {
      navigate('/login', { state: { from: '/pricing' } })
      return
    }
    setPendingPlanId(planId)
    try {
      const result = await subscribe(user.id, planId)
      if (result) navigate('/member/subscription')
    } catch {
      // Error pops via the gym context banner on the page.
    } finally {
      setPendingPlanId(null)
    }
  }

  const intervalLabel = (interval: string): string =>
    interval === 'yearly' ? '/year' : `/${interval.slice(0, -2)}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Membership plans"
        description="No hidden fees, no contracts. Cancel or pause anytime from your dashboard."
      />

      <div ref={pricingRevealRef} className="reveal grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent = myActivePlanId === plan.id
          const isBusy = pendingPlanId === plan.id
          return (
            <Card
              key={plan.id}
              className={`flex flex-col ${!plan.isActive ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold uppercase text-white">{plan.name}</h2>
                {isCurrent && <Badge tone="volt">Your plan</Badge>}
                {!plan.isActive && <Badge tone="zinc">Archived</Badge>}
              </div>

              <p className="mt-1 text-sm leading-relaxed text-zinc-400">{plan.description}</p>

              <p className="mt-4">
                <span className="font-display text-4xl font-semibold text-white">
                  {formatCurrency(plan.price)}
                </span>
                <span className="text-sm text-zinc-500">{intervalLabel(plan.interval)}</span>
              </p>

              <ul className="mt-5 space-y-2.5 text-sm text-zinc-300">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-volt-400" aria-hidden>
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.7-9.8a.75.75 0 0 0-1.1-1.02l-3.05 3.29-1.15-1.02a.75.75 0 1 0-.98 1.13l1.6 1.42a.75.75 0 0 0 1.04-.05l3.64-3.75Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex-1" />

              {isCurrent ? (
                <Badge tone="green" className="justify-center py-2">
                  Active — manage in your dashboard
                </Badge>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary w-full"
                  disabled={!plan.isActive || isBusy || isAuthenticating}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {isBusy ? (
                    <>
                      <Loader size="sm" label="Processing…" />
                    </>
                  ) : user ? (
                    'Subscribe'
                  ) : (
                    'Sign in to subscribe'
                  )}
                </button>
              )}
            </Card>
          )
        })}
      </div>

      <p className="mt-8 text-center text-sm text-zinc-500">
        Already have an account with an expired plan?{' '}
        <Link to="/member/subscription" className="font-semibold text-brand-400 hover:text-brand-300">
          Manage your subscription →
        </Link>
      </p>
    </div>
  )
}