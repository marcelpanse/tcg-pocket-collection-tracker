import type { Card } from '@/types'
import { type CSSProperties, type Dispatch, type SetStateAction, useCallback, useRef, useState } from 'react'

interface Props {
  card: Card
  selected: boolean
  setIsSelected?: Dispatch<SetStateAction<boolean>>
  size?: 'default' | 'small'
}

function FancyCard({ selected, setIsSelected, card, size = 'default' }: Props) {
  const cardRef = useRef<HTMLImageElement>(null)
  const [throttledPos, setThrottledPos] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  // Memoize throttled position updates
  const throttledSetPos = useRef(throttle<Parameters<typeof setThrottledPos>>((position) => setThrottledPos(position), 50))

  const updateMousePos = (e: MouseEvent) => {
    throttledSetPos.current({ x: e.clientX, y: e.clientY })
  }

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true)
    window.addEventListener('mousemove', updateMousePos)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
    window.removeEventListener('mousemove', updateMousePos)
  }, [])

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

  const cardTestStyle: CSSProperties = {
    transform: `perspective(1000px)
                   rotateY(${rotateY}deg)
                   rotateX(${rotateX}deg)
                   scale(${isHovering ? 1.04 : 1})`,
    transition: 'transform 0.3s cubic-bezier(0.17, 0.67, 0.5, 1.03)',
    transformStyle: 'preserve-3d',
    cursor: 'pointer',
    opacity: selected ? 1 : 0.5,
    width: size === 'small' ? '80px' : '100%', // Adjust size based on prop
    height: size === 'small' ? '112px' : 'auto', // Adjust size based on prop
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
        onMouseDown={() => setIsSelected?.(!selected)}
        ref={cardRef}
        className="card-test"
        style={cardTestStyle}
        src={card.image}
        // src={`/images/${card.image?.split('/').at(-1)}`}
        alt={card.name}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  )
}

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

export default FancyCard
