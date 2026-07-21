export const LISTING_STATUSES = ['available', 'reserved', 'sold'] as const
export type ListingStatus = (typeof LISTING_STATUSES)[number]

export const LISTING_CONDITIONS = [
  'brand_new',
  'like_new',
  'lightly_used',
  'well_used',
  'heavily_used',
] as const
export type ListingCondition = (typeof LISTING_CONDITIONS)[number]

export type Listing = {
  id: string
  title: string
  price: number
  status: ListingStatus
  description: string
  condition: ListingCondition
  photos: string[]
  createdAt: string
  updatedAt: string
}

export type PromoSettings = {
  promoCode: string
  saleDiscountPercent: number
}

export type ListingInput = Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>

export const STATUS_LABELS: Record<ListingStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold',
}

export const CONDITION_LABELS: Record<ListingCondition, string> = {
  brand_new: 'Brand new',
  like_new: 'Like new',
  lightly_used: 'Lightly used',
  well_used: 'Well used',
  heavily_used: 'Heavily used',
}
