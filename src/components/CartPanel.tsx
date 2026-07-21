import { useState } from 'react'
import { ShoppingBag, X } from 'lucide-react'
import { useCart } from '#/components/CartProvider'
import { formatPrice } from '#/lib/pricing'
import { submitOrder } from '#/server/orders'

const formspreeId = import.meta.env.VITE_FORMSPREE_FORM_ID as string | undefined

const CartPanel = () => {
  const { items, removeItem, clear, isOpen, closeCart } = useCart()
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const total = items.reduce((sum, item) => sum + item.price, 0)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!name.trim() || !contact.trim()) {
      setError('Please enter your name and contact number.')
      return
    }

    if (items.length === 0) {
      setError('Your cart is empty.')
      return
    }

    setSubmitting(true)
    try {
      const itemCount = items.length
      const itemTitles = items.map((item) => item.title).join(', ')

      await submitOrder({
        data: {
          name: name.trim(),
          contact: contact.trim(),
          items: items.map((item) => ({
            listingId: item.listingId,
            intent: 'purchase' as const,
          })),
        },
      })

      if (formspreeId) {
        await fetch(`https://formspree.io/f/${formspreeId}`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'cart',
            name: name.trim(),
            contact: contact.trim(),
            itemCount,
            items: itemTitles,
            total: formatPrice(total),
            _subject: `Cart order: ${itemCount} item(s)`,
          }),
        })
      }

      clear()
      setSubmitted(true)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setSubmitted(false)
    setError('')
    closeCart()
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/45 backdrop-blur-sm">
      <button type="button" className="flex-1 cursor-default" aria-label="Close cart" onClick={handleClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="island-shell flex h-full w-full max-w-md flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} />
            <h2 id="cart-title" className="text-lg font-bold text-[var(--sea-ink)]">
              Your cart
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            className="rounded-lg p-2 text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {submitted ? (
            <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/10 p-4 text-sm text-emerald-800">
              Thanks, {name}! Your cart request was sent. Nina will contact you shortly to confirm.
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Your cart is empty. Add a few items to bulk order.
            </p>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.listingId}
                  className="flex gap-3 rounded-xl border border-[var(--line)] p-3"
                >
                  {item.photo ? (
                    <img
                      src={item.photo}
                      alt=""
                      className="h-16 w-16 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[var(--chip-bg)] text-xs text-[var(--sea-ink-soft)]">
                      No photo
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[var(--sea-ink)]">{item.title}</p>
                    <p className="text-sm text-[var(--sea-ink-soft)]">{formatPrice(item.price)}</p>
                    <button
                      type="button"
                      className="mt-1 text-xs font-semibold text-red-600"
                      onClick={() => removeItem(item.listingId)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!submitted && items.length > 0 && (
          <form className="space-y-3 border-t border-[var(--line)] px-5 py-4" onSubmit={handleSubmit}>
            <p className="text-sm font-semibold text-[var(--sea-ink)]">
              Total: {formatPrice(total)} · {items.length} item{items.length === 1 ? '' : 's'}
            </p>
            <div>
              <label htmlFor="cart-name" className="mb-1 block text-sm font-semibold">
                Your name
              </label>
              <input
                id="cart-name"
                className="demo-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="cart-contact" className="mb-1 block text-sm font-semibold">
                Contact number
              </label>
              <input
                id="cart-contact"
                className="demo-input"
                type="tel"
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="demo-button w-full" disabled={submitting}>
              {submitting ? 'Sending…' : 'Submit request'}
            </button>
          </form>
        )}

        {submitted && (
          <div className="border-t border-[var(--line)] px-5 py-4">
            <button type="button" className="demo-button w-full" onClick={handleClose}>
              Close
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}

export default CartPanel
