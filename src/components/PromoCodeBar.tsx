import { useState } from 'react'
import { Tag } from 'lucide-react'
import { isPromoActive } from '#/lib/pricing'

type PromoCodeBarProps = {
  value: string
  onChange: (value: string) => void
  onApply: (value: string) => void
  promoCode: string
  saleDiscountPercent: number
}

const PromoCodeBar = ({
  value,
  onChange,
  onApply,
  promoCode,
  saleDiscountPercent,
}: PromoCodeBarProps) => {
  const [applied, setApplied] = useState(false)
  const promoValid = isPromoActive(value, promoCode, saleDiscountPercent)

  return (
    <section className="island-shell rounded-2xl p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="promo-code" className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--sea-ink)]">
            <Tag size={16} />
            Enter promo code
          </label>
          <input
            id="promo-code"
            type="text"
            value={value}
            onChange={(event) => {
              setApplied(false)
              onChange(event.target.value)
            }}
            placeholder="Friends & family code"
            className="demo-input"
          />
        </div>
        <button
          type="button"
          className="demo-button w-full sm:w-auto"
          onClick={() => {
            setApplied(true)
            onApply(value)
          }}
        >
          Apply code
        </button>
      </div>
      {applied && promoValid && (
        <p className="mt-3 text-sm text-[var(--sea-ink-soft)]">
          Promo applied — eligible items show {saleDiscountPercent}% off in red.
        </p>
      )}
      {applied && value.trim() && !promoValid && (
        <p className="mt-3 text-sm text-amber-700">
          That code is not recognized. Double-check and try again.
        </p>
      )}
    </section>
  )
}

export default PromoCodeBar
