import { describe, expect, it } from 'vitest'
import { isHttpPhotoUrl, photoUrlSchema } from './photoUrl'

describe('isHttpPhotoUrl', () => {
  it('accepts Cloudflare R2 public and custom domain links', () => {
    expect(isHttpPhotoUrl('https://pub-abc123.r2.dev/listings/chair-1.jpg')).toBe(true)
    expect(
      isHttpPhotoUrl(
        'https://abc123.r2.cloudflarestorage.com/bucket/photo.jpg?X-Amz-Signature=abc',
      ),
    ).toBe(true)
    expect(isHttpPhotoUrl('https://cdn.example.com/photos/lamp.webp')).toBe(true)
  })

  it('rejects non-http schemes and invalid URLs', () => {
    expect(isHttpPhotoUrl('r2://bucket/key')).toBe(false)
    expect(isHttpPhotoUrl('not-a-url')).toBe(false)
    expect(isHttpPhotoUrl('ftp://files.example.com/a.jpg')).toBe(false)
  })
})

describe('photoUrlSchema', () => {
  it('parses trimmed R2 URLs', () => {
    const result = photoUrlSchema.safeParse('  https://pub-abc.r2.dev/item.jpg  ')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toBe('https://pub-abc.r2.dev/item.jpg')
    }
  })
})
