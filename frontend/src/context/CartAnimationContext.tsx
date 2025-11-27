import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

interface Position {
  x: number
  y: number
}

interface AnimatingItem {
  id: string
  startPosition: Position
  image: string
}

interface CartAnimationContextType {
  cartIconRef: React.RefObject<HTMLButtonElement | null>
  triggerAnimation: (startPosition: Position, image: string) => void
  triggerBounce: () => void
  isBouncing: boolean
}

const CartAnimationContext = createContext<CartAnimationContextType | null>(null)

export function useCartAnimation() {
  const context = useContext(CartAnimationContext)
  if (!context) {
    throw new Error('useCartAnimation must be used within a CartAnimationProvider')
  }
  return context
}

export function CartAnimationProvider({ children }: { children: ReactNode }) {
  const cartIconRef = useRef<HTMLButtonElement>(null)
  const [animatingItems, setAnimatingItems] = useState<AnimatingItem[]>([])
  const [isBouncing, setIsBouncing] = useState(false)

  const triggerBounce = useCallback(() => {
    setIsBouncing(true)
    setTimeout(() => setIsBouncing(false), 300)
  }, [])

  const triggerAnimation = useCallback(
    (startPosition: Position, image: string) => {
      const id = `${Date.now()}-${Math.random()}`
      setAnimatingItems((prev) => [...prev, { id, startPosition, image }])

      // Remove after animation completes
      setTimeout(() => {
        setAnimatingItems((prev) => prev.filter((item) => item.id !== id))
        triggerBounce()
      }, 600)
    },
    [triggerBounce]
  )

  const getCartPosition = (): Position | null => {
    if (!cartIconRef.current) return null
    const rect = cartIconRef.current.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }

  return (
    <CartAnimationContext.Provider
      value={{ cartIconRef, triggerAnimation, triggerBounce, isBouncing }}
    >
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <>
            {animatingItems.map((item) => {
              const endPosition = getCartPosition()
              if (!endPosition) return null

              return (
                <FlyingItem
                  key={item.id}
                  startPosition={item.startPosition}
                  endPosition={endPosition}
                  image={item.image}
                />
              )
            })}
          </>,
          document.body
        )}
    </CartAnimationContext.Provider>
  )
}

function FlyingItem({
  startPosition,
  endPosition,
  image,
}: {
  startPosition: Position
  endPosition: Position
  image: string
}) {
  return (
    <div
      className="pointer-events-none fixed z-9999"
      style={{
        left: startPosition.x,
        top: startPosition.y,
        transform: 'translate(-50%, -50%)',
        animation: 'flyToCart 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        '--end-x': `${endPosition.x - startPosition.x}px`,
        '--end-y': `${endPosition.y - startPosition.y}px`,
      } as React.CSSProperties}
    >
      <div
        className="h-12 w-12 overflow-hidden rounded-full border-2 border-accent bg-white shadow-lg"
        style={{
          animation: 'scaleDown 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        }}
      >
        <img
          src={image || '/placeholder.svg'}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
