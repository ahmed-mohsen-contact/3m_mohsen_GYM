import { useMemo, useState } from 'react'
import { Badge } from '../../components/Badge'
import { Card } from '../../components/Card'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { PageHeader } from '../../components/PageHeader'
import { Table } from '../../components/Table'
import { useGym } from '../../hooks/useGym'
import { usePageTitle } from '../../hooks/usePageTitle'
import type { Payment } from '../../types'
import { formatCurrency, formatDateTime } from '../../utils/format'
import { paymentStatusTone } from '../../utils/status'
import { PaymentFormModal } from './PaymentFormModal'

/** Admin finance — every charge, with quick status actions and recording new payments. */
export function Payments() {
  usePageTitle('Payments')
  const { payments, getUserById, isLoading, error, deletePayment, updatePayment } = useGym()

  const [modalOpen, setModalOpen] = useState(false)
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const rows = useMemo(
    () => [...payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [payments],
  )

  const handleDelete = async (): Promise<void> => {
    if (!deletingPayment) return
    setIsDeleting(true)
    try {
      await deletePayment(deletingPayment.id)
      setDeletingPayment(null)
    } catch {
      // Error surfaces via the gym context.
    } finally {
      setIsDeleting(false)
    }
  }

  const flipStatus = (payment: Payment, nextStatus: Payment['status']): void => {
    void updatePayment(payment.id, { status: nextStatus })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Payments"
        description="Subscriptions and point-of-sale charges across the club."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
            + Record payment
          </button>
        }
      />

      <Card className="mt-2" padded={false}>
        <Table<Payment>
          rows={rows}
          isLoading={isLoading}
          error={error}
          getRowKey={(payment) => payment.id}
          emptyTitle="No payments recorded"
          emptyDescription="Subscriptions and manual charges will show up here."
          columns={[
            {
              key: 'member',
              header: 'Member',
              render: (payment) => {
                const member = getUserById(payment.userId)
                return member ? (
                  <span className="font-medium text-white">
                    {member.firstName} {member.lastName}
                  </span>
                ) : (
                  <span className="text-zinc-500">Unknown</span>
                )
              },
            },
            {
              key: 'description',
              header: 'Description',
              render: (payment) => <span className="max-w-xs truncate text-zinc-300">{payment.description}</span>,
            },
            {
              key: 'amount',
              header: 'Amount',
              render: (payment) => <span className="font-semibold text-white">{formatCurrency(payment.amount, payment.currency)}</span>,
            },
            {
              key: 'method',
              header: 'Method',
              render: (payment) => (
                <span className="capitalize text-zinc-400">{payment.method?.replace('_', ' ') ?? '—'}</span>
              ),
            },
            {
              key: 'created',
              header: 'Created',
              render: (payment) => (
                <span className="text-zinc-400">{formatDateTime(payment.paidAt ?? payment.createdAt)}</span>
              ),
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
            {
              key: 'actions',
              header: 'Actions',
              cellClassName: 'text-right',
              render: (payment) => (
                <div className="flex justify-end gap-2">
                  {payment.status === 'pending' && (
                    <button type="button" className="btn btn-secondary" onClick={() => flipStatus(payment, 'paid')}>
                      Mark paid
                    </button>
                  )}
                  {payment.status === 'paid' && (
                    <button type="button" className="btn btn-secondary" onClick={() => flipStatus(payment, 'refunded')}>
                      Refund
                    </button>
                  )}
                  {(payment.status === 'failed' || payment.status === 'refunded') && (
                    <button type="button" className="btn btn-secondary" onClick={() => flipStatus(payment, 'paid')}>
                      Re-record as paid
                    </button>
                  )}
                  <button type="button" className="btn btn-ghost text-red-400" onClick={() => setDeletingPayment(payment)}>
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <PaymentFormModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <ConfirmDialog
        open={deletingPayment !== null}
        title="Delete payment?"
        isBusy={isDeleting}
        message={
          deletingPayment
            ? `Delete this ${formatCurrency(deletingPayment.amount, deletingPayment.currency)} record? This only removes the payment log entry.`
            : ''
        }
        onConfirm={handleDelete}
        onCancel={() => setDeletingPayment(null)}
      />
    </div>
  )
}