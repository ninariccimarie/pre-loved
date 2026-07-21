export type CartItem = {
  listingId: string
  title: string
  price: number
  photo: string | null
  status: 'available' | 'reserved' | 'sold'
}

const CART_KEY = 'preloved_cart'

const canUseStorage = () => typeof window !== 'undefined'

export const readCart = (): CartItem[] => {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const writeCart = (items: CartItem[]) => {
  if (!canUseStorage()) return
  window.localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export const addToCart = (item: CartItem): CartItem[] => {
  const current = readCart()
  if (current.some((entry) => entry.listingId === item.listingId)) {
    return current
  }
  const next = [...current, item]
  writeCart(next)
  return next
}

export const removeFromCart = (listingId: string): CartItem[] => {
  const next = readCart().filter((item) => item.listingId !== listingId)
  writeCart(next)
  return next
}

export const clearCart = () => {
  writeCart([])
}
