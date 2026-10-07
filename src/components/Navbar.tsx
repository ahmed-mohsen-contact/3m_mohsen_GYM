import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { Role } from '../types'
import { cn } from '../utils/cn'
import { initials } from '../utils/format'
import { Loader } from './Loader'
import { Logo } from './Logo'

interface NavItem {
  to: string
  label: string
}

const GUEST_LINKS: NavItem[] = [
  { to: '/classes', label: 'Classes' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/contact', label: 'Contact' },
]

function roleLinks(role: Role): NavItem[] {
  switch (role) {
    case 'admin':
      return [
        { to: '/admin', label: 'Dashboard' },
        { to: '/admin/members', label: 'Members' },
        { to: '/admin/trainers', label: 'Trainers' },
        { to: '/admin/plans', label: 'Plans' },
        { to: '/admin/classes', label: 'Classes' },
        { to: '/admin/payments', label: 'Payments' },
      ]
    case 'trainer':
      return [{ to: '/trainer', label: 'Dashboard' }]
    case 'member':
      return [
        { to: '/member', label: 'Dashboard' },
        { to: '/member/classes', label: 'Classes' },
        { to: '/member/subscription', label: 'Subscription' },
        { to: '/member/attendance', label: 'Attendance' },
      ]
  }
}

const navItemClass = ({ isActive }: { isActive: boolean }): string =>
  cn(
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-zinc-800/80 text-white' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100',
  )

/** Sticky top navigation: role-aware links, user menu, mobile drawer. */
export function Navbar() {
  const { user, status, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const links = useMemo(() => (user ? roleLinks(user.role) : GUEST_LINKS), [user])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent): void => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [])

  const handleLogout = (): void => {
    logout()
    setMobileOpen(false)
    setUserMenuOpen(false)
    navigate('/')
  }

  const showGuestActions = status !== 'loading' && !user

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Desktop links */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navItemClass} end={link.to === '/admin' || link.to === '/trainer' || link.to === '/member'}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {status === 'loading' ? (
            <Loader size="sm" label="Checking session…" className="hidden sm:flex" />
          ) : user ? (
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white ring-2 ring-zinc-800 transition hover:ring-brand-500/50"
                title={`${user.firstName} ${user.lastName}`}
              >
                {initials(user.firstName, user.lastName)}
              </button>
              {userMenuOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 p-1.5 shadow-xl">
                  <div className="px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-white">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="truncate text-xs text-zinc-500">{user.email}</p>
                  </div>
                  <div className="my-1 border-t border-zinc-800" />
                  {user.role === 'member' && (
                    <Link
                      to="/member/profile"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                    >
                      My profile
                    </Link>
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost hidden sm:inline-flex">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Join now
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
            className="rounded-lg p-2 text-zinc-300 transition-colors hover:bg-zinc-800 lg:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden>
              {mobileOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <nav className="border-t border-zinc-800/80 bg-zinc-950/95 px-4 py-3 lg:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={navItemClass}
                onClick={() => setMobileOpen(false)}
                end={link.to === '/admin' || link.to === '/trainer' || link.to === '/member'}
              >
                {link.label}
              </NavLink>
            ))}
            {showGuestActions && (
              <div className="mt-2 flex gap-2 border-t border-zinc-800 pt-3">
                <Link to="/login" className="btn btn-secondary flex-1" onClick={() => setMobileOpen(false)}>
                  Sign in
                </Link>
                <Link to="/register" className="btn btn-primary flex-1" onClick={() => setMobileOpen(false)}>
                  Join now
                </Link>
              </div>
            )}
            {user && (
              <div className="mt-2 flex items-center justify-between gap-2 border-t border-zinc-800 pt-3">
                <p className="truncate text-sm text-zinc-400">
                  {user.firstName} {user.lastName}
                </p>
                <button type="button" onClick={handleLogout} className="btn btn-ghost shrink-0 text-red-400">
                  Sign out
                </button>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}