import { describe, expect, it } from 'vitest'
import { buildContactMessage, buildWhatsAppUrl, normalizeContact } from '#/lib/whatsapp'

describe('whatsapp helpers', () => {
  it('normalizes contact digits', () => {
    expect(normalizeContact('+65 9123 4567')).toBe('6591234567')
  })

  it('builds wa.me urls with singapore prefix for 8-digit numbers', () => {
    const url = buildWhatsAppUrl('91234567', 'Hello')
    expect(url).toBe(`https://wa.me/6591234567?text=${encodeURIComponent('Hello')}`)
  })

  it('builds a friendly single-item message', () => {
    const message = buildContactMessage('Alex', ['Vintage Table Lamp'])
    expect(message).toContain('Hi Alex!')
    expect(message).toContain('Nina from the pre-loved items')
    expect(message).toContain('"Vintage Table Lamp"')
  })
})
