import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { ScrollToTop } from './ScrollToTop'

/**
 * Root layout for every route: sticky navbar, routed content, footer.
 * Also scrolls to the top on route changes.
 */
export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}