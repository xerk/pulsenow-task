import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react'
import type { LocalCartItem, Product } from '@/types'
import { useAuth } from '@/context/AuthContext'
import {
  getCart as getBackendCart,
  addToCart as addToBackendCart,
  updateCartItem as updateBackendCartItem,
  removeFromCart as removeFromBackendCart,
  clearCart as clearBackendCart,
} from '@/services/api'
import { toast } from 'sonner'

interface CartContextType {
  items: LocalCartItem[]
  itemCount: number
  subtotal: number
  isLoading: boolean
  addItem: (product: Product, quantity?: number) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  isInCart: (productId: string) => boolean
  getItemQuantity: (productId: string) => number
  syncWithBackend: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'marketplace_cart'

// Helper to load cart from localStorage
function loadCartFromStorage(): LocalCartItem[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(CART_STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored) as LocalCartItem[]
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY)
    }
  }
  return []
}

export function CartProvider({ children }: { children: ReactNode }) {
  // Initialize with localStorage data immediately (lazy init)
  const [items, setItems] = useState<LocalCartItem[]>(() => loadCartFromStorage())
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated } = useAuth()
  const isInitialMount = useRef(true)
  const isSyncing = useRef(false)

  // Save cart to localStorage whenever it changes (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    if (!isSyncing.current) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    }
  }, [items])

  // Sync with backend when authenticated
  const syncWithBackend = useCallback(async () => {
    if (!isAuthenticated || isSyncing.current) return

    isSyncing.current = true
    setIsLoading(true)

    try {
      // Get backend cart
      const response = await getBackendCart()
      const backendItems = response.data.items

      // Merge local cart with backend cart
      const localItems = loadCartFromStorage()
      const mergedItems: LocalCartItem[] = []

      // Add backend items first
      for (const backendItem of backendItems) {
        if (backendItem.product) {
          mergedItems.push({
            productId: backendItem.productId,
            quantity: backendItem.quantity,
            product: backendItem.product,
          })
        }
      }

      // Add local items that aren't in backend
      for (const localItem of localItems) {
        const existsInBackend = mergedItems.some(
          (item) => item.productId === localItem.productId
        )
        if (!existsInBackend) {
          // Sync to backend
          try {
            await addToBackendCart(localItem.productId, localItem.quantity)
            mergedItems.push(localItem)
          } catch {
            // Product might not exist anymore, skip
          }
        }
      }

      setItems(mergedItems)
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(mergedItems))
    } catch {
      // Backend cart not available, use local only
    } finally {
      setIsLoading(false)
      isSyncing.current = false
    }
  }, [isAuthenticated])

  // Sync on login
  useEffect(() => {
    if (isAuthenticated) {
      syncWithBackend()
    }
  }, [isAuthenticated, syncWithBackend])

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  const subtotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  )

  const addItem = async (product: Product, quantity: number = 1) => {
    const existingItem = items.find((item) => item.productId === product.id)

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity
      if (newQuantity > product.stock) {
        toast.error(`Only ${product.stock} items available`)
        return
      }

      // Update local state
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: newQuantity }
            : item
        )
      )

      // Sync to backend if authenticated
      if (isAuthenticated) {
        try {
          await updateBackendCartItem(product.id, newQuantity)
        } catch {
          // Backend sync failed, local update still works
        }
      }

      toast.success(`Updated ${product.name} quantity`)
    } else {
      if (quantity > product.stock) {
        toast.error(`Only ${product.stock} items available`)
        return
      }

      // Add to local state
      setItems((currentItems) => [
        ...currentItems,
        { productId: product.id, quantity, product },
      ])

      // Sync to backend if authenticated
      if (isAuthenticated) {
        try {
          await addToBackendCart(product.id, quantity)
        } catch {
          // Backend sync failed, local update still works
        }
      }

      toast.success(`Added ${product.name} to cart`)
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(productId)
      return
    }

    const item = items.find((item) => item.productId === productId)
    if (item && quantity > item.product.stock) {
      toast.error(`Only ${item.product.stock} items available`)
      return
    }

    // Update local state
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    )

    // Sync to backend if authenticated
    if (isAuthenticated) {
      try {
        await updateBackendCartItem(productId, quantity)
      } catch {
        // Backend sync failed, local update still works
      }
    }
  }

  const removeItem = async (productId: string) => {
    const item = items.find((item) => item.productId === productId)

    // Update local state
    setItems((currentItems) =>
      currentItems.filter((item) => item.productId !== productId)
    )

    // Sync to backend if authenticated
    if (isAuthenticated) {
      try {
        await removeFromBackendCart(productId)
      } catch {
        // Backend sync failed, local update still works
      }
    }

    if (item) {
      toast.success(`Removed ${item.product.name} from cart`)
    }
  }

  const clearCart = async () => {
    // Update local state
    setItems([])
    localStorage.removeItem(CART_STORAGE_KEY)

    // Sync to backend if authenticated
    if (isAuthenticated) {
      try {
        await clearBackendCart()
      } catch {
        // Backend sync failed, local update still works
      }
    }

    toast.success('Cart cleared')
  }

  const isInCart = (productId: string) => {
    return items.some((item) => item.productId === productId)
  }

  const getItemQuantity = (productId: string) => {
    const item = items.find((item) => item.productId === productId)
    return item?.quantity || 0
  }

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        isLoading,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        isInCart,
        getItemQuantity,
        syncWithBackend,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
