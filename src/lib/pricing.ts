export const formatPrice = (amount: number): string => {
  if (amount === 0) return 'Free'
  return `S$${amount.toFixed(2)}`
}

export const getSalePrice = (originalPrice: number, discountPercent: number): number => {
  if (originalPrice === 0) return 0
  const discount = Math.min(Math.max(discountPercent, 0), 100)
  return Math.round(originalPrice * (1 - discount / 100) * 100) / 100
}

export const isPromoActive = (
  enteredCode: string,
  promoCode: string,
  discountPercent: number,
): boolean => {
  return (
    enteredCode.trim().length > 0 &&
    promoCode.trim().length > 0 &&
    discountPercent > 0 &&
    enteredCode.trim().toLowerCase() === promoCode.trim().toLowerCase()
  )
}
