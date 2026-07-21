import { describe, expect, it } from 'vitest'
import { formatPrice, getSalePrice, isPromoActive } from './pricing'

describe('formatPrice', () => {
  it('shows Free for zero', () => {
    expect(formatPrice(0)).toBe('Free')
  })

  it('formats SGD amounts', () => {
    expect(formatPrice(45)).toBe('S$45.00')
    expect(formatPrice(12.5)).toBe('S$12.50')
  })
})

describe('getSalePrice', () => {
  it('applies percentage discount', () => {
    expect(getSalePrice(100, 20)).toBe(80)
    expect(getSalePrice(45, 20)).toBe(36)
  })

  it('keeps free items free', () => {
    expect(getSalePrice(0, 50)).toBe(0)
  })

  it('clamps discount between 0 and 100', () => {
    expect(getSalePrice(100, -10)).toBe(100)
    expect(getSalePrice(100, 150)).toBe(0)
  })
})

describe('isPromoActive', () => {
  it('matches codes case-insensitively', () => {
    expect(isPromoActive('friends20', 'FRIENDS20', 20)).toBe(true)
  })

  it('rejects empty or zero-discount codes', () => {
    expect(isPromoActive('', 'FRIENDS20', 20)).toBe(false)
    expect(isPromoActive('FRIENDS20', '', 20)).toBe(false)
    expect(isPromoActive('FRIENDS20', 'FRIENDS20', 0)).toBe(false)
  })
})
