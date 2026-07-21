import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export const getPromoSettings = createServerFn({ method: 'GET' }).handler(async () => {
  const { readPromoSettings } = await import('#/lib/storage.server')
  return readPromoSettings()
})

export const updatePromoSettings = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      promoCode: z.string().max(40),
      saleDiscountPercent: z.number().min(0).max(100),
    }),
  )
  .handler(async ({ data }) => {
    const { isAdminAuthenticated } = await import('#/lib/auth.server')
    if (!isAdminAuthenticated()) {
      throw new Error('Unauthorized')
    }
    const { writePromoSettings } = await import('#/lib/storage.server')
    await writePromoSettings({
      promoCode: data.promoCode.trim(),
      saleDiscountPercent: data.saleDiscountPercent,
    })
    return data
  })
