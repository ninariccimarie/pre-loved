import { Link, createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { getAdminSession } from '#/server/auth'
import { createListing } from '#/server/listings'
import ListingForm from '#/components/ListingForm'
import type { ListingInput } from '#/lib/types'

const NewListingPage = () => {
  const router = useRouter()
  const navigate = Route.useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (input: ListingInput) => {
    setSubmitting(true)
    setError('')
    try {
      await createListing({ data: input })
      await router.invalidate()
      await navigate({ to: '/admin' })
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Could not create listing. Check photo URLs and try again.',
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
        <p className="island-kicker mb-2">New listing</p>
        <h1 className="display-title mb-6 text-3xl font-bold text-[var(--sea-ink)]">
          Create listing
        </h1>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <ListingForm
          onSubmit={handleSubmit}
          onCancel={() => navigate({ to: '/admin' })}
          submitting={submitting}
        />
      </section>
    </main>
  )
}

export const Route = createFileRoute('/admin/listings/new')({
  loader: async () => {
    const session = await getAdminSession()
    if (!session.isAuthenticated) {
      throw redirect({ to: '/admin/login' })
    }
    return null
  },
  component: NewListingPage,
})
