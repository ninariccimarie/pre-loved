import { Link, createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { getAdminSession } from '#/server/auth'
import { getListing, updateListing } from '#/server/listings'
import ListingForm from '#/components/ListingForm'
import type { ListingInput } from '#/lib/types'

const EditListingPage = () => {
  const { listing } = Route.useLoaderData()
  const router = useRouter()
  const navigate = Route.useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (input: ListingInput) => {
    setSubmitting(true)
    setError('')
    try {
      await updateListing({ data: { ...input, id: listing.id } })
      await router.invalidate()
      await navigate({ to: '/admin' })
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Could not update listing. Check photo URLs and try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="page-wrap px-4 pb-10 pt-8">
      <div className="mb-6">
        <Link to="/admin" className="text-sm font-semibold no-underline">
          ← Back to dashboard
        </Link>
      </div>

      <section className="island-shell mx-auto max-w-2xl rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">Edit listing</p>
        <h1 className="display-title mb-6 text-3xl font-bold text-[var(--sea-ink)]">
          {listing.title}
        </h1>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <ListingForm
          initial={listing}
          onSubmit={handleSubmit}
          onCancel={() => navigate({ to: '/admin' })}
          submitting={submitting}
        />
      </section>
    </main>
  )
}

export const Route = createFileRoute('/admin/listings/$listingId')({
  loader: async ({ params }) => {
    const session = await getAdminSession()
    if (!session.isAuthenticated) {
      throw redirect({ to: '/admin/login' })
    }
    const listing = await getListing({ data: { id: params.listingId } })
    if (!listing) {
      throw redirect({ to: '/admin' })
    }
    return { listing }
  },
  component: EditListingPage,
})
