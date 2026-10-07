import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/Badge'
import { Card } from '../../components/Card'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { EmptyState } from '../../components/EmptyState'
import { Loader } from '../../components/Loader'
import { PageHeader } from '../../components/PageHeader'
import { Table } from '../../components/Table'
import { useAuth } from '../../hooks/useAuth'
import { useGym } from '../../hooks/useGym'
import { usePageTitle } from '../../hooks/usePageTitle'
import type { Payment } from '../../types'
import { formatCurrency, formatDateTime } from '../../utils/format'
import { paymentStatusTone, subscriptionStatusTone } from '../../utils/status'

/** Member subscription center: live plan, payment history and cancel flow. */
export function Subscription() {
  usePageTitle('My Subscription')
  const { user } = useAuth()
  const {
    plans,
    subscriptions,
    payments,
    isLoading,
    error,
    getActiveSubscriptionForMember,
    cancelSubscription,
  } = useGym()

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const mySubscriptions = user ? subscriptions.filter((s) => s.memberId === user.id) : []
  const activeSubscription = user ? getActiveSubscriptionForMember(user.id) : undefined
  const activePlan = activeSubscription ? plans.find((plan) => plan.id === activeSubscription.planId) : undefined
  const myPayments = user ? payments.filter((payment) => payment.userId === user.id) : []

  const handleCancel = async (): Promise<void> => {
    if (!activeSubscription) return
    setIsCancelling(true)
    try {
      await cancelSubscription(activeSubscription.id)
      setConfirmOpen(false)
    } catch {
      // Error surfaced via context.
    } finally {
      setIsCancelling(false)
    }
  }

  if (isLoading) {
    return <Loader fullScreen label="Loading your subscription…" />
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="My subscription"
        description="Track your plan, renewals and payments."
        actions={
          !activeSubscription ? (
            <Link to="/pricing" className="btn btn-primary">
              Choose a plan
            </Link>
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Current plan" className="lg:col-span-1">
          {activeSubscription && activePlan ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-xl font-semibold text-white">{activePlan.name}</h3>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    {formatCurrency(activePlan.price)} / {activePlan.interval}
                  </p>
                </div>
                <Badge tone={subscriptionStatusTone[activeSubscription.status]}>
                  {activeSubscription.status}
                </Badge>
              </div>

              <dl className="space-y-2.5 border-t border-zinc-800 pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Started</dt>
                  <dd className="text-zinc-200">{formatDateTime(activeSubscription.startDate)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Renews</dt>
                  <dd className="text-zinc-200">{formatDateTime(activeSubscription.endDate)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Auto-renew</dt>
                  <dd className="text-zinc-200">{activeSubscription.autoRenew ? 'On' : 'Off'}</dd>
                </div>
              </dl>

              <button
                type="button"
                className="btn btn-secondary w-full"
                onClick={() => setConfirmOpen(true)}
              >
                Cancel subscription
              </button>
              <p className="text-center text-xs text-zinc-600">
                You keep access until the renewal date, then it downgrades to a guest visit pass.
              </p>
            </div>
          ) : (
            <EmptyState
              title="No active plan"
              description={mySubscriptions.length > 0 ? 'Your last subscription is no longer active.' : 'Pick a plan to start training with us.'}
              action={
                <Link to="/pricing" className="btn btn-primary">
                  View plans
                </Link>
              }
            />
          )}
        </Card>

        <Card
          title="Payment history"
          description="Every charge processed against your account."
          className="lg:col-span-2"
        >
          {myPayments.length === 0 ? (
            <EmptyState title="No payments yet" description="Payments for memberships will appear here." />
          ) : (
            <Table<Payment>
              rows={myPayments}
              error={error}
              getRowKey={(payment) => payment.id}
              columns={[
                {
                  key: 'date',
                  header: 'Date',
                  render: (payment) => (
                    <span className="text-zinc-300">
                      {payment.paidAt ? formatDateTime(payment.paidAt) : formatDateTime(payment.createdAt)}
                    </span>
                  ),
                },
                { key: 'description', header: 'Description', render: (payment) => <span className="text-zinc-200">{payment.description}</span> },
                {
                  key: 'amount',
                  header: 'Amount',
                  render: (payment) => <span className="font-semibold text-white">{formatCurrency(payment.amount, payment.currency)}</span>,
                },
                {
                  key: 'method',
                  header: 'Method',
                  render: (payment) => <span className="capitalize text-zinc-400">{payment.method ?? '—'}</span>,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (payment) => (
                    <Badge tone={paymentStatusTone[payment.status]} className="capitalize">
                      {payment.status}
                    </Badge>
                  ),
                },
              ]}
            />
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Cancel subscription?"
        danger={false}
        confirmLabel="Cancel my subscription"
        isBusy={isCancelling}
        message={`Your ${activePlan?.name ?? 'current'} membership stays active until ${activeSubscription ? formatDateTime(activeSubscription.endDate) : 'its renewal date'}. You can resubscribe at any time.`}
        onConfirm={handleCancel}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}