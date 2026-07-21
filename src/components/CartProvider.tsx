import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  addToCart as addCartItem,
  clearCart as clearCartStorage,
  readCart,
  removeFromCart as removeCartItem,
  type CartItem,
} from '#/lib/cart'

type CartContextValue = {
  items: CartItem[]
  addItem: (item: CartItem) => boolean
  removeItem: (listingId: string) => void
  clear: () => void
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setItems(readCart())
  }, [])

  const addItem = useCallback((item: CartItem) => {
    if (item.status === 'sold') return false
    const next = addCartItem(item)
    setItems(next)
    return true
  }, [])

  const removeItem = useCallback((listingId: string) => {
    setItems(removeCartItem(listingId))
  }, [])

  const clear = useCallback(() => {
    clearCartStorage()
    setItems([])
  }, [])

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clear,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const value = useContext(CartContext)
  if (!value) {
    throw new Error('useCart must be used within CartProvider')
  }
  return value
}
