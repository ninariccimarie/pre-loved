import { Link, createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { getAdminSession, logoutAdmin } from '#/server/auth'
import { getWaitlistOrders } from '#/server/orders'
import AdminNav, { statusLinkClass } from '#/components/AdminNav'

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString('en-SG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

const AdminWaitlistPage = () => {
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
            Waitlist
          </h1>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
            Ordered by the time they submitted, oldest first.
          </p>
        </div>
        <AdminNav onLogout={handleLogout} />
      </div>

      {orders.length === 0 ? (
        <section className="island-shell rounded-2xl p-8 text-center">
          <p className="text-[var(--sea-ink-soft)]">No waitlist entries yet.</p>
        </section>
      ) : (
        <section className="demo-table-shell">
          <table className="demo-table">
            <thead>
              <tr>
                <th>Submitted</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>Items</th>
                <th>Contacted</th>
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
                      className="font-semibold text-[var(--lagoon-deep)] no-underline hover:underline"
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
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  )
}

export const Route = createFileRoute('/admin/waitlist/')({
  loader: async () => {
    const session = await getAdminSession()
    if (!session.isAuthenticated) {
      throw redirect({ to: '/admin/login' })
    }
    const orders = await getWaitlistOrders()
    return { orders }
  },
  component: AdminWaitlistPage,
})
