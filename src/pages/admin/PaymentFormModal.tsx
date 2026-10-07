import { useState, type FormEvent } from 'react'
import { ErrorAlert } from '../../components/ErrorAlert'
import { FormField, SelectField } from '../../components/FormFields'
import { Loader } from '../../components/Loader'
import { Modal } from '../../components/Modal'
import { useGym } from '../../hooks/useGym'
import type { PaymentMethod, PaymentStatus } from '../../types'

interface PaymentFormState {
  userId: string
  description: string
  amount: string
  method: PaymentMethod | ''
  status: PaymentStatus
}

interface PaymentFormModalProps {
  open: boolean
  onClose: () => void
}

/** Manual payment entry for POS/late charges (admin). */
export function PaymentFormModal({ open, onClose }: PaymentFormModalProps) {
  const { members, createPayment, error } = useGym()

  const [form, setForm] = useState<PaymentFormState>({
    userId: '',
    description: '',
    amount: '',
    method: '',
    status: 'paid',
  })
  const [fieldErrors, setFieldErrors] = useState<Partial<PaymentFormState>>({})
  const [isBusy, setIsBusy] = useState(false)

  const update = <K extends keyof PaymentFormState>(field: K, value: PaymentFormState[K]): void => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = (): boolean => {
    const next: Partial<PaymentFormState> = {}
    const amount = Number(form.amount)
    if (!form.userId) next.userId = 'Pick a member.'
    if (form.description.trim().length < 3) next.description = 'Add a short description.'
    if (!Number.isFinite(amount) || amount <= 0) next.amount = 'Enter an amount greater than 0.'
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (!validate()) return

    setIsBusy(true)
    try {
      await createPayment({
        userId: form.userId,
        description: form.description.trim(),
        amount: Number(form.amount),
        method: form.method === '' ? null : form.method,
        status: form.status,
      })
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
      title="Record a payment"
      onClose={onClose}
      size="md"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isBusy}>
            Cancel
          </button>
          <button type="submit" form="payment-form" className="btn btn-primary" disabled={isBusy}>
            {isBusy ? <Loader size="sm" label="Saving…" /> : 'Record payment'}
          </button>
        </>
      }
    >
      {error && <ErrorAlert message={error} className="mb-4" />}
      <form id="payment-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <SelectField
          label="Member"
          value={form.userId}
          onChange={(event) => update('userId', event.target.value)}
          error={fieldErrors.userId}
          options={[
            { value: '', label: 'Select a member…' },
            ...members.map((member) => ({
              value: member.id,
              label: `${member.firstName} ${member.lastName}`,
            })),
          ]}
          required
        />
        <FormField
          label="Description"
          value={form.description}
          onChange={(event) => update('description', event.target.value)}
          error={fieldErrors.description}
          placeholder="e.g. Day-pass fee"
          required
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            label="Amount"
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(event) => update('amount', event.target.value)}
            error={fieldErrors.amount}
            placeholder="25.00"
            required
          />
          <SelectField
            label="Method"
            value={form.method}
            onChange={(event) => update('method', event.target.value as PaymentMethod | '')}
            options={[
              { value: '', label: '—' },
              { value: 'card', label: 'Card' },
              { value: 'cash', label: 'Cash' },
              { value: 'bank_transfer', label: 'Bank transfer' },
            ]}
          />
          <SelectField
            label="Status"
            value={form.status}
            onChange={(event) => update('status', event.target.value as PaymentStatus)}
            options={[
              { value: 'paid', label: 'Paid' },
              { value: 'pending', label: 'Pending' },
              { value: 'failed', label: 'Failed' },
              { value: 'refunded', label: 'Refunded' },
            ]}
          />
        </div>
      </form>
    </Modal>
  )
}