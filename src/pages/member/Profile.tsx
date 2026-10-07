import { useState, type FormEvent } from 'react'
import { Badge } from '../../components/Badge'
import { Card } from '../../components/Card'
import { ErrorAlert } from '../../components/ErrorAlert'
import { FormField } from '../../components/FormFields'
import { Loader } from '../../components/Loader'
import { PageHeader } from '../../components/PageHeader'
import { useAuth } from '../../hooks/useAuth'
import { usePageTitle } from '../../hooks/usePageTitle'
import type { UpdateUserInput } from '../../types'
import { formatFullDate, initials, isValidEmail } from '../../utils/format'
import { roleTone } from '../../utils/status'

/** Member profile editor — updates the persisted fake user via the auth service. */
export function Profile() {
  usePageTitle('My Profile')
  const { user, updateProfile, isAuthenticating, error, clearError } = useAuth()

  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  })
  const [errors, setErrors] = useState<Partial<typeof form>>({})
  const [saved, setSaved] = useState(false)

  const update = (field: keyof typeof form, value: string): void => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    setSaved(false)
    clearError()
  }

  const validate = (): boolean => {
    const next: Partial<typeof form> = {}
    if (form.firstName.trim().length < 2) next.firstName = 'First name is required.'
    if (form.lastName.trim().length < 2) next.lastName = 'Last name is required.'
    if (!isValidEmail(form.email)) next.email = 'Enter a valid email address.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (!user || !validate()) return

    const patch: UpdateUserInput = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    }
    try {
      await updateProfile(patch)
      setSaved(true)
    } catch {
      // Error surfaced via context.
    }
  }

  if (!user) {
    return <Loader fullScreen label="Loading profile…" />
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader title="My profile" description="Keep your details up to date." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center py-4 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-2xl font-bold text-white">
              {initials(user.firstName, user.lastName)}
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold text-white">
              {user.firstName} {user.lastName}
            </h2>
            <Badge tone={roleTone[user.role]} className="mt-2 capitalize">
              {user.role}
            </Badge>
            <dl className="mt-6 w-full space-y-2.5 border-t border-zinc-800 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Member since</dt>
                <dd className="text-zinc-200">{formatFullDate(user.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Account status</dt>
                <dd className="text-zinc-200">{user.isActive ? 'Active' : 'Disabled'}</dd>
              </div>
            </dl>
          </div>
        </Card>

        <Card title="Personal details" className="lg:col-span-2">
          {error && <ErrorAlert message={error} className="mb-4" />}
          {saved && !error && (
            <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              Profile saved successfully.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="First name" value={form.firstName} onChange={(event) => update('firstName', event.target.value)} error={errors.firstName} required />
              <FormField label="Last name" value={form.lastName} onChange={(event) => update('lastName', event.target.value)} error={errors.lastName} required />
            </div>
            <FormField
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => update('email', event.target.value)}
              error={errors.email}
              required
            />
            <FormField
              label="Phone"
              type="tel"
              value={form.phone}
              onChange={(event) => update('phone', event.target.value)}
              hint="Used by the front desk to verify your account."
            />
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-zinc-600">Password changes are handled by the front desk.</p>
              <button type="submit" className="btn btn-primary shrink-0" disabled={isAuthenticating}>
                {isAuthenticating ? <Loader size="sm" label="Saving…" /> : 'Save changes'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}