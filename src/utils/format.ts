/** Formatting & parsing helpers shared across pages. */

/** Formats a number as USD (default) currency. */
export function formatCurrency(amount: number, currencyCode = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount)
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
})

const fullDateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

/** "Wed, Oct 8". */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}

/** "6:00 PM". */
export function formatTime(iso: string): string {
  return timeFormatter.format(new Date(iso))
}

/** "Wed, Oct 8 · 6:00 PM" — used for class slots. */
export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} · ${formatTime(iso)}`
}

/** "Wednesday, October 8, 2026". */
export function formatFullDate(iso: string): string {
  return fullDateFormatter.format(new Date(iso))
}

/** Value for `<input type="datetime-local">` in local time, no TZ shifts. */
export function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso)
  const pad = (value: number): string => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** Converts `<input type="datetime-local">` value back to an ISO string. */
export function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString()
}

/** Two-letter avatar initials, e.g. "Emma Wilson" -> "EW". */
export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

/** Basic email shape check for client-side validation. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

/** "1240" -> "1.2k"; keeps stat cards compact. */
export function compactNumber(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`
  }
  return String(value)
}