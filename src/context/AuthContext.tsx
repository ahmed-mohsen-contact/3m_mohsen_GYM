/**
 * AuthContext — session state for the whole app.
 *
 * A fake "token" (the user id) is persisted to localStorage and hydrated on
 * boot through authService, mirroring how a real app would validate a JWT
 * against the backend on refresh.
 */
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as authService from '../services/authService'
import { toErrorMessage } from '../services/client'
import type {
  DemoAccount,
  LoginCredentials,
  PublicUser,
  RegisterInput,
  SessionRecord,
  UpdateUserInput,
} from '../types'

/** localStorage key holding the fake session token. */
const SESSION_KEY = 'ironforge.session.v1'

/** Lifecycle of the session during boot. */
export type AuthStatus = 'loading' | 'authenticated' | 'guest'

export interface AuthContextValue {
  /** Signed-in user, or null when logged out. */
  user: PublicUser | null
  status: AuthStatus
  /** True while a login/register request is in flight. */
  isAuthenticating: boolean
  /** Last auth error message, if any. */
  error: string | null
  /** Demo credentials surfaced on the Login page (one per role). */
  demoAccounts: DemoAccount[]
  login: (credentials: LoginCredentials) => Promise<PublicUser>
  register: (input: RegisterInput) => Promise<PublicUser>
  logout: () => void
  updateProfile: (patch: UpdateUserInput) => Promise<PublicUser>
  clearError: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([])

  /** Restores a persisted session and loads demo credentials on boot. */
  useEffect(() => {
    let cancelled = false

    async function hydrate(): Promise<void> {
      // Not gated on the session: demo logins are useful even when logged out.
      authService.getDemoAccounts().then((accounts) => {
        if (!cancelled) setDemoAccounts(accounts)
      })

      const raw = localStorage.getItem(SESSION_KEY)
      if (!raw) {
        setStatus('guest')
        return
      }

      try {
        const { userId } = JSON.parse(raw) as SessionRecord
        const sessionUser = await authService.getSessionUser(userId)
        if (cancelled) return
        if (sessionUser) {
          setUser(sessionUser)
          setStatus('authenticated')
        } else {
          // Stale/invalid token — clear it.
          localStorage.removeItem(SESSION_KEY)
          setStatus('guest')
        }
      } catch {
        if (!cancelled) setStatus('guest')
      }
    }

    void hydrate()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (credentials: LoginCredentials): Promise<PublicUser> => {
    setIsAuthenticating(true)
    setError(null)
    try {
      const sessionUser = await authService.login(credentials)
      const token: SessionRecord = { userId: sessionUser.id, issuedAt: new Date().toISOString() }
      localStorage.setItem(SESSION_KEY, JSON.stringify(token))
      setUser(sessionUser)
      setStatus('authenticated')
      return sessionUser
    } catch (cause) {
      setError(toErrorMessage(cause))
      throw cause
    } finally {
      setIsAuthenticating(false)
    }
  }, [])

  const register = useCallback(async (input: RegisterInput): Promise<PublicUser> => {
    setIsAuthenticating(true)
    setError(null)
    try {
      const sessionUser = await authService.register(input)
      const token: SessionRecord = { userId: sessionUser.id, issuedAt: new Date().toISOString() }
      localStorage.setItem(SESSION_KEY, JSON.stringify(token))
      setUser(sessionUser)
      setStatus('authenticated')
      return sessionUser
    } catch (cause) {
      setError(toErrorMessage(cause))
      throw cause
    } finally {
      setIsAuthenticating(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
    setStatus('guest')
    setError(null)
  }, [])

  const updateProfile = useCallback(
    async (patch: UpdateUserInput): Promise<PublicUser> => {
      if (!user) throw new Error('Not authenticated.')
      setIsAuthenticating(true)
      setError(null)
      try {
        const updated = await authService.updateProfile(user.id, patch)
        setUser(updated)
        return updated
      } catch (cause) {
        setError(toErrorMessage(cause))
        throw cause
      } finally {
        setIsAuthenticating(false)
      }
    },
    [user],
  )

  const clearError = useCallback(() => setError(null), [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticating,
      error,
      demoAccounts,
      login,
      register,
      logout,
      updateProfile,
      clearError,
    }),
    [user, status, isAuthenticating, error, demoAccounts, login, register, logout, updateProfile, clearError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}