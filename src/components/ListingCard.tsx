import { useEffect, useState } from 'react'
import type { Listing } from '#/lib/types'
import { CONDITION_LABELS } from '#/lib/types'
import PhotoCarousel from '#/components/PhotoCarousel'
import PriceDisplay from '#/components/PriceDisplay'
import StatusBadge from '#/components/StatusBadge'
import { useCart } from '#/components/CartProvider'
import { recordListingClick } from '#/server/listings'
import { Eye, Users } from 'lucide-react'

type ListingCardProps = {
  listing: Listing
  promoCode: string
  enteredPromoCode: string
  saleDiscountPercent: number
  onReserve: (listing: Listing) => void
  onWaitlist: (listing: Listing) => void
}

const ListingCard = ({
  listing,
  promoCode,
  enteredPromoCode,
  saleDiscountPercent,
  onReserve,
  onWaitlist,
}: ListingCardProps) => {
  const { addItem, openCart, items } = useCart()
  const [clickCount, setClickCount] = useState(listing.clickCount)
  const [addedFlash, setAddedFlash] = useState(false)

  useEffect(() => {
    setClickCount(listing.clickCount)
  }, [listing.clickCount])

  const canReserve = listing.status === 'available'
  const canWaitlist = listing.status === 'reserved'
  const canAddToCart = listing.status !== 'sold'
  const alreadyInCart = items.some((item) => item.listingId === listing.id)

  const handlePreviewOpen = async () => {
    try {
      const result = await recordListingClick({ data: { id: listing.id } })
      setClickCount(result.clickCount)
    } catch {
      setClickCount((count) => count + 1)
    }
  }

  const handleAddToCart = () => {
    const added = addItem({
      listingId: listing.id,
      title: listing.title,
      price: listing.price,
      photo: listing.photos[0] ?? null,
      status: listing.status,
    })
    if (added) {
      setAddedFlash(true)
      window.setTimeout(() => setAddedFlash(false), 1600)
    }
  }

  return (
    <article className="island-shell feature-card overflow-hidden rounded-2xl">
      <PhotoCarousel
        photos={listing.photos}
        title={listing.title}
        onPreviewOpen={handlePreviewOpen}
      />

      <div className="space-y-3 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[var(--sea-ink)]">{listing.title}</h2>
            <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
              {CONDITION_LABELS[listing.condition]}
            </p>
          </div>
          <StatusBadge status={listing.status} />
        </div>

        <div className="flex flex-wrap gap-3 text-xs font-semibold text-[var(--sea-ink-soft)]">
          <span className="inline-flex items-center gap-1.5">
            <Eye size={14} aria-hidden />
            {clickCount} view{clickCount === 1 ? '' : 's'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users size={14} aria-hidden />
            {listing.waitlistCount} waitlisted
          </span>
        </div>

        <PriceDisplay
          price={listing.price}
          promoCode={promoCode}
          enteredPromoCode={enteredPromoCode}
          saleDiscountPercent={saleDiscountPercent}
          size="lg"
        />

        <p className="text-sm leading-relaxed text-[var(--sea-ink-soft)] whitespace-pre-wrap">
          {listing.description}
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {canReserve && (
            <button type="button" className="demo-button" onClick={() => onReserve(listing)}>
              Reserve
            </button>
          )}
          {canWaitlist && (
            <button
              type="button"
              className="demo-button demo-button-secondary"
              onClick={() => onWaitlist(listing)}
            >
              Waitlist
            </button>
          )}
          {canAddToCart && (
            <button
              type="button"
              className="demo-button demo-button-secondary"
              onClick={alreadyInCart ? openCart : handleAddToCart}
            >
              {alreadyInCart ? 'In cart' : addedFlash ? 'Added!' : 'Add to cart'}
            </button>
          )}
          {listing.status === 'sold' && (
            <span className="demo-pill">This item has been sold</span>
          )}
        </div>
      </div>
    </article>
  )
}

export default ListingCard
