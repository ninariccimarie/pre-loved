import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {
  LISTING_CONDITIONS,
  LISTING_STATUSES,
  type Listing,
} from '#/lib/types'

const listingInputSchema = z.object({
  title: z.string().min(1).max(120),
  price: z.number().min(0),
  status: z.enum(LISTING_STATUSES),
  description: z.string().min(1).max(5000),
  condition: z.enum(LISTING_CONDITIONS),
  photos: z.array(z.string().url()).min(1).max(12),
})

const assertAdmin = async () => {
  const { isAdminAuthenticated } = await import('#/lib/auth.server')
  if (!isAdminAuthenticated()) {
    throw new Error('Unauthorized')
  }
}

export const getListings = createServerFn({ method: 'GET' }).handler(async () => {
  const { readListings } = await import('#/lib/storage.server')
  return readListings()
})

export const getListing = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { getListingById } = await import('#/lib/storage.server')
    return getListingById(data.id)
  })

export const getPublicCatalog = createServerFn({ method: 'GET' }).handler(async () => {
  const { readListings, readPromoSettings } = await import('#/lib/storage.server')
  const [listings, settings] = await Promise.all([readListings(), readPromoSettings()])

  return {
    listings,
    promoCode: settings.promoCode,
    saleDiscountPercent: settings.saleDiscountPercent,
  }
})

export const createListing = createServerFn({ method: 'POST' })
  .validator(listingInputSchema)
  .handler(async ({ data }) => {
    await assertAdmin()
    const { randomUUID } = await import('node:crypto')
    const { createListingRecord } = await import('#/lib/storage.server')
    const now = new Date().toISOString()
    const listing: Listing = {
      id: randomUUID(),
      ...data,
      createdAt: now,
      updatedAt: now,
    }
    return createListingRecord(listing)
  })

export const updateListing = createServerFn({ method: 'POST' })
  .validator(
    listingInputSchema.extend({
      id: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    await assertAdmin()
    const { updateListingRecord } = await import('#/lib/storage.server')
    const { id, ...input } = data
    return updateListingRecord(id, input)
  })

export const deleteListing = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    await assertAdmin()
    const { deleteListingRecord } = await import('#/lib/storage.server')
    await deleteListingRecord(data.id)
    return { success: true }
  })
