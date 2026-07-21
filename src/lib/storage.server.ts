import type { Listing as PrismaListing, Order, OrderItem } from '@prisma/client'
import type {
  Listing,
  ListingInput,
  OrderItemView,
  OrderView,
  PromoSettings,
} from '#/lib/types'
import { normalizeContact } from '#/lib/whatsapp'

type ListingWithCount = PrismaListing & { _count?: { orderItems: number } }

const mapListing = (row: ListingWithCount, waitlistCount = 0): Listing => ({
  id: row.id,
  title: row.title,
  price: row.price,
  status: row.status,
  description: row.description,
  condition: row.condition,
  photos: row.photos,
  clickCount: row.clickCount,
  waitlistCount,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
})

const mapOrderItem = (item: OrderItem): OrderItemView => ({
  id: item.id,
  listingId: item.listingId,
  intent: item.intent,
  listingTitle: item.listingTitle,
  listingStatus: item.listingStatus,
  listingPhoto: item.listingPhoto,
  listingPrice: item.listingPrice,
  createdAt: item.createdAt.toISOString(),
})

const mapOrder = (order: Order & { items: OrderItem[] }): OrderView => ({
  id: order.id,
  name: order.name,
  contact: order.contact,
  contacted: order.contacted,
  contactedAt: order.contactedAt?.toISOString() ?? null,
  createdAt: order.createdAt.toISOString(),
  items: order.items.map(mapOrderItem),
})

export const readListings = async (): Promise<Listing[]> => {
  const { prisma } = await import('#/lib/prisma.server')
  const rows = await prisma.listing.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: {
          orderItems: { where: { intent: 'waitlist' } },
        },
      },
    },
  })
  return rows.map((row) => mapListing(row, row._count.orderItems))
}

export const getListingById = async (id: string): Promise<Listing | null> => {
  const { prisma } = await import('#/lib/prisma.server')
  const row = await prisma.listing.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          orderItems: { where: { intent: 'waitlist' } },
        },
      },
    },
  })
  return row ? mapListing(row, row._count.orderItems) : null
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
      clickCount: listing.clickCount ?? 0,
      createdAt: new Date(listing.createdAt),
      updatedAt: new Date(listing.updatedAt),
    },
  })
  return mapListing(row, 0)
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
      include: {
        _count: {
          select: {
            orderItems: { where: { intent: 'waitlist' } },
          },
        },
      },
    })
    return mapListing(row, row._count.orderItems)
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

export const incrementListingClicks = async (id: string) => {
  const { prisma } = await import('#/lib/prisma.server')
  const row = await prisma.listing.update({
    where: { id },
    data: { clickCount: { increment: 1 } },
  })
  return row.clickCount
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

export type CreateOrderInput = {
  name: string
  contact: string
  items: Array<{
    listingId: string
    intent: 'reserve' | 'waitlist' | 'purchase'
  }>
}

export const createOrderRecord = async (input: CreateOrderInput): Promise<OrderView> => {
  const { prisma } = await import('#/lib/prisma.server')
  const contact = normalizeContact(input.contact)
  if (!contact) {
    throw new Error('A valid contact number is required')
  }

  const listingIds = [...new Set(input.items.map((item) => item.listingId))]
  const listings = await prisma.listing.findMany({
    where: { id: { in: listingIds } },
  })
  const listingMap = new Map(listings.map((listing) => [listing.id, listing]))

  for (const item of input.items) {
    if (!listingMap.has(item.listingId)) {
      throw new Error(`Listing not found: ${item.listingId}`)
    }
  }

  const order = await prisma.order.create({
    data: {
      name: input.name.trim(),
      contact,
      items: {
        create: input.items.map((item) => {
          const listing = listingMap.get(item.listingId)!
          return {
            listingId: listing.id,
            intent: item.intent,
            listingTitle: listing.title,
            listingStatus: listing.status,
            listingPhoto: listing.photos[0] ?? null,
            listingPrice: listing.price,
          }
        }),
      },
    },
    include: { items: true },
  })

  return mapOrder(order)
}

export const readOrders = async (): Promise<OrderView[]> => {
  const { prisma } = await import('#/lib/prisma.server')
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })
  return orders.map(mapOrder)
}

export const readOrderById = async (id: string): Promise<OrderView | null> => {
  const { prisma } = await import('#/lib/prisma.server')
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  })
  return order ? mapOrder(order) : null
}

export const readWaitlistOrders = async (): Promise<OrderView[]> => {
  const { prisma } = await import('#/lib/prisma.server')
  const orders = await prisma.order.findMany({
    where: {
      items: { some: { intent: 'waitlist' } },
    },
    include: {
      items: { where: { intent: 'waitlist' } },
    },
    orderBy: { createdAt: 'asc' },
  })
  return orders.map(mapOrder)
}

export const markOrderContacted = async (id: string): Promise<OrderView> => {
  const { prisma } = await import('#/lib/prisma.server')
  try {
    const order = await prisma.order.update({
      where: { id },
      data: {
        contacted: true,
        contactedAt: new Date(),
      },
      include: { items: true },
    })
    return mapOrder(order)
  } catch {
    throw new Error('Order not found')
  }
}
