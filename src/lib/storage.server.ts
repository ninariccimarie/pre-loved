import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import type {
  Listing,
  ListingCondition,
  ListingInput,
  ListingStatus,
  PromoSettings,
} from '#/lib/types'

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), 'data')
const DB_PATH = process.env.DATABASE_PATH ?? path.join(DATA_DIR, 'pre-loved.db')

type ListingRow = {
  id: string
  title: string
  price: number
  status: string
  description: string
  condition: string
  photos: string
  created_at: string
  updated_at: string
}

let dbInstance: DatabaseSync | null = null
let initialized = false

const mapListing = (row: ListingRow): Listing => {
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    status: row.status as ListingStatus,
    description: row.description,
    condition: row.condition as ListingCondition,
    photos: JSON.parse(row.photos) as string[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const seedIfEmpty = (db: DatabaseSync) => {
  const listingCount = db.prepare('SELECT COUNT(*) AS count FROM listings').get() as {
    count: number
  }
  const settingsCount = db.prepare('SELECT COUNT(*) AS count FROM settings').get() as {
    count: number
  }

  if (listingCount.count === 0) {
    const seedPath = path.join(process.cwd(), 'data', 'listings.seed.json')
    if (fs.existsSync(seedPath)) {
      const listings = JSON.parse(fs.readFileSync(seedPath, 'utf-8')) as Listing[]
      const insert = db.prepare(`
        INSERT INTO listings (id, title, price, status, description, condition, photos, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      for (const listing of listings) {
        insert.run(
          listing.id,
          listing.title,
          listing.price,
          listing.status,
          listing.description,
          listing.condition,
          JSON.stringify(listing.photos),
          listing.createdAt,
          listing.updatedAt,
        )
      }
    }
  }

  if (settingsCount.count === 0) {
    const seedPath = path.join(process.cwd(), 'data', 'settings.seed.json')
    let promoCode = ''
    let saleDiscountPercent = 0
    if (fs.existsSync(seedPath)) {
      const settings = JSON.parse(fs.readFileSync(seedPath, 'utf-8')) as PromoSettings
      promoCode = settings.promoCode
      saleDiscountPercent = settings.saleDiscountPercent
    }
    db.prepare(
      'INSERT INTO settings (id, promo_code, sale_discount_percent) VALUES (1, ?, ?)',
    ).run(promoCode, saleDiscountPercent)
  }
}

const ensureSchema = (db: DatabaseSync) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      price REAL NOT NULL,
      status TEXT NOT NULL,
      description TEXT NOT NULL,
      condition TEXT NOT NULL,
      photos TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      promo_code TEXT NOT NULL DEFAULT '',
      sale_discount_percent REAL NOT NULL DEFAULT 0
    );
  `)
  seedIfEmpty(db)
}

export const getDb = () => {
  if (!dbInstance) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
    dbInstance = new DatabaseSync(DB_PATH)
  }
  if (!initialized) {
    ensureSchema(dbInstance)
    initialized = true
  }
  return dbInstance
}

export const readListings = (): Listing[] => {
  const db = getDb()
  const rows = db
    .prepare(
      `SELECT id, title, price, status, description, condition, photos, created_at, updated_at
       FROM listings
       ORDER BY updated_at DESC`,
    )
    .all() as ListingRow[]
  return rows.map(mapListing)
}

export const getListingById = (id: string): Listing | null => {
  const db = getDb()
  const row = db
    .prepare(
      `SELECT id, title, price, status, description, condition, photos, created_at, updated_at
       FROM listings
       WHERE id = ?`,
    )
    .get(id) as ListingRow | undefined
  return row ? mapListing(row) : null
}

export const createListingRecord = (listing: Listing): Listing => {
  const db = getDb()
  db.prepare(
    `INSERT INTO listings (id, title, price, status, description, condition, photos, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    listing.id,
    listing.title,
    listing.price,
    listing.status,
    listing.description,
    listing.condition,
    JSON.stringify(listing.photos),
    listing.createdAt,
    listing.updatedAt,
  )
  return listing
}

export const updateListingRecord = (id: string, input: ListingInput): Listing => {
  const db = getDb()
  const existing = getListingById(id)
  if (!existing) {
    throw new Error('Listing not found')
  }

  const updated: Listing = {
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  }

  db.prepare(
    `UPDATE listings
     SET title = ?, price = ?, status = ?, description = ?, condition = ?, photos = ?, updated_at = ?
     WHERE id = ?`,
  ).run(
    updated.title,
    updated.price,
    updated.status,
    updated.description,
    updated.condition,
    JSON.stringify(updated.photos),
    updated.updatedAt,
    id,
  )

  return updated
}

export const deleteListingRecord = (id: string) => {
  const db = getDb()
  const result = db.prepare('DELETE FROM listings WHERE id = ?').run(id)
  if (result.changes === 0) {
    throw new Error('Listing not found')
  }
}

export const readPromoSettings = (): PromoSettings => {
  const db = getDb()
  const row = db
    .prepare('SELECT promo_code, sale_discount_percent FROM settings WHERE id = 1')
    .get() as { promo_code: string; sale_discount_percent: number } | undefined

  if (!row) {
    return { promoCode: '', saleDiscountPercent: 0 }
  }

  return {
    promoCode: row.promo_code,
    saleDiscountPercent: row.sale_discount_percent,
  }
}

export const writePromoSettings = (settings: PromoSettings) => {
  const db = getDb()
  db.prepare(
    `INSERT INTO settings (id, promo_code, sale_discount_percent)
     VALUES (1, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       promo_code = excluded.promo_code,
       sale_discount_percent = excluded.sale_discount_percent`,
  ).run(settings.promoCode, settings.saleDiscountPercent)
}
