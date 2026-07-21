import type { Listing } from '#/lib/types'
import { CONDITION_LABELS } from '#/lib/types'
import PhotoCarousel from '#/components/PhotoCarousel'
import PriceDisplay from '#/components/PriceDisplay'
import StatusBadge from '#/components/StatusBadge'

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
  const canReserve = listing.status === 'available'
  const canWaitlist = listing.status === 'reserved'

  return (
    <article className="island-shell feature-card overflow-hidden rounded-2xl">
      <PhotoCarousel photos={listing.photos} title={listing.title} />

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
          {listing.status === 'sold' && (
            <span className="demo-pill">This item has been sold</span>
          )}
        </div>
      </div>
    </article>
  )
}

export default ListingCard
