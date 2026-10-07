import { Link } from 'react-router-dom'
import { Logo } from './Logo'

/** Evaluated once per module load — fine for a copyright year. */
const currentYear = new Date().getFullYear()

const exploreLinks = [
  { to: '/classes', label: 'Class schedule' },
  { to: '/pricing', label: 'Membership plans' },
  { to: '/contact', label: 'Contact us' },
  { to: '/register', label: 'Join now' },
]

const socials = [
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    path: 'M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9-.1-1.3-.1-1.6-.1-4.8s0-3.6.1-4.8C2.4 4 4 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2Zm0 4.1a5.7 5.7 0 1 0 0 11.4 5.7 5.7 0 0 0 0-11.4Zm0 2.2a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm6-2.9a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Z',
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com',
    path: 'M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.3 5 12 5 12 5s-6.3 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.5.4 7.8.4 7.8.4s6.3 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.2V8.8L15.2 12 10 15.2Z',
  },
]

/** Site footer with brand, quick links, visiting info and socials. */
export function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-zinc-500">
            Forge strength, discipline and community. Premium fitness for people who show up.
          </p>
          <div className="flex gap-3">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="rounded-lg border border-zinc-800 p-2 text-zinc-400 transition-colors hover:border-brand-500/50 hover:text-brand-400"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-zinc-300">Explore</h3>
          <ul className="mt-4 space-y-2.5">
            {exploreLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm text-zinc-500 transition-colors hover:text-brand-400">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-zinc-300">Visit us</h3>
          <address className="mt-4 space-y-2.5 text-sm not-italic text-zinc-500">
            <p>442 Iron Yard Blvd, Springfield</p>
            <p>Open daily · 5:00 AM – 11:00 PM</p>
            <p>
              <a href="mailto:hello@ironforge.fit" className="transition-colors hover:text-brand-400">
                hello@ironforge.fit
              </a>
            </p>
            <p>
              <a href="tel:+15550101100" className="transition-colors hover:text-brand-400">
                +1 555 010 1100
              </a>
            </p>
          </address>
        </div>
      </div>
      <div className="border-t border-zinc-900 py-5">
        <p className="text-center text-xs text-zinc-600">
          © {currentYear} IronForge Fitness. All rights reserved.
        </p>
      </div>
    </footer>
  )
}