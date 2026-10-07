import { useEffect } from 'react'

/** Sets the document title with the app brand suffix. */
export function usePageTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} · IronForge Fitness`
  }, [title])
}