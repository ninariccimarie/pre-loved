import { Link, createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { getAdminSession, logoutAdmin } from '#/server/auth'
import { getOrders } from '#/server/orders'
import AdminNav, { statusLinkClass } from '#/components/AdminNav'
import { INTENT_LABELS } from '#/lib/types'

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString('en-SG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

const AdminRequestsPage = () => {
  const { orders } = Route.useLoaderData()
  const router = useRouter()

  const handleLogout = async () => {
    await logoutAdmin()
    await router.navigate({ to: '/admin/login' })
  }

  return (
    <main className="page-wrap px-4 pb-10 pt-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="island-kicker mb-1">Admin</p>
          <h1 className="display-title text-3xl font-bold text-[var(--sea-ink)] sm:text-4xl">
            Buyer requests
          </h1>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
            Mobile number is the buyer identifier. Green = available, orange = reserved / waitlist,
            gray = sold.
          </p>
        </div>
        <AdminNav onLogout={handleLogout} />
      </div>

      {orders.length === 0 ? (
        <section className="island-shell rounded-2xl p-8 text-center">
          <p className="text-[var(--sea-ink-soft)]">No requests yet.</p>
        </section>
      ) : (
        <section className="demo-table-shell">
          <table className="demo-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>Items</th>
                <th>Contacted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="whitespace-nowrap text-sm">{formatWhen(order.createdAt)}</td>
                  <td>
                    <Link
                      to="/admin/requests/$orderId"
                      params={{ orderId: order.id }}
                      className="font-semibold text-[var(--sea-ink)] no-underline hover:underline"
                    >
                      {order.name}
                    </Link>
                  </td>
                  <td className="font-mono text-sm">{order.contact}</td>
                  <td>
                    <ul className="space-y-1">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          <Link
                            to="/admin/listings/$listingId"
                            params={{ listingId: item.listingId }}
                            className={statusLinkClass(item.listingStatus)}
                          >
                            {item.listingTitle}
                          </Link>
                          <span className="ml-1 text-xs text-[var(--sea-ink-soft)]">
                            ({INTENT_LABELS[item.intent]})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    {order.contacted ? (
                      <span className="text-sm font-semibold text-emerald-700">Yes</span>
                    ) : (
                      <span className="text-sm text-[var(--sea-ink-soft)]">No</span>
                    )}
                  </td>
                  <td>
                    <Link
                      to="/admin/requests/$orderId"
                      params={{ orderId: order.id }}
                      className="demo-button demo-button-secondary no-underline px-3 py-1.5 text-xs"
                    >
                      Open
                    </Link>
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

export const Route = createFileRoute('/admin/requests/')({
  loader: async () => {
    const session = await getAdminSession()
    if (!session.isAuthenticated) {
      throw redirect({ to: '/admin/login' })
    }
    const orders = await getOrders()
    return { orders }
  },
  component: AdminRequestsPage,
})
