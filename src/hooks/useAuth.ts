import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from '../context/AuthContext'

/**
 * Access the auth session (user, login, register, logout, profile).
 * Must be rendered inside <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an <AuthProvider>.')
  }
  return context
}