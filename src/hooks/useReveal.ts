import {
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react'

export interface UseRevealOptions {
  /** Root margin passed to the IntersectionObserver. */
  rootMargin?: string
  /** Fraction of the element that must be visible before revealing. */
  threshold?: number
  /** Delay (ms) applied before the reveal transition starts. */
  delayMs?: number
  /** When true, stop observing once the element has been revealed. */
  once?: boolean
}

export interface UseRevealResult<T extends HTMLElement = HTMLDivElement> {
  ref: RefObject<T | null>
  isRevealed: boolean
}

const SAFETY_TIMEOUT_MS = 1500

/**
 * Progressive scroll-reveal animation.
 *
 * The element is visible by default (see `.reveal` in `index.css`). Only when
 * JavaScript confirms IntersectionObserver support do we *arm* the animation
 * by adding `.reveal-pending` — and we do it in a layout effect so there is no
 * flash of visible content before the transition. A safety timeout guarantees
 * the element is always revealed even if the observer never fires.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseRevealOptions = {},
): UseRevealResult<T> {
  const { rootMargin = '0px 0px -40px 0px', threshold = 0.15, delayMs = 0, once = true } = options
  const ref = useRef<T | null>(null)
  const [isRevealed, setIsRevealed] = useState(false)

  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return undefined

    const reveal = () => {
      if (delayMs > 0) node.style.transitionDelay = `${delayMs}ms`
      node.classList.remove('reveal-pending')
      node.classList.add('is-revealed')
      setIsRevealed(true)
    }

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // No animation support or reduced motion: show immediately, no observer.
    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      reveal()
      return undefined
    }

    // Arm the transition before paint so the initial visible paint is skipped.
    node.classList.add('reveal-pending')
    let done = false

    const revealOnce = () => {
      if (done) return
      done = true
      reveal()
    }

    // Safety net first: never leave content invisible, even if the observer
    // constructor or observe() call throws for any reason.
    const safety = window.setTimeout(revealOnce, SAFETY_TIMEOUT_MS)

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          revealOnce()
          if (once) observer.disconnect()
          return
        }
      },
      { rootMargin, threshold },
    )
    observer.observe(node)

    return () => {
      observer.disconnect()
      window.clearTimeout(safety)
      node.style.transitionDelay = ''
    }
  }, [rootMargin, threshold, delayMs, once])

  return { ref, isRevealed }
}