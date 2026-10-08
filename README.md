# IronForge Fitness — Gym Management Frontend

A dark, responsive gym-management web app built with **React 19 + TypeScript + Vite**,
**React Router**, **Tailwind CSS v4** and the **Context API**. There is no backend yet —
a fully typed mock service layer stands in for one and persists everything to
`localStorage`, so it behaves like a real app across reloads.

## Getting started

> **Windows / PowerShell note:** if `npm run dev` fails with
> *"npm.ps1 cannot be loaded because running scripts is disabled"*, either run
> commands with `npm.cmd` (e.g. `npm.cmd run dev`) or enable scripts once with
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build locally
npm run lint     # oxlint
```

### Deploying

The app uses **hash-based routing** (`HashRouter`), so it works on **any** static
host with no server configuration: the server only ever serves `/`, and the
route lives after the `#` (e.g. `/#/classes`). Refreshing or sharing a deep link
never causes a 404.

Just build and upload `dist/` (Vercel, Netlify, GitHub Pages, S3, Nginx, …).

> `vercel.json` and `public/_redirects` are included as harmless extras for hosts
> that prefer path-based rewrites; they are not required for the app to work.

### Demo accounts

The Login page has one-click demo logins; you can also type these directly:

| Role    | Email                 | Password   |
| ------- | --------------------- | ---------- |
| Admin   | `admin@ironforge.fit` | `admin123` |
| Trainer | `maya@ironforge.fit`  | `trainer123`|
| Member  | `emma@example.com`    | `member123`|

(Exact seeded credentials are always surfaced live on the Login page.)

## Architecture

Strict separation of concerns — **components and contexts never import mock data
directly**, only through the service layer.

```
src/
├─ types/        TypeScript models mirroring the future PostgreSQL schema
├─ data/         mockData.ts — the ONLY place mock data lives
├─ services/     gymService.ts / authService.ts — async, the only data access
├─ context/      AuthContext, GymContext (login/logout/register/CRUD/bookings)
├─ hooks/        useAuth, useGym, useReveal (scroll animation), useNow, …
├─ components/   Navbar, Footer, Card, Table, Modal, Loader, …
├─ pages/        Home, Classes, Pricing, Contact, Login, Register,
│                member/, trainer/, admin/
└─ utils/        formatting, status tones, classnames, routes
```

- **`services/*`** simulate a backend with a ~300 ms delay, validate role/state
  rules (e.g. can't book without an active plan, can't delete a trainer with
  upcoming classes) and persist to `localStorage`.
- **`context/*`** expose the app state and actions; **`hooks/*`** are the
  ergonomic accessors used by the UI.
- **Role-based routing** via `ProtectedRoute`: guests are sent to `/login`,
  signed-in users with the wrong role are sent to their own area.

## Routes

| Area    | Paths                                                                       |
| ------- | --------------------------------------------------------------------------- |
| Public  | `/`, `/classes`, `/pricing`, `/contact`, `/login`, `/register`              |
| Member  | `/member`, `/member/classes`, `/member/subscription`, `/member/attendance`, `/member/profile` |
| Trainer | `/trainer`                                                                  |
| Admin   | `/admin`, `/admin/members`, `/admin/trainers`, `/admin/plans`, `/admin/classes`, `/admin/payments` |

## Design system

Tailwind v4 theme tokens live in `src/index.css` (`@theme`): the ember-orange
`brand-*` palette, lime `volt-*` accent, and the Oswald display font. Reusable
button/input classes (`.btn`, `.input`, …) are defined there too. Scroll reveals
use the `useReveal` hook plus the `.reveal` / `.is-revealed` classes and respect
`prefers-reduced-motion`.

## Notes

- Mock data is seeded with **relative dates** (recent past / upcoming classes), so
  the schedule stays current on every fresh seed.
- To reset the fake database, clear the `ironforge.*` keys from `localStorage`."# 3m_mohsen_GYM" 
