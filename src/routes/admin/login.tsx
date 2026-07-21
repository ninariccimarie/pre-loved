import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { getAdminSession, loginAdmin } from '#/server/auth'

const AdminLoginPage = () => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = Route.useNavigate()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await loginAdmin({ data: { password } })
      await navigate({ to: '/admin' })
    } catch {
      setError('Invalid password. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="page-wrap px-4 pb-10 pt-10">
      <section className="island-shell mx-auto max-w-md rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">Admin</p>
        <h1 className="display-title mb-2 text-3xl font-bold text-[var(--sea-ink)]">Sign in</h1>
        <p className="mb-6 text-sm text-[var(--sea-ink-soft)]">
          Manage listings, photos, and promo settings.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-semibold">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="demo-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" className="demo-button w-full" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  )
}

export const Route = createFileRoute('/admin/login')({
  loader: async () => {
    const session = await getAdminSession()
    if (session.isAuthenticated) {
      throw redirect({ to: '/admin' })
    }
    return session
  },
  component: AdminLoginPage,
})
