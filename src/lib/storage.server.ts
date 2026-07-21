import type { Listing as PrismaListing } from '@prisma/client'
import type { Listing, ListingInput, PromoSettings } from '#/lib/types'

const mapListing = (row: PrismaListing): Listing => ({
  id: row.id,
  title: row.title,
  price: row.price,
  status: row.status,
  description: row.description,
  condition: row.condition,
  photos: row.photos,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
})

export const readListings = async (): Promise<Listing[]> => {
  const { prisma } = await import('#/lib/prisma.server')
  const rows = await prisma.listing.findMany({
    orderBy: { updatedAt: 'desc' },
  })
  return rows.map(mapListing)
}

export const getListingById = async (id: string): Promise<Listing | null> => {
  const { prisma } = await import('#/lib/prisma.server')
  const row = await prisma.listing.findUnique({ where: { id } })
  return row ? mapListing(row) : null
}

export const createListingRecord = async (listing: Listing): Promise<Listing> => {
  const { prisma } = await import('#/lib/prisma.server')
  const row = await prisma.listing.create({
    data: {
      id: listing.id,
      title: listing.title,
      price: listing.price,
      status: listing.status,
      description: listing.description,
      condition: listing.condition,
      photos: listing.photos,
      createdAt: new Date(listing.createdAt),
      updatedAt: new Date(listing.updatedAt),
    },
  })
  return mapListing(row)
}

export const updateListingRecord = async (
  id: string,
  input: ListingInput,
): Promise<Listing> => {
  const { prisma } = await import('#/lib/prisma.server')
  try {
    const row = await prisma.listing.update({
      where: { id },
      data: {
        title: input.title,
        price: input.price,
        status: input.status,
        description: input.description,
        condition: input.condition,
        photos: input.photos,
      },
    })
    return mapListing(row)
  } catch {
    throw new Error('Listing not found')
  }
}

export const deleteListingRecord = async (id: string) => {
  const { prisma } = await import('#/lib/prisma.server')
  try {
    await prisma.listing.delete({ where: { id } })
  } catch {
    throw new Error('Listing not found')
  }
}

export const readPromoSettings = async (): Promise<PromoSettings> => {
  const { prisma } = await import('#/lib/prisma.server')
  const row = await prisma.settings.findUnique({ where: { id: 1 } })

  if (!row) {
    return { promoCode: '', saleDiscountPercent: 0 }
  }

  return {
    promoCode: row.promoCode,
    saleDiscountPercent: row.saleDiscountPercent,
  }
}

export const writePromoSettings = async (settings: PromoSettings) => {
  const { prisma } = await import('#/lib/prisma.server')
  await prisma.settings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      promoCode: settings.promoCode,
      saleDiscountPercent: settings.saleDiscountPercent,
    },
    update: {
      promoCode: settings.promoCode,
      saleDiscountPercent: settings.saleDiscountPercent,
    },
  })
}
