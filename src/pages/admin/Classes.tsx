import { useMemo, useState } from 'react'
import { Badge } from '../../components/Badge'
import { Card } from '../../components/Card'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { PageHeader } from '../../components/PageHeader'
import { Table } from '../../components/Table'
import { useGym } from '../../hooks/useGym'
import { usePageTitle } from '../../hooks/usePageTitle'
import type { GymClass } from '../../types'
import { cn } from '../../utils/cn'
import { formatDateTime } from '../../utils/format'
import { classStatusTone } from '../../utils/status'
import { ClassFormModal } from './ClassFormModal'

const categoryLabel: Record<GymClass['category'], string> = {
  strength: 'Strength',
  cardio: 'Cardio',
  hiit: 'HIIT',
  yoga: 'Yoga',
  mobility: 'Mobility',
  boxing: 'Boxing',
}

/** Admin class schedule — full CRUD over every session. */
export function Classes() {
  usePageTitle('Classes')
  const { classes, bookings, getUserById, isLoading, error, deleteClass } = useGym()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<GymClass | null>(null)
  const [deletingClass, setDeletingClass] = useState<GymClass | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const rows = useMemo(
    () => [...classes].sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    [classes],
  )

  const confirmedForClass = (classId: string): number =>
    bookings.filter((record) => record.classId === classId && record.status === 'confirmed').length

  const handleDelete = async (): Promise<void> => {
    if (!deletingClass) return
    setIsDeleting(true)
    try {
      await deleteClass(deletingClass.id)
      setDeletingClass(null)
    } catch {
      // Error surfaces via the gym context.
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Classes"
        description="Every session on the schedule — past, present and upcoming."
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEditingClass(null)
              setModalOpen(true)
            }}
          >
            + Schedule class
          </button>
        }
      />

      <Card className="mt-2" padded={false}>
        <Table<GymClass>
          rows={rows}
          isLoading={isLoading}
          error={error}
          getRowKey={(cls) => cls.id}
          emptyTitle="No classes scheduled"
          emptyDescription="Schedule a session and it will show up here."
          columns={[
            {
              key: 'class',
              header: 'Class',
              render: (cls) => (
                <div>
                  <p className="font-semibold text-white">{cls.name}</p>
                  <p className="max-w-xs truncate text-xs text-zinc-500">{cls.description}</p>
                </div>
              ),
            },
            {
              key: 'start',
              header: 'Starts',
              render: (cls) => <span className="text-zinc-300">{formatDateTime(cls.startsAt)}</span>,
            },
            {
              key: 'category',
              header: 'Category',
              render: (cls) => <Badge tone="brand">{categoryLabel[cls.category]}</Badge>,
            },
            {
              key: 'trainer',
              header: 'Trainer',
              render: (cls) => {
                const trainer = getUserById(cls.trainerId)
                return trainer ? (
                  <span className="text-zinc-200">
                    {trainer.firstName} {trainer.lastName}
                  </span>
                ) : (
                  <span className="text-red-400">Unassigned</span>
                )
              },
            },
            {
              key: 'room',
              header: 'Room',
              render: (cls) => <span className="text-zinc-300">{cls.room}</span>,
            },
            {
              key: 'spots',
              header: 'Spots',
              render: (cls) => {
                const confirmed = confirmedForClass(cls.id)
                const left = Math.max(cls.capacity - confirmed, 0)
                return (
                  <span className={cn('font-medium', left === 0 ? 'text-red-400' : 'text-zinc-200')}>
                    {left} / {cls.capacity}
                  </span>
                )
              },
            },
            {
              key: 'status',
              header: 'Status',
              render: (cls) => (
                <Badge tone={classStatusTone[cls.status]} className="capitalize">
                  {cls.status}
                </Badge>
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              cellClassName: 'text-right',
              render: (cls) => (
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditingClass(cls)
                      setModalOpen(true)
                    }}
                    disabled={cls.status === 'completed'}
                  >
                    Edit
                  </button>
                  <button type="button" className="btn btn-ghost text-red-400" onClick={() => setDeletingClass(cls)}>
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <ClassFormModal
        key={editingClass?.id ?? 'new-class'}
        open={modalOpen}
        cls={editingClass}
        onClose={() => {
          setModalOpen(false)
          setEditingClass(null)
        }}
      />

      <ConfirmDialog
        open={deletingClass !== null}
        title="Delete class?"
        isBusy={isDeleting}
        message={
          deletingClass
            ? `Delete "${deletingClass.name}" on ${formatDateTime(deletingClass.startsAt)}? All bookings for this session are removed.`
            : ''
        }
        onConfirm={handleDelete}
        onCancel={() => setDeletingClass(null)}
      />
    </div>
  )
}