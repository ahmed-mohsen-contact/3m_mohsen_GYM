/**
 * localStorage-backed fake database.
 *
 * This module owns reading and writing the full "table set". It seeds from
 * `src/data/mockData` on first boot (or when the stored schema version
 * changes) and persists every mutation made through the services, so app
 * changes survive reloads during development. Later this whole file is
 * replaced by the real backend.
 *
 * IMPORTANT: services only. Components/context never touch it directly.
 */
import type { AppDatabase } from '../types'
import { createSeedDatabase } from '../data/mockData'

const STORAGE_KEY = 'ironforge.mockdb.v1'
const STORAGE_VERSION = 1

/** Collects every array we expect a valid database shape to carry. */
const COLLECTION_KEYS = [
  'users',
  'plans',
  'subscriptions',
  'classes',
  'bookings',
  'payments',
  'attendance',
] as const

/** True when `value` looks like a stored AppDatabase. */
function isAppDatabase(value: unknown): value is AppDatabase {
  if (value === null || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  if (candidate.version !== STORAGE_VERSION) return false
  return COLLECTION_KEYS.every((key) => Array.isArray(candidate[key]))
}

/** Loads the database from localStorage, seeding it on first boot. */
export function readDatabase(): AppDatabase {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw)
      if (isAppDatabase(parsed)) return parsed
    } catch {
      // Corrupt payload — fall through and reseed.
    }
  }
  return writeDatabase(createSeedDatabase())
}

/** Persists a database snapshot to localStorage. */
export function writeDatabase(db: AppDatabase): AppDatabase {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  return db
}

/** Wipes persisted state and re-seeds fresh mock data. */
export function resetDatabase(): AppDatabase {
  localStorage.removeItem(STORAGE_KEY)
  return readDatabase()
}