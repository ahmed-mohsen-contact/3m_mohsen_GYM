import { useEffect, useRef, useState, type RefObject } from 'react'

export interface UseRevealOptions {
  /** IntersectionObserver rootMargin (default: element enters viewport). */
  rootMargin?: string
  /** Fraction of the element that must be visible (default: 0.15). */
  threshold?: number
  /** Stagger delay in ms applied while animating in (default: 0). */
  delayMs?: number
  /** Animate only once (default: true). */
  once?: boolean
}

export interface UseRevealResult<T extends HTMLElement = HTMLElement> {
  /** Attach this ref to the element you want to reveal on scroll. */
  ref: RefObject<T | null>
  /** True once the element has entered the viewport. */
  isRevealed: boolean
}

/**
 * Scroll-reveal animation hook.
 *
 * Attach `ref` to an element with the `reveal` CSS class (defined in
 * index.css); the hook adds `is-revealed` when it scrolls into view, which
 * transitions opacity/translate. Respects `prefers-reduced-motion` via CSS.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseRevealOptions = {},
): UseRevealResult<T> {
  const { rootMargin = '0px 0px -40px 0px', threshold = 0.15, delayMs = 0, once = true } = options

  const ref = useRef<T | null>(null)
  const [isRevealed, setIsRevealed] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    // Content already visible — skip observer on very tall viewports.
    if (typeof IntersectionObserver === 'undefined') {
      node.classList.add('is-revealed')
      // Defer state update out of the effect body to avoid sync re-render.
      queueMicrotask(() => setIsRevealed(true))
      return undefined
    }

    let cleanupTransitionDelay: (() => void) | undefined

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (delayMs > 0) {
              node.style.transitionDelay = `${delayMs}ms`
              cleanupTransitionDelay = () => {
                node.style.transitionDelay = ''
              }
            }
            node.classList.add('is-revealed')
            setIsRevealed(true)
            if (once) observer.disconnect()
            return
          }
        }
      },
      { rootMargin, threshold },
    )

    observer.observe(node)
    return () => {
      observer.disconnect()
      cleanupTransitionDelay?.()
    }
  }, [rootMargin, threshold, delayMs, once])

  return { ref, isRevealed }
}