import { useState, type FormEvent } from 'react'
import { ErrorAlert } from '../../components/ErrorAlert'
import { FormField, SelectField, TextareaField } from '../../components/FormFields'
import { Loader } from '../../components/Loader'
import { Modal } from '../../components/Modal'
import { useGym } from '../../hooks/useGym'
import type { Plan, PlanInterval } from '../../types'

interface PlanFormState {
  name: string
  description: string
  price: string
  interval: PlanInterval
  maxBookings: string
  features: string
  isActive: boolean
}

interface PlanFormModalProps {
  open: boolean
  plan?: Plan | null
  onClose: () => void
}

function initialForm(plan?: Plan | null): PlanFormState {
  return {
    name: plan?.name ?? '',
    description: plan?.description ?? '',
    price: plan ? String(plan.price) : '',
    interval: plan?.interval ?? 'monthly',
    maxBookings: plan ? (plan.maxBookingsPerMonth === null ? '' : String(plan.maxBookingsPerMonth)) : '',
    features: plan?.features.join('\n') ?? '',
    isActive: plan?.isActive ?? true,
  }
}

/** Create/edit dialog for membership plans (admin). */
export function PlanFormModal({ open, plan, onClose }: PlanFormModalProps) {
  const { createPlan, updatePlan, error } = useGym()
  const isEditing = Boolean(plan)

  const [form, setForm] = useState<PlanFormState>(initialForm(plan))
  const [fieldErrors, setFieldErrors] = useState<Partial<PlanFormState>>({})
  const [isBusy, setIsBusy] = useState(false)

  const update = <K extends keyof PlanFormState>(field: K, value: PlanFormState[K]): void => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = (): boolean => {
    const next: Partial<PlanFormState> = {}
    const parsedPrice = Number(form.price)
    const parsedBookings = form.maxBookings === '' ? null : Number(form.maxBookings)
    if (form.name.trim().length < 2) next.name = 'Plan name is required.'
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) next.price = 'Enter a price greater than 0.'
    if (parsedBookings !== null && (!Number.isInteger(parsedBookings) || parsedBookings < 0)) {
      next.maxBookings = 'Use a whole number or leave empty for unlimited.'
    }
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (!validate()) return

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      interval: form.interval,
      maxBookingsPerMonth: form.maxBookings === '' ? null : Number(form.maxBookings),
      features: form.features
        .split('\n')
        .map((feature) => feature.trim())
        .filter(Boolean),
      isActive: form.isActive,
    }

    setIsBusy(true)
    try {
      if (isEditing && plan) {
        await updatePlan(plan.id, payload)
      } else {
        await createPlan(payload)
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
      title={isEditing ? 'Edit plan' : 'New plan'}
      onClose={onClose}
      size="md"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isBusy}>
            Cancel
          </button>
          <button type="submit" form="plan-form" className="btn btn-primary" disabled={isBusy}>
            {isBusy ? <Loader size="sm" label="Saving…" /> : isEditing ? 'Save changes' : 'Create plan'}
          </button>
        </>
      }
    >
      {error && <ErrorAlert message={error} className="mb-4" />}
      <form id="plan-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField
          label="Plan name"
          value={form.name}
          onChange={(event) => update('name', event.target.value)}
          error={fieldErrors.name}
          placeholder="e.g. Pro"
          required
        />
        <TextareaField
          label="Description"
          value={form.description}
          onChange={(event) => update('description', event.target.value)}
          placeholder="One or two sentences about the plan."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(event) => update('price', event.target.value)}
            error={fieldErrors.price}
            placeholder="59.00"
            required
          />
          <SelectField
            label="Billing interval"
            value={form.interval}
            onChange={(event) => update('interval', event.target.value as PlanInterval)}
            options={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'quarterly', label: 'Quarterly' },
              { value: 'yearly', label: 'Yearly' },
            ]}
          />
        </div>
        <FormField
          label="Max class bookings / month"
          type="number"
          min="0"
          value={form.maxBookings}
          onChange={(event) => update('maxBookings', event.target.value)}
          error={fieldErrors.maxBookings}
          hint="Leave empty for unlimited."
          placeholder="Unlimited"
        />
        <TextareaField
          label="Included features"
          value={form.features}
          onChange={(event) => update('features', event.target.value)}
          hint="One per line."
          placeholder={'Full gym floor access\nPriority class booking'}
        />
        <label className="flex items-center gap-2.5 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => update('isActive', event.target.checked)}
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 accent-[#ff5c1f]"
          />
          Plan is active (visible on pricing)
        </label>
      </form>
    </Modal>
  )
}