import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import { ErrorAlert } from '../components/ErrorAlert'
import { FormField } from '../components/FormFields'
import { Loader } from '../components/Loader'
import { Logo } from '../components/Logo'
import { useAuth } from '../hooks/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'
import { isValidEmail } from '../utils/format'

interface RegisterState {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

const initialForm: RegisterState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
}

/** Registration page with strict client-side validation. Creates a member account. */
export function Register() {
  usePageTitle('Join IronForge')
  const { user, register, isAuthenticating, error, clearError } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState<RegisterState>(initialForm)
  const [errors, setErrors] = useState<Partial<RegisterState>>({})

  if (user) {
    return <Navigate to="/member" replace />
  }

  const update = (field: keyof RegisterState, value: string): void => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    clearError()
  }

  const validate = (): boolean => {
    const next: Partial<RegisterState> = {}
    if (form.firstName.trim().length < 2) next.firstName = 'First name is required.'
    if (form.lastName.trim().length < 2) next.lastName = 'Last name is required.'
    if (!isValidEmail(form.email)) next.email = 'Enter a valid email address.'
    if (form.password.length < 8) next.password = 'Use at least 8 characters.'
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (!validate()) return
    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
      })
      navigate('/member', { replace: true })
    } catch {
      // Error surfaced through the auth context.
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col py-12 sm:py-20">
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>

      <Card title="Start your 7-day trial" description="Create your member account.">
        {error && <ErrorAlert message={error} className="mb-4" />}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="First name"
              autoComplete="given-name"
              value={form.firstName}
              onChange={(event) => update('firstName', event.target.value)}
              error={errors.firstName}
              required
            />
            <FormField
              label="Last name"
              autoComplete="family-name"
              value={form.lastName}
              onChange={(event) => update('lastName', event.target.value)}
              error={errors.lastName}
              required
            />
          </div>
          <FormField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            error={errors.email}
            required
          />
          <FormField
            label="Phone (optional)"
            type="tel"
            autoComplete="tel"
            placeholder="+1 555 010 1000"
            value={form.phone}
            onChange={(event) => update('phone', event.target.value)}
            error={errors.phone}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="8+ characters"
              value={form.password}
              onChange={(event) => update('password', event.target.value)}
              error={errors.password}
              required
            />
            <FormField
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat password"
              value={form.confirmPassword}
              onChange={(event) => update('confirmPassword', event.target.value)}
              error={errors.confirmPassword}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={isAuthenticating}>
            {isAuthenticating ? <Loader size="sm" label="Creating account…" /> : 'Create account'}
          </button>
          <p className="text-center text-xs text-zinc-500">
            By joining you agree to our membership terms. No card required for the trial week.
          </p>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-400">
          Already a member?{' '}
          <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300">
            Sign in
          </Link>
        </p>
      </Card>

      <p className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-600">
        <Badge tone="volt">Trial</Badge> New accounts start with a free active-week subscription.
      </p>
    </div>
  )
}