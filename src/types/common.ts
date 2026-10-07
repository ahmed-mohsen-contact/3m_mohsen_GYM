/**
 * Common primitives shared across the domain types.
 *
 * Every date is stored as an ISO-8601 UTC string — this maps 1:1 to a
 * `timestamptz` column in the future PostgreSQL schema.
 */

/** ISO-8601 UTC timestamp (e.g. `2026-10-08T09:00:00.000Z`). */
export type IsoDateString = string

/** Universally unique identifier (uuid) used across every table. */
export type EntityId = string