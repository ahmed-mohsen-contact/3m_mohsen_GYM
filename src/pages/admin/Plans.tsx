import { useMemo, useState } from 'react'
import { Badge } from '../../components/Badge'
import { Card } from '../../components/Card'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { PageHeader } from '../../components/PageHeader'
import { Table } from '../../components/Table'
import { useGym } from '../../hooks/useGym'
import { usePageTitle } from '../../hooks/usePageTitle'
import type { Plan } from '../../types'
import { formatCurrency } from '../../utils/format'
import { PlanFormModal } from './PlanFormModal'

/** Admin plan catalog — pricing, features and activation with full CRUD. */
export function Plans() {
  usePageTitle('Plans')
  const { plans, subscriptions, isLoading, error, deletePlan } = useGym()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const rows = useMemo(() => [...plans].sort((a, b) => a.createdAt.localeCompare(b.createdAt)), [plans])

  const subscriberCountFor = (planId: string): number =>
    subscriptions.filter((subscription) => subscription.planId === planId && subscription.status === 'active').length

  const handleDelete = async (): Promise<void> => {
    if (!deletingPlan) return
    setIsDeleting(true)
    try {
      await deletePlan(deletingPlan.id)
      setDeletingPlan(null)
    } catch {
      // Error surfaces via the gym context.
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Membership plans"
        description="What members see on the pricing page. Deactivation keeps past subscribers."
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEditingPlan(null)
              setModalOpen(true)
            }}
          >
            + New plan
          </button>
        }
      />

      <Card className="mt-2" padded={false}>
        <Table<Plan>
          rows={rows}
          isLoading={isLoading}
          error={error}
          getRowKey={(plan) => plan.id}
          emptyTitle="No plans yet"
          emptyDescription="Create your first membership plan to let members subscribe."
          columns={[
            {
              key: 'plan',
              header: 'Plan',
              render: (plan) => (
                <div>
                  <p className="font-semibold text-white">{plan.name}</p>
                  <p className="max-w-xs truncate text-xs text-zinc-500">{plan.description}</p>
                </div>
              ),
            },
            {
              key: 'price',
              header: 'Price',
              render: (plan) => (
                <span className="text-zinc-200">
                  {formatCurrency(plan.price)}
                  <span className="text-zinc-500">/{plan.interval.slice(0, -2)}</span>
                </span>
              ),
            },
            {
              key: 'bookings',
              header: 'Bookings / month',
              render: (plan) => (
                <span className="text-zinc-300">{plan.maxBookingsPerMonth === null ? 'Unlimited' : plan.maxBookingsPerMonth}</span>
              ),
            },
            {
              key: 'features',
              header: 'Features',
              render: (plan) => <span className="text-zinc-300">{plan.features.length}</span>,
            },
            {
              key: 'subscribers',
              header: 'Active subscribers',
              render: (plan) => <span className="font-semibold text-white">{subscriberCountFor(plan.id)}</span>,
            },
            {
              key: 'active',
              header: 'Status',
              render: (plan) =>
                plan.isActive ? <Badge tone="green">Active</Badge> : <Badge tone="zinc">Archived</Badge>,
            },
            {
              key: 'actions',
              header: 'Actions',
              cellClassName: 'text-right',
              render: (plan) => (
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditingPlan(plan)
                      setModalOpen(true)
                    }}
                  >
                    Edit
                  </button>
                  <button type="button" className="btn btn-ghost text-red-400" onClick={() => setDeletingPlan(plan)}>
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <PlanFormModal
        key={editingPlan?.id ?? 'new-plan'}
        open={modalOpen}
        plan={editingPlan}
        onClose={() => {
          setModalOpen(false)
          setEditingPlan(null)
        }}
      />

      <ConfirmDialog
        open={deletingPlan !== null}
        title="Delete plan?"
        isBusy={isDeleting}
        message={
          deletingPlan
            ? `Delete "${deletingPlan.name}"? Plans that still have subscriptions can't be deleted — deactivate them instead.`
            : ''
        }
        onConfirm={handleDelete}
        onCancel={() => setDeletingPlan(null)}
      />
    </div>
  )
}