/**
 * Mock network client.
 *
 * Every service function simulates latency and error semantics here so that,
 * when a real backend arrives, only the internals of authService/gymService
 * change — this module is the "HTTP transport" of the mock.
 */

/** Latency every fake request waits through. */
export const NETWORK_DELAY_MS = 300

/** Whether the mock network should fail requests — use to preview error UIs. */
let failureMode = false

/** Toggle simulated network failures for development/demoing error states. */
export function setFailureMode(on: boolean): void {
  failureMode = on
}

/** Mocks `fetch` latency in front of any producer. */
export function delay(ms: number = NETWORK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Error thrown for any failed mock request, mirroring an HTTP response. */
export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * Runs `producer` behind artificial latency and throws a generic 500 when
 * failure mode is switched on (via `setFailureMode`) so components can
 * demonstrate their error states.
 */
export async function runWithLatency<T>(producer: () => T): Promise<T> {
  await delay()
  if (failureMode) throw new ApiError('Network error — the mock server is down.', 500)
  return producer()
}

/** Normalizes an unknown thrown value into a safe, user-facing message. */
export function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return 'Something went wrong. Please try again.'
}