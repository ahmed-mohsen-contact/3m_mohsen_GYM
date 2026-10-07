import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { roleHomePath } from '../utils/routes'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import { ErrorAlert } from '../components/ErrorAlert'
import { FormField } from '../components/FormFields'
import { Loader } from '../components/Loader'
import { Logo } from '../components/Logo'
import { useAuth } from '../hooks/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'
import type { DemoAccount } from '../types'
import { isValidEmail } from '../utils/format'
import { roleTone } from '../utils/status'

interface LoginState {
  email: string
  password: string
}

/** Sign-in page with validation, demo-account quick logins and redirect-after-login. */
export function Login() {
  usePageTitle('Sign in')
  const { user, status, login, isAuthenticating, error, clearError, demoAccounts } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState<LoginState>({ email: '', password: '' })
  const [errors, setErrors] = useState<Partial<LoginState>>({})

  const from = (location.state as { from?: string } | null)?.from

  if (status === 'loading') {
    return <Loader fullScreen label="Checking session…" />
  }
  if (user) {
    return <Navigate to={roleHomePath(user.role)} replace />
  }

  const update = (field: keyof LoginState, value: string): void => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    clearError()
  }

  const validate = (): boolean => {
    const next: Partial<LoginState> = {}
    if (!isValidEmail(form.email)) next.email = 'Enter a valid email address.'
    if (form.password.length === 0) next.password = 'Password is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submitCredentials = async (credentials: LoginState): Promise<void> => {
    try {
      const session = await login(credentials)
      navigate(from ?? roleHomePath(session.role), { replace: true })
    } catch {
      // Error surfaced through the auth context.
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (!validate()) return
    await submitCredentials(form)
  }

  const handleDemoLogin = async (account: DemoAccount): Promise<void> => {
    clearError()
    setForm({ email: account.email, password: account.password })
    await submitCredentials({ email: account.email, password: account.password })
  }

  return (
    <div className="mx-auto flex max-w-md flex-col py-12 sm:py-20">
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>

      <Card title="Welcome back" description="Sign in to your IronForge account.">
        {error && <ErrorAlert message={error} className="mb-4" />}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
            onChange={(event) => update('password', event.target.value)}
            error={errors.password}
            required
          />
          <button type="submit" className="btn btn-primary w-full" disabled={isAuthenticating}>
            {isAuthenticating ? <Loader size="sm" label="Signing in…" /> : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-400">
          New to IronForge?{' '}
          <Link to="/register" className="font-semibold text-brand-400 hover:text-brand-300">
            Create an account
          </Link>
        </p>
      </Card>

      {demoAccounts.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Quick demo logins (mock backend)
          </p>
          <div className="grid gap-2">
            {demoAccounts.map((account) => (
              <button
                key={account.role}
                type="button"
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-left text-sm transition-colors hover:border-brand-500/40 disabled:opacity-50"
                onClick={() => handleDemoLogin(account)}
                disabled={isAuthenticating}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Badge tone={roleTone[account.role]}>{account.label}</Badge>
                  <span className="truncate text-zinc-300">{account.name}</span>
                </span>
                <span className="truncate pl-3 text-xs text-zinc-500">{account.email}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-zinc-600">
            One-click fills the seeded demo user for each role.
          </p>
        </div>
      )}
    </div>
  )
}