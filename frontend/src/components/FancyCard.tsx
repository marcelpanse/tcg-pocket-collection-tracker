import type { Card } from '@/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import useMousePosition from '../lib/hooks/useMousePosition'

// Generic throttle function with strict typing
const throttle = <T extends unknown[]>(fn: (...args: T) => void, delay: number): ((...args: T) => void) => {
  let lastCall = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return (...args: T): void => {
    const now = performance.now()
    const timeSinceLastCall = now - lastCall

    if (timeSinceLastCall < delay) {
      if (!timeoutId) {
        timeoutId = setTimeout(() => {
          lastCall = performance.now()
          timeoutId = null
          fn(...args)
        }, delay - timeSinceLastCall)
      }
      return
    }

    lastCall = now
    fn(...args)
  }
}

const FancyCard = ({ selected, setIsSelected, card }: { selected: boolean; setIsSelected: React.Dispatch<React.SetStateAction<boolean>>; card: Card }) => {
  const cardRef = useRef<HTMLImageElement>(null)
  const { x, y } = useMousePosition()
  const [throttledPos, setThrottledPos] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  // Memoize throttled position updates
  const throttledSetPos = useRef(throttle<Parameters<typeof setThrottledPos>>((position) => setThrottledPos(position), 50))

  useEffect(() => {
    if (isHovering) {
      throttledSetPos.current({ x: x || 0, y: y || 0 })
    }
  }, [x, y, isHovering])

  const handleMouseEnter = useCallback(() => setIsHovering(true), [])
  const handleMouseLeave = useCallback(() => setIsHovering(false), [])

  let centeredX = 0
  let centeredY = 0

  if (cardRef.current && isHovering) {
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    centeredX = throttledPos.x - centerX
    centeredY = throttledPos.y - centerY
  }

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

  const rotateY = isHovering ? clamp(centeredX / 4, -10, 10) : 0
  const rotateX = isHovering ? clamp(-centeredY / 4, -10, 10) : 0

  const cardTestStyle: React.CSSProperties = {
    transform: `perspective(1000px)
                   rotateY(${rotateY}deg)
                   rotateX(${rotateX}deg)
                   scale(${isHovering ? 1.04 : 1})`,
    transition: 'transform 0.3s cubic-bezier(0.17, 0.67, 0.5, 1.03)',
    transformStyle: 'preserve-3d',
    cursor: 'pointer',
    opacity: selected ? 1 : 0.5,
  }

  return (
    <div
      style={{
        flex: '1 0 20%',
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: isHovering ? 10 : 0,
      }}
    >
      <img
        draggable={false}
        onMouseDown={() => setIsSelected(!selected)}
        ref={cardRef}
        className="card-test"
        width={128}
        style={cardTestStyle}
        src={card?.image}
        alt="Bulbasaur"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  )
}

export default FancyCard
