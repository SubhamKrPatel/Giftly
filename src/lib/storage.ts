import { supabase } from '@/lib/supabase'

export const MEDIA_BUCKET = 'gift-media'
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_IMAGES_PER_GIFT = 20

export interface FileValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validate image file format and size
 */
export function validateImageFile(file: File): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided.' }
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file format (${file.type || 'unknown'}). Please upload JPEG, PNG, or WebP images.`,
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
    return {
      valid: false,
      error: `File is too large (${sizeMB} MB). Maximum allowed size is 10 MB per image.`,
    }
  }

  return { valid: true }
}

/**
 * Generate standard storage path for gift media:
 * gifts/{userId}/{giftId}/images/{mediaId}.{ext}
 */
export function generateMediaStoragePath(
  userId: string,
  giftId: string,
  mediaId: string,
  fileName: string
): string {
  const parts = fileName.split('.')
  const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'jpg'
  return `gifts/${userId}/${giftId}/images/${mediaId}.${ext}`
}

/**
 * Upload binary file to Supabase Storage gift-media bucket
 */
export async function uploadMediaToStorage(
  storagePath: string,
  file: File
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      })

    if (error) throw error
    return { error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Storage upload failed'
    console.error('[storage] Upload error:', msg)
    return { error: new Error(msg) }
  }
}

/**
 * Generate a short-lived authenticated signed URL for a private storage object
 */
export async function getSignedMediaUrl(
  storagePath: string,
  expiresInSeconds = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .createSignedUrl(storagePath, expiresInSeconds)

    if (error || !data?.signedUrl) {
      console.warn('[storage] Error creating signed URL for', storagePath, error)
      return null
    }

    return data.signedUrl
  } catch (err) {
    console.error('[storage] Signed URL exception:', err)
    return null
  }
}

/**
 * Batch resolve signed URLs for multiple storage paths
 */
export async function getBatchSignedMediaUrls(
  storagePaths: string[],
  expiresInSeconds = 3600
): Promise<Record<string, string>> {
  const urlMap: Record<string, string> = {}
  if (storagePaths.length === 0) return urlMap

  try {
    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .createSignedUrls(storagePaths, expiresInSeconds)

    if (error || !data) {
      console.warn('[storage] Batch signed URLs error:', error)
      return urlMap
    }

    for (const item of data) {
      if (item.path && item.signedUrl) {
        urlMap[item.path] = item.signedUrl
      }
    }
  } catch (err) {
    console.error('[storage] Batch signed URLs exception:', err)
  }

  return urlMap
}

/**
 * Delete a binary object from Supabase Storage
 */
export async function deleteMediaFromStorage(
  storagePath: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .remove([storagePath])

    if (error) throw error
    return { error: null }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Storage deletion failed'
    console.error('[storage] Delete error:', msg)
    return { error: new Error(msg) }
  }
}
