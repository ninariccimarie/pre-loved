import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { ORDER_ITEM_INTENTS } from '#/lib/types'

const assertAdmin = async () => {
  const { isAdminAuthenticated } = await import('#/lib/auth.server')
  if (!isAdminAuthenticated()) {
    throw new Error('Unauthorized')
  }
}

export const submitOrder = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      name: z.string().min(1).max(120),
      contact: z.string().min(6).max(30),
      items: z
        .array(
          z.object({
            listingId: z.string().min(1),
            intent: z.enum(ORDER_ITEM_INTENTS),
          }),
        )
        .min(1)
        .max(30),
    }),
  )
  .handler(async ({ data }) => {
    const { createOrderRecord } = await import('#/lib/storage.server')
    return createOrderRecord(data)
  })

export const getOrders = createServerFn({ method: 'GET' }).handler(async () => {
  await assertAdmin()
  const { readOrders } = await import('#/lib/storage.server')
  return readOrders()
})

export const getOrder = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    await assertAdmin()
    const { readOrderById } = await import('#/lib/storage.server')
    return readOrderById(data.id)
  })

export const getWaitlistOrders = createServerFn({ method: 'GET' }).handler(async () => {
  await assertAdmin()
  const { readWaitlistOrders } = await import('#/lib/storage.server')
  return readWaitlistOrders()
})

export const markOrderAsContacted = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    await assertAdmin()
    const { markOrderContacted } = await import('#/lib/storage.server')
    return markOrderContacted(data.id)
  })
