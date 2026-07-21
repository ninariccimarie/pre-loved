import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { Listing, PromoSettings } from '../src/lib/types'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

const seed = async () => {
  const listingCount = await prisma.listing.count()
  const settingsCount = await prisma.settings.count()

  if (listingCount === 0) {
    const listingsPath = path.join(process.cwd(), 'data', 'listings.seed.json')
    const listings = JSON.parse(readFileSync(listingsPath, 'utf-8')) as Listing[]
    await prisma.listing.createMany({
      data: listings.map((listing) => ({
        id: listing.id,
        title: listing.title,
        price: listing.price,
        status: listing.status,
        description: listing.description,
        condition: listing.condition,
        photos: listing.photos,
        createdAt: new Date(listing.createdAt),
        updatedAt: new Date(listing.updatedAt),
      })),
    })
    console.log(`Seeded ${listings.length} listings`)
  } else {
    console.log('Listings already present, skipping listing seed')
  }

  if (settingsCount === 0) {
    const settingsPath = path.join(process.cwd(), 'data', 'settings.seed.json')
    const settings = JSON.parse(readFileSync(settingsPath, 'utf-8')) as PromoSettings
    await prisma.settings.create({
      data: {
        id: 1,
        promoCode: settings.promoCode,
        saleDiscountPercent: settings.saleDiscountPercent,
      },
    })
    console.log('Seeded promo settings')
  } else {
    console.log('Settings already present, skipping settings seed')
  }
}

seed()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
