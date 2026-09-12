import { useLayoutEffect, useRef, useState } from 'react'

/** Fill the viewport below an element's document position, including preceding controls and gaps. */
export function useRemainingViewportHeight() {
  const ref = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) {
      return
    }

    const measure = () => {
      const top = element.getBoundingClientRect().top + window.scrollY
      setHeight(Math.max(0, window.innerHeight - top))
    }

    // A preceding sibling (such as a wrapping navbar) can move the element
    // without changing the element's own size.
    const observer = new ResizeObserver(measure)
    for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
      observer.observe(ancestor)
      for (let sibling = ancestor.previousElementSibling; sibling; sibling = sibling.previousElementSibling) {
        observer.observe(sibling)
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  return { ref, height }
}
