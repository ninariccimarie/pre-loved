import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export const getAdminSession = createServerFn({ method: 'GET' }).handler(async () => {
  const { isAdminAuthenticated } = await import('#/lib/auth.server')
  return { isAuthenticated: isAdminAuthenticated() }
})

export const loginAdmin = createServerFn({ method: 'POST' })
  .validator(z.object({ password: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { verifyAdminPassword, issueAdminSession } = await import('#/lib/auth.server')
    if (!verifyAdminPassword(data.password)) {
      throw new Error('Invalid password')
    }
    issueAdminSession()
    return { success: true }
  })

export const logoutAdmin = createServerFn({ method: 'POST' }).handler(async () => {
  const { clearAdminSession } = await import('#/lib/auth.server')
  clearAdminSession()
  return { success: true }
})
