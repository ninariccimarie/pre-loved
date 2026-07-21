import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { getPublicCatalog } from '#/server/listings'
import PromoCodeBar from '#/components/PromoCodeBar'
import ListingCard from '#/components/ListingCard'
import ReserveModal from '#/components/ReserveModal'
import type { Listing } from '#/lib/types'
import { isPromoActive } from '#/lib/pricing'

const HomePage = () => {
  const { listings, promoCode, saleDiscountPercent } = Route.useLoaderData()
  const [promoInput, setPromoInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState('')
  const [activeListing, setActiveListing] = useState<Listing | null>(null)
  const [inquiryType, setInquiryType] = useState<'reserve' | 'waitlist'>('reserve')

  const openInquiry = (listing: Listing, type: 'reserve' | 'waitlist') => {
    setActiveListing(listing)
    setInquiryType(type)
  }

  const closeInquiry = () => {
    setActiveListing(null)
  }

  const promoApplied = isPromoActive(appliedPromo, promoCode, saleDiscountPercent)

  return (
    <main className="page-wrap px-4 pb-10 pt-8">
      <section className="mb-8">
        <p className="island-kicker mb-2">Pre-loved finds</p>
        <h1 className="display-title mb-3 text-4xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-5xl">
          Browse our listings
        </h1>
        <p className="max-w-2xl text-base text-[var(--sea-ink-soft)]">
          Gently used items looking for a new home. Reserve available items or join the waitlist
          when something is already held.
        </p>
      </section>

      <div className="mb-8">
        <PromoCodeBar
          value={promoInput}
          onChange={setPromoInput}
          onApply={setAppliedPromo}
          promoCode={promoCode}
          saleDiscountPercent={saleDiscountPercent}
        />
      </div>

      {promoApplied && (
        <p className="mb-6 text-sm font-semibold text-red-600">
          Friend discount active — prices slashed by {saleDiscountPercent}%
        </p>
      )}

      {listings.length === 0 ? (
        <section className="island-shell rounded-2xl p-8 text-center">
          <p className="text-[var(--sea-ink-soft)]">No listings yet. Check back soon!</p>
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-2">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              promoCode={promoCode}
              enteredPromoCode={appliedPromo}
              saleDiscountPercent={saleDiscountPercent}
              onReserve={(item) => openInquiry(item, 'reserve')}
              onWaitlist={(item) => openInquiry(item, 'waitlist')}
            />
          ))}
        </section>
      )}

      <ReserveModal
        listing={activeListing}
        inquiryType={inquiryType}
        promoCode={promoCode}
        enteredPromoCode={appliedPromo}
        saleDiscountPercent={saleDiscountPercent}
        onClose={closeInquiry}
      />
    </main>
  )
}

export const Route = createFileRoute('/')({
  loader: () => getPublicCatalog(),
  component: HomePage,
})
