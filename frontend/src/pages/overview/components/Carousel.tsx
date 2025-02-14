import { useRef } from 'react'
import type { ReactNode } from 'react'

interface CarouselComponentProps {
  padding: string
  children: ReactNode
}

export function Carousel({ padding, children }: CarouselComponentProps) {
  const scrollContainer = useRef<HTMLDivElement | null>(null)

  return (
    <section className="relative">
      <article
        ref={scrollContainer}
        className="flex overflow-x-auto hide-scroll gap-5 snap-x scroll-smooth"
        style={{ scrollPadding: padding, paddingLeft: padding, paddingRight: `calc(${padding} + 1.5rem)` }}
      >
        {children}
      </article>
    </section>
  )
}
