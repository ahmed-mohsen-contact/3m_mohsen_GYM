import { useMemo, useState } from 'react'
import { Badge } from '../../components/Badge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { PageHeader } from '../../components/PageHeader'
import { Table } from '../../components/Table'
import { useGym } from '../../hooks/useGym'
import { usePageTitle } from '../../hooks/usePageTitle'
import type { PublicUser, Subscription } from '../../types'
import { formatDate, initials } from '../../utils/format'
import { subscriptionStatusTone } from '../../utils/status'
import { UserFormModal } from './UserFormModal'

/** Latest subscription (by start date) for convenient display. */
function latestSubscription(all: Subscription[], memberId: string): Subscription | undefined {
  return all
    .filter((subscription) => subscription.memberId === memberId)
    .sort((a, b) => b.startDate.localeCompare(a.startDate))[0]
}

/** Admin user management — members table with create/edit/delete. */
export function Members() {
  usePageTitle('Members')
  const { members, subscriptions, plans, isLoading, error, deleteUser } = useGym()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<PublicUser | null>(null)
  const [deletingUser, setDeletingUser] = useState<PublicUser | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const openCreateModal = (): void => {
    setEditingUser(null)
    setModalOpen(true)
  }

  const rows = useMemo(() => [...members].sort((a, b) => a.createdAt.localeCompare(b.createdAt)), [members])

  const handleDelete = async (): Promise<void> => {
    if (!deletingUser) return
    setIsDeleting(true)
    try {
      await deleteUser(deletingUser.id)
      setDeletingUser(null)
    } catch {
      // Error surfaces via the gym context banner in the page.
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Members"
        description="Everyone with a member account — subscriptions shown from their latest record."
        actions={
          <button type="button" className="btn btn-primary" onClick={openCreateModal}>
            + Add member
          </button>
        }
      />

      <Table<PublicUser>
        rows={rows}
        isLoading={isLoading}
        error={error}
        getRowKey={(member) => member.id}
        emptyTitle="No members yet"
        emptyDescription="Members who register will appear here."
        columns={[
          {
            key: 'member',
            header: 'Member',
            render: (member) => (
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-200">
                  {initials(member.firstName, member.lastName)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">
                    {member.firstName} {member.lastName}
                  </p>
                  <p className="truncate text-xs text-zinc-500">{member.email}</p>
                </div>
              </div>
            ),
          },
          {
            key: 'phone',
            header: 'Phone',
            render: (member) => <span className="text-zinc-300">{member.phone || '—'}</span>,
          },
          {
            key: 'subscription',
            header: 'Subscription',
            render: (member) => {
              const subscription = latestSubscription(subscriptions, member.id)
              if (!subscription) return <span className="text-zinc-600">None</span>
              const plan = plans.find((item) => item.id === subscription.planId)
              return (
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-zinc-200">{plan?.name ?? 'Unknown plan'}</span>
                  <Badge tone={subscriptionStatusTone[subscription.status]} className="capitalize">
                    {subscription.status}
                  </Badge>
                </span>
              )
            },
          },
          {
            key: 'joined',
            header: 'Joined',
            render: (member) => <span className="text-zinc-400">{formatDate(member.createdAt)}</span>,
          },
          {
            key: 'active',
            header: 'Status',
            render: (member) =>
              member.isActive ? <Badge tone="green">Active</Badge> : <Badge tone="red">Disabled</Badge>,
          },
          {
            key: 'actions',
            header: 'Actions',
            cellClassName: 'text-right',
            render: (member) => (
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditingUser(member)
                    setModalOpen(true)
                  }}
                >
                  Edit
                </button>
                <button type="button" className="btn btn-ghost text-red-400" onClick={() => setDeletingUser(member)}>
                  Delete
                </button>
              </div>
            ),
          },
        ]}
      />

      <UserFormModal
        key={editingUser?.id ?? 'new-member'}
        open={modalOpen}
        role="member"
        user={editingUser}
        onClose={() => {
          setModalOpen(false)
          setEditingUser(null)
        }}
      />

      <ConfirmDialog
        open={deletingUser !== null}
        title="Delete member?"
        isBusy={isDeleting}
        message={
          deletingUser
            ? `This permanently removes ${deletingUser.firstName} ${deletingUser.lastName}'s account, their bookings and attendance. This cannot be undone.`
            : ''
        }
        onConfirm={handleDelete}
        onCancel={() => setDeletingUser(null)}
      />
    </div>
  )
}