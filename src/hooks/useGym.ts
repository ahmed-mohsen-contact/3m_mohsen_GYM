import { useContext } from 'react'
import { GymContext, type GymContextValue } from '../context/GymContext'

/**
 * Access the gym store (plans, classes, bookings, admin CRUD, ...).
 * Must be rendered inside <GymProvider>.
 */
export function useGym(): GymContextValue {
  const context = useContext(GymContext)
  if (context === undefined) {
    throw new Error('useGym must be used within a <GymProvider>.')
  }
  return context
}