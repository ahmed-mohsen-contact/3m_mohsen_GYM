import { useState, type FormEvent } from 'react'
import { Modal } from '../../components/Modal'
import { FormField } from '../../components/FormFields'
import { ErrorAlert } from '../../components/ErrorAlert'
import { Loader } from '../../components/Loader'
import { useGym } from '../../hooks/useGym'
import type { PublicUser, Role } from '../../types'
import { isValidEmail } from '../../utils/format'

interface UserFormState {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  isActive: boolean
}

interface UserFormModalProps {
  open: boolean
  /** Which role the member/trainer CRUD page is managing. */
  role: Exclude<Role, 'admin'>
  user?: PublicUser | null
  onClose: () => void
}

function initialForm(user?: PublicUser | null): UserFormState {
  return {
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    password: '',
    isActive: user?.isActive ?? true,
  }
}

/** Shared create/edit dialog used by the Members and Trainers admin pages. */
export function UserFormModal({ open, role, user, onClose }: UserFormModalProps) {
  const { createUser, updateUser, error } = useGym()
  const isEditing = Boolean(user)

  const [form, setForm] = useState<UserFormState>(initialForm(user))
  const [fieldErrors, setFieldErrors] = useState<Partial<UserFormState>>({})
  const [isBusy, setIsBusy] = useState(false)

  const update = (field: keyof UserFormState, value: string | boolean): void => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = (): boolean => {
    const next: Partial<UserFormState> = {}
    if (form.firstName.trim().length < 2) next.firstName = 'First name is required.'
    if (form.lastName.trim().length < 2) next.lastName = 'Last name is required.'
    if (!isValidEmail(form.email)) next.email = 'Enter a valid email address.'
    if (!isEditing && form.password.length < 8) next.password = 'Use at least 8 characters.'
    if (isEditing && form.password && form.password.length < 8) next.password = 'Use at least 8 characters.'
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (!validate()) return

    setIsBusy(true)
    try {
      if (isEditing && user) {
        await updateUser(user.id, {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          isActive: form.isActive,
          ...(form.password ? { password: form.password } : {}),
        })
      } else {
        await createUser({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
          role,
          isActive: form.isActive,
        })
      }
      onClose()
    } catch {
      // Error is surfaced through the gym context and shown below the form.
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      title={`${isEditing ? 'Edit' : 'Add'} ${role}`}
      onClose={onClose}
      size="md"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isBusy}>
            Cancel
          </button>
          <button type="submit" form="user-form" className="btn btn-primary" disabled={isBusy}>
            {isBusy ? <Loader size="sm" label="Saving…" /> : isEditing ? 'Save changes' : `Create ${role}`}
          </button>
        </>
      }
    >
      {error && <ErrorAlert message={error} className="mb-4" />}
      <form id="user-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="First name"
            value={form.firstName}
            onChange={(event) => update('firstName', event.target.value)}
            error={fieldErrors.firstName}
            required
          />
          <FormField
            label="Last name"
            value={form.lastName}
            onChange={(event) => update('lastName', event.target.value)}
            error={fieldErrors.lastName}
            required
          />
        </div>
        <FormField
          label="Email"
          type="email"
          value={form.email}
          onChange={(event) => update('email', event.target.value)}
          error={fieldErrors.email}
          required
        />
        <FormField
          label="Phone"
          type="tel"
          value={form.phone}
          onChange={(event) => update('phone', event.target.value)}
        />
        <FormField
          label={isEditing ? 'New password (optional)' : 'Password'}
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={(event) => update('password', event.target.value)}
          hint={isEditing ? 'Leave blank to keep the current password.' : 'At least 8 characters.'}
          error={fieldErrors.password}
          required={!isEditing}
        />
        <label className="flex items-center gap-2.5 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => update('isActive', event.target.checked)}
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 accent-[#ff5c1f]"
          />
          Account is active
        </label>
      </form>
    </Modal>
  )
}