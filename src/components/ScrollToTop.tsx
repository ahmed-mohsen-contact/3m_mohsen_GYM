import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Puts every route back at the top of the page on navigation. */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  return null
}