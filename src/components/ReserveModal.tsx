import { useState } from 'react'
import type { Listing } from '#/lib/types'
import { formatPrice, getSalePrice, isPromoActive } from '#/lib/pricing'
import { submitOrder } from '#/server/orders'
import { X } from 'lucide-react'

type InquiryType = 'reserve' | 'waitlist'

type ReserveModalProps = {
  listing: Listing | null
  inquiryType: InquiryType
  promoCode: string
  enteredPromoCode: string
  saleDiscountPercent: number
  onClose: () => void
  onSubmitted?: () => void
}

const formspreeId = import.meta.env.VITE_FORMSPREE_FORM_ID as string | undefined

const ReserveModal = ({
  listing,
  inquiryType,
  promoCode,
  enteredPromoCode,
  saleDiscountPercent,
  onClose,
  onSubmitted,
}: ReserveModalProps) => {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  if (!listing) return null

  const promoActive = isPromoActive(enteredPromoCode, promoCode, saleDiscountPercent)
  const displayPrice = promoActive
    ? getSalePrice(listing.price, saleDiscountPercent)
    : listing.price
  const actionLabel = inquiryType === 'reserve' ? 'Confirm reservation' : 'Join waitlist'

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!name.trim() || !contact.trim()) {
      setError('Please enter your name and contact number.')
      return
    }

    setSubmitting(true)
    try {
      await submitOrder({
        data: {
          name: name.trim(),
          contact: contact.trim(),
          items: [
            {
              listingId: listing.id,
              intent: inquiryType,
            },
          ],
        },
      })

      if (formspreeId) {
        const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: inquiryType,
            listingId: listing.id,
            listingTitle: listing.title,
            listingStatus: listing.status,
            price: formatPrice(displayPrice),
            originalPrice: formatPrice(listing.price),
            promoApplied: promoActive,
            name: name.trim(),
            contact: contact.trim(),
            _subject: `${inquiryType === 'reserve' ? 'Reservation' : 'Waitlist'}: ${listing.title}`,
          }),
        })

        if (!response.ok) {
          throw new Error('Saved locally, but email notification failed. Nina still has your request.')
        }
      }

      setSubmitted(true)
      onSubmitted?.()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-title"
        className="island-shell w-full max-w-md rounded-2xl p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="island-kicker mb-1">
              {inquiryType === 'reserve' ? 'Reserve item' : 'Join waitlist'}
            </p>
            <h2 id="inquiry-title" className="text-xl font-bold text-[var(--sea-ink)]">
              {listing.title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)]"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/10 p-4 text-sm text-emerald-800">
              Thanks, {name}! You will be contacted by the owner shortly to confirm your{' '}
              {inquiryType === 'reserve' ? 'reservation' : 'waitlist spot'}.
            </div>
            <button type="button" className="demo-button w-full" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Price: <strong className="text-[var(--sea-ink)]">{formatPrice(displayPrice)}</strong>
            </p>

            <div>
              <label htmlFor="buyer-name" className="mb-1 block text-sm font-semibold">
                Your name
              </label>
              <input
                id="buyer-name"
                className="demo-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="buyer-contact" className="mb-1 block text-sm font-semibold">
                Contact number
              </label>
              <input
                id="buyer-contact"
                className="demo-input"
                type="tel"
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2">
              <button type="button" className="demo-button demo-button-secondary flex-1" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="demo-button flex-1" disabled={submitting}>
                {submitting ? 'Sending…' : actionLabel}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ReserveModal
