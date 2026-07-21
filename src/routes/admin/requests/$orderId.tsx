import { Link, createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { getAdminSession, logoutAdmin } from '#/server/auth'
import { getOrder, markOrderAsContacted } from '#/server/orders'
import AdminNav, { statusLinkClass } from '#/components/AdminNav'
import { INTENT_LABELS, STATUS_LABELS } from '#/lib/types'
import { formatPrice } from '#/lib/pricing'
import { buildContactMessage, buildWhatsAppUrl } from '#/lib/whatsapp'

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString('en-SG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

const AdminRequestDetailPage = () => {
  const { order: initialOrder } = Route.useLoaderData()
  const router = useRouter()
  const [order, setOrder] = useState(initialOrder)
  const [marking, setMarking] = useState(false)

  const handleLogout = async () => {
    await logoutAdmin()
    await router.navigate({ to: '/admin/login' })
  }

  const handleContact = async () => {
    const message = buildContactMessage(
      order.name,
      order.items.map((item) => item.listingTitle),
    )
    const url = buildWhatsAppUrl(order.contact, message)
    window.open(url, '_blank', 'noopener,noreferrer')

    if (!order.contacted) {
      setMarking(true)
      try {
        const updated = await markOrderAsContacted({ data: { id: order.id } })
        setOrder(updated)
        await router.invalidate()
      } catch {
        // WhatsApp still opened; mark can be retried
      } finally {
        setMarking(false)
      }
    }
  }

  return (
    <main className="page-wrap px-4 pb-10 pt-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="island-kicker mb-1">Request detail</p>
          <h1 className="display-title text-3xl font-bold text-[var(--sea-ink)] sm:text-4xl">
            {order.name}
          </h1>
          <p className="mt-2 font-mono text-sm text-[var(--sea-ink-soft)]">{order.contact}</p>
          <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
            Submitted {formatWhen(order.createdAt)}
            {order.contacted && order.contactedAt
              ? ` · Contacted ${formatWhen(order.contactedAt)}`
              : ''}
          </p>
        </div>
        <AdminNav onLogout={handleLogout} />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button type="button" className="demo-button" onClick={handleContact} disabled={marking}>
          {marking ? 'Opening…' : order.contacted ? 'Contact again' : 'Contact'}
        </button>
        {order.contacted && (
          <span className="demo-pill bg-emerald-500/15 text-emerald-800">Contacted</span>
        )}
        <Link to="/admin/requests" className="demo-button demo-button-secondary no-underline">
          Back to requests
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        {order.items.map((item) => (
          <article key={item.id} className="island-shell overflow-hidden rounded-2xl">
            {item.listingPhoto ? (
              <a href={item.listingPhoto} target="_blank" rel="noreferrer" className="block">
                <img
                  src={item.listingPhoto}
                  alt={item.listingTitle}
                  className="aspect-[4/3] w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </a>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-[var(--chip-bg)] text-sm text-[var(--sea-ink-soft)]">
                No photo
              </div>
            )}
            <div className="space-y-2 p-4">
              <Link
                to="/admin/listings/$listingId"
                params={{ listingId: item.listingId }}
                className={statusLinkClass(item.listingStatus)}
              >
                {item.listingTitle}
              </Link>
              <p className="text-sm text-[var(--sea-ink-soft)]">
                {STATUS_LABELS[item.listingStatus]} · {INTENT_LABELS[item.intent]} ·{' '}
                {formatPrice(item.listingPrice)}
              </p>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

export const Route = createFileRoute('/admin/requests/$orderId')({
  loader: async ({ params }) => {
    const session = await getAdminSession()
    if (!session.isAuthenticated) {
      throw redirect({ to: '/admin/login' })
    }
    const order = await getOrder({ data: { id: params.orderId } })
    if (!order) {
      throw redirect({ to: '/admin/requests' })
    }
    return { order }
  },
  component: AdminRequestDetailPage,
})
