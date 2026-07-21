import { Link, createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { getAdminSession, logoutAdmin } from '#/server/auth'
import { deleteListing, getListings } from '#/server/listings'
import { getPromoSettings, updatePromoSettings } from '#/server/settings'
import { formatPrice } from '#/lib/pricing'
import { CONDITION_LABELS, STATUS_LABELS } from '#/lib/types'

const AdminDashboardPage = () => {
  const { listings, settings } = Route.useLoaderData()
  const router = useRouter()
  const [promoCode, setPromoCode] = useState(settings.promoCode)
  const [saleDiscountPercent, setSaleDiscountPercent] = useState(settings.saleDiscountPercent)
  const [savingPromo, setSavingPromo] = useState(false)
  const [promoMessage, setPromoMessage] = useState('')

  const handleLogout = async () => {
    await logoutAdmin()
    await router.navigate({ to: '/admin/login' })
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this listing?')) return
    await deleteListing({ data: { id } })
    await router.invalidate()
  }

  const handleSavePromo = async (event: React.FormEvent) => {
    event.preventDefault()
    setSavingPromo(true)
    setPromoMessage('')
    try {
      await updatePromoSettings({
        data: {
          promoCode,
          saleDiscountPercent,
        },
      })
      setPromoMessage('Promo settings saved.')
      await router.invalidate()
    } catch {
      setPromoMessage('Unable to save promo settings.')
    } finally {
      setSavingPromo(false)
    }
  }

  return (
    <main className="page-wrap px-4 pb-10 pt-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="island-kicker mb-1">Admin dashboard</p>
          <h1 className="display-title text-3xl font-bold text-[var(--sea-ink)] sm:text-4xl">
            Manage listings
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/listings/new" className="demo-button no-underline">
            New listing
          </Link>
          <button type="button" className="demo-button demo-button-secondary" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>

      <section className="island-shell mb-8 rounded-2xl p-5 sm:p-6">
        <h2 className="mb-4 text-lg font-bold text-[var(--sea-ink)]">Promo settings</h2>
        <form className="grid gap-4 sm:grid-cols-[1fr_160px_auto]" onSubmit={handleSavePromo}>
          <div>
            <label htmlFor="promo-code" className="mb-1 block text-sm font-semibold">
              Promo code
            </label>
            <input
              id="promo-code"
              className="demo-input"
              value={promoCode}
              onChange={(event) => setPromoCode(event.target.value)}
              placeholder="FRIENDS20"
            />
          </div>
          <div>
            <label htmlFor="sale-percent" className="mb-1 block text-sm font-semibold">
              Sale discount (%)
            </label>
            <input
              id="sale-percent"
              type="number"
              min="0"
              max="100"
              className="demo-input"
              value={saleDiscountPercent}
              onChange={(event) => setSaleDiscountPercent(Number(event.target.value))}
            />
          </div>
          <div className="flex items-end">
            <button type="submit" className="demo-button w-full sm:w-auto" disabled={savingPromo}>
              {savingPromo ? 'Saving…' : 'Save promo'}
            </button>
          </div>
        </form>
        {promoMessage && <p className="mt-3 text-sm text-[var(--sea-ink-soft)]">{promoMessage}</p>}
      </section>

      {listings.length === 0 ? (
        <section className="island-shell rounded-2xl p-8 text-center">
          <p className="mb-4 text-[var(--sea-ink-soft)]">No listings yet.</p>
          <Link to="/admin/listings/new" className="demo-button no-underline">
            Create your first listing
          </Link>
        </section>
      ) : (
        <section className="demo-table-shell">
          <table className="demo-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Price</th>
                <th>Status</th>
                <th>Condition</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.id}>
                  <td>{listing.title}</td>
                  <td>{formatPrice(listing.price)}</td>
                  <td>{STATUS_LABELS[listing.status]}</td>
                  <td>{CONDITION_LABELS[listing.condition]}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to="/admin/listings/$listingId"
                        params={{ listingId: listing.id }}
                        className="demo-button demo-button-secondary no-underline px-3 py-1.5 text-xs"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="demo-button demo-button-danger px-3 py-1.5 text-xs"
                        onClick={() => handleDelete(listing.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  )
}

export const Route = createFileRoute('/admin/')({
  loader: async () => {
    const session = await getAdminSession()
    if (!session.isAuthenticated) {
      throw redirect({ to: '/admin/login' })
    }
    const [listings, settings] = await Promise.all([getListings(), getPromoSettings()])
    return { listings, settings }
  },
  component: AdminDashboardPage,
})
