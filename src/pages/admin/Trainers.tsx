import { useMemo, useState } from 'react'
import { Badge } from '../../components/Badge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { PageHeader } from '../../components/PageHeader'
import { Table } from '../../components/Table'
import { useGym } from '../../hooks/useGym'
import { usePageTitle } from '../../hooks/usePageTitle'
import type { PublicUser } from '../../types'
import { formatDate, initials } from '../../utils/format'
import { UserFormModal } from './UserFormModal'

/** Admin user management — trainer roster with create/edit/delete. */
export function Trainers() {
  usePageTitle('Trainers')
  const { trainers, classes, isLoading, error, deleteUser } = useGym()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<PublicUser | null>(null)
  const [deletingUser, setDeletingUser] = useState<PublicUser | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const rows = useMemo(() => [...trainers].sort((a, b) => a.createdAt.localeCompare(b.createdAt)), [trainers])

  const upcomingClassCountFor = (trainerId: string): number =>
    classes.filter(
      (cls) => cls.trainerId === trainerId && cls.status === 'scheduled' && new Date(cls.startsAt).getTime() > Date.now(),
    ).length

  const handleDelete = async (): Promise<void> => {
    if (!deletingUser) return
    setIsDeleting(true)
    try {
      await deleteUser(deletingUser.id)
      setDeletingUser(null)
    } catch {
      // Error surfaces via the gym context.
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Trainers"
        description="Coaching staff and their current class load."
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEditingUser(null)
              setModalOpen(true)
            }}
          >
            + Add trainer
          </button>
        }
      />

      <Table<PublicUser>
        rows={rows}
        isLoading={isLoading}
        error={error}
        getRowKey={(trainer) => trainer.id}
        emptyTitle="No trainers yet"
        emptyDescription="Coaches you add will appear here."
        columns={[
          {
            key: 'trainer',
            header: 'Trainer',
            render: (trainer) => (
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-sky-700 text-xs font-bold text-white">
                  {initials(trainer.firstName, trainer.lastName)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">
                    {trainer.firstName} {trainer.lastName}
                  </p>
                  <p className="truncate text-xs text-zinc-500">{trainer.email}</p>
                </div>
              </div>
            ),
          },
          {
            key: 'phone',
            header: 'Phone',
            render: (trainer) => <span className="text-zinc-300">{trainer.phone || '—'}</span>,
          },
          {
            key: 'classes',
            header: 'Upcoming classes',
            render: (trainer) => <span className="font-semibold text-white">{upcomingClassCountFor(trainer.id)}</span>,
          },
          {
            key: 'joined',
            header: 'Joined',
            render: (trainer) => <span className="text-zinc-400">{formatDate(trainer.createdAt)}</span>,
          },
          {
            key: 'active',
            header: 'Status',
            render: (trainer) =>
              trainer.isActive ? <Badge tone="green">Active</Badge> : <Badge tone="red">Disabled</Badge>,
          },
          {
            key: 'actions',
            header: 'Actions',
            cellClassName: 'text-right',
            render: (trainer) => (
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditingUser(trainer)
                    setModalOpen(true)
                  }}
                >
                  Edit
                </button>
                <button type="button" className="btn btn-ghost text-red-400" onClick={() => setDeletingUser(trainer)}>
                  Delete
                </button>
              </div>
            ),
          },
        ]}
      />

      <UserFormModal
        key={editingUser?.id ?? 'new-trainer'}
        open={modalOpen}
        role="trainer"
        user={editingUser}
        onClose={() => {
          setModalOpen(false)
          setEditingUser(null)
        }}
      />

      <ConfirmDialog
        open={deletingUser !== null}
        title="Delete trainer?"
        isBusy={isDeleting}
        message={
          deletingUser
            ? `This removes ${deletingUser.firstName} ${deletingUser.lastName} from the staff. Trainers with upcoming classes can't be deleted until those are reassigned.`
            : ''
        }
        onConfirm={handleDelete}
        onCancel={() => setDeletingUser(null)}
      />
    </div>
  )
}