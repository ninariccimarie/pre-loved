import { z } from 'zod'

/**
 * Accepts public photo URLs, including Cloudflare R2:
 * - https://pub-xxxxx.r2.dev/...
 * - https://<accountid>.r2.cloudflarestorage.com/...
 * - Custom domain pointed at an R2 bucket (https://cdn.example.com/...)
 * - Presigned R2/S3 URLs with query strings
 */
export const isHttpPhotoUrl = (value: string): boolean => {
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export const photoUrlSchema = z
  .string()
  .trim()
  .min(1)
  .refine(isHttpPhotoUrl, {
    message:
      'Photo must be a valid http(s) URL (Cloudflare R2 public/custom domain or other CDN link)',
  })

export const photoUrlsSchema = z.array(photoUrlSchema).min(1).max(12)
