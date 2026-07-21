import { formatPrice, getSalePrice, isPromoActive } from '#/lib/pricing'

type PriceDisplayProps = {
  price: number
  promoCode: string
  enteredPromoCode: string
  saleDiscountPercent: number
  size?: 'sm' | 'lg'
}

const PriceDisplay = ({
  price,
  promoCode,
  enteredPromoCode,
  saleDiscountPercent,
  size = 'sm',
}: PriceDisplayProps) => {
  const promoActive = isPromoActive(enteredPromoCode, promoCode, saleDiscountPercent)
  const salePrice = getSalePrice(price, saleDiscountPercent)
  const textSize = size === 'lg' ? 'text-2xl font-bold' : 'text-lg font-bold'

  if (!promoActive || price === 0) {
    return <span className={`${textSize} text-[var(--sea-ink)]`}>{formatPrice(price)}</span>
  }

  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className={`${textSize} text-red-600`}>{formatPrice(salePrice)}</span>
      <span className="text-base font-medium text-gray-400 line-through">
        {formatPrice(price)}
      </span>
    </div>
  )
}

export default PriceDisplay
