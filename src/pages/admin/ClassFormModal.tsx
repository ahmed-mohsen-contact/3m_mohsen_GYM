import { useState, type FormEvent } from 'react'
import { ErrorAlert } from '../../components/ErrorAlert'
import { FormField, SelectField, TextareaField } from '../../components/FormFields'
import { Loader } from '../../components/Loader'
import { Modal } from '../../components/Modal'
import { useGym } from '../../hooks/useGym'
import type { ClassCategory, ClassStatus, GymClass } from '../../types'
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '../../utils/format'

interface ClassFormState {
  name: string
  description: string
  category: ClassCategory
  trainerId: string
  capacity: string
  durationMinutes: string
  startsAt: string
  room: string
  status: ClassStatus
}

interface ClassFormModalProps {
  open: boolean
  cls?: GymClass | null
  onClose: () => void
}

function initialForm(cls?: GymClass | null): ClassFormState {
  return {
    name: cls?.name ?? '',
    description: cls?.description ?? '',
    category: cls?.category ?? 'strength',
    trainerId: cls?.trainerId ?? '',
    capacity: cls ? String(cls.capacity) : '12',
    durationMinutes: cls ? String(cls.durationMinutes) : '60',
    startsAt: cls ? toDatetimeLocalValue(cls.startsAt) : toDatetimeLocalValue(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()),
    room: cls?.room ?? '',
    status: cls?.status ?? 'scheduled',
  }
}

/** Create/edit dialog for class sessions (admin). */
export function ClassFormModal({ open, cls, onClose }: ClassFormModalProps) {
  const { trainers, createClass, updateClass, error } = useGym()
  const isEditing = Boolean(cls)

  const [form, setForm] = useState<ClassFormState>(initialForm(cls))
  const [fieldErrors, setFieldErrors] = useState<Partial<ClassFormState>>({})
  const [isBusy, setIsBusy] = useState(false)

  const update = <K extends keyof ClassFormState>(field: K, value: ClassFormState[K]): void => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = (): boolean => {
    const next: Partial<ClassFormState> = {}
    const capacity = Number(form.capacity)
    const duration = Number(form.durationMinutes)
    if (form.name.trim().length < 2) next.name = 'Class name is required.'
    if (!form.trainerId) next.trainerId = 'Pick a trainer.'
    if (!Number.isInteger(capacity) || capacity < 1) next.capacity = 'Capacity must be at least 1.'
    if (!Number.isInteger(duration) || duration < 15) next.durationMinutes = 'Use minutes (15+).'
    if (!form.startsAt) next.startsAt = 'Pick a start time.'
    if (form.room.trim().length < 2) next.room = 'Room is required.'
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (!validate()) return

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      trainerId: form.trainerId,
      capacity: Number(form.capacity),
      durationMinutes: Number(form.durationMinutes),
      startsAt: fromDatetimeLocalValue(form.startsAt),
      room: form.room.trim(),
      status: form.status,
    }

    setIsBusy(true)
    try {
      if (isEditing && cls) {
        await updateClass(cls.id, payload)
      } else {
        await createClass(payload)
      }
      onClose()
    } catch {
      // Error is surfaced through the gym context.
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      title={isEditing ? 'Edit class' : 'Schedule a class'}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isBusy}>
            Cancel
          </button>
          <button type="submit" form="class-form" className="btn btn-primary" disabled={isBusy}>
            {isBusy ? <Loader size="sm" label="Saving…" /> : isEditing ? 'Save changes' : 'Schedule class'}
          </button>
        </>
      }
    >
      {error && <ErrorAlert message={error} className="mb-4" />}
      <form id="class-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Class name"
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            error={fieldErrors.name}
            placeholder="e.g. HIIT Inferno"
            required
          />
          <SelectField
            label="Category"
            value={form.category}
            onChange={(event) => update('category', event.target.value as ClassCategory)}
            options={[
              { value: 'strength', label: 'Strength' },
              { value: 'cardio', label: 'Cardio' },
              { value: 'hiit', label: 'HIIT' },
              { value: 'yoga', label: 'Yoga' },
              { value: 'mobility', label: 'Mobility' },
              { value: 'boxing', label: 'Boxing' },
            ]}
          />
        </div>
        <TextareaField
          label="Description"
          value={form.description}
          onChange={(event) => update('description', event.target.value)}
          placeholder="What will members get out of the session?"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Trainer"
            value={form.trainerId}
            onChange={(event) => update('trainerId', event.target.value)}
            error={fieldErrors.trainerId}
            options={[
              { value: '', label: 'Select a trainer…' },
              ...trainers.map((trainer) => ({
                value: trainer.id,
                label: `${trainer.firstName} ${trainer.lastName}`,
              })),
            ]}
          />
          <FormField
            label="Room / studio"
            value={form.room}
            onChange={(event) => update('room', event.target.value)}
            error={fieldErrors.room}
            placeholder="The Foundry"
            required
          />
        </div>
        <FormField
          label="Starts at"
          type="datetime-local"
          value={form.startsAt}
          onChange={(event) => update('startsAt', event.target.value)}
          error={fieldErrors.startsAt}
          required
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            label="Capacity"
            type="number"
            min="1"
            value={form.capacity}
            onChange={(event) => update('capacity', event.target.value)}
            error={fieldErrors.capacity}
            required
          />
          <FormField
            label="Duration (min)"
            type="number"
            min="15"
            step="5"
            value={form.durationMinutes}
            onChange={(event) => update('durationMinutes', event.target.value)}
            error={fieldErrors.durationMinutes}
            required
          />
          <SelectField
            label="Status"
            value={form.status}
            onChange={(event) => update('status', event.target.value as ClassStatus)}
            options={[
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        </div>
      </form>
    </Modal>
  )
}