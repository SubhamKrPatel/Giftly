import { supabase } from '@/lib/supabase'

export const MEDIA_BUCKET = 'gift-media'

// Image specifications
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_IMAGES_PER_GIFT = 20

// Video specifications (Part 4C)
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']
export const MAX_VIDEO_FILE_SIZE = 50 * 1024 * 1024 // 50MB
export const MAX_VIDEOS_PER_GIFT = 5

// Audio / Voice / Music specifications (Part 4D)
export const ALLOWED_MUSIC_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/x-m4a',
  'audio/m4a',
  'audio/aac',
  'audio/wav',
  'audio/webm',
  'audio/ogg',
]
export const MAX_MUSIC_FILE_SIZE = 15 * 1024 * 1024 // 15MB
export const MAX_VOICE_DURATION_SECONDS = 180 // 3 minutes

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
      error: `Invalid image format (${file.type || 'unknown'}). Please upload JPEG, PNG, or WebP images.`,
    }
  }

  if (file.size > MAX_IMAGE_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
    return {
      valid: false,
      error: `Image is too large (${sizeMB} MB). Maximum allowed size is 10 MB per image.`,
    }
  }

  return { valid: true }
}

/**
 * Validate video file format and size (Part 4C)
 */
export function validateVideoFile(file: File): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided.' }
  }

  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid video format (${file.type || 'unknown'}). Please upload MP4 or WebM video files.`,
    }
  }

  if (file.size > MAX_VIDEO_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
    return {
      valid: false,
      error: `Video is too large (${sizeMB} MB). Maximum allowed size is 50 MB per video.`,
    }
  }

  return { valid: true }
}

/**
 * Validate background music file format and size (Part 4D)
 */
export function validateMusicFile(file: File): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided.' }
  }

  // Also check extension if MIME type is generic
  const parts = file.name.split('.')
  const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
  const validExtensions = ['mp3', 'm4a', 'aac', 'wav', 'webm', 'ogg']

  const isValidMime = ALLOWED_MUSIC_TYPES.includes(file.type)
  const isValidExt = validExtensions.includes(ext)

  if (!isValidMime && !isValidExt) {
    return {
      valid: false,
      error: `Invalid audio format (${file.type || ext || 'unknown'}). Please upload MP3, M4A, AAC, WAV, or WebM audio files.`,
    }
  }

  if (file.size > MAX_MUSIC_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
    return {
      valid: false,
      error: `Audio file is too large (${sizeMB} MB). Maximum allowed size is 15 MB.`,
    }
  }

  return { valid: true }
}

/**
 * Generate standard storage path for gift photos:
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
 * Generate standard storage path for gift videos (Part 4C):
 * gifts/{userId}/{giftId}/videos/{mediaId}.{ext}
 */
export function generateVideoStoragePath(
  userId: string,
  giftId: string,
  mediaId: string,
  fileName: string
): string {
  const parts = fileName.split('.')
  const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'mp4'
  return `gifts/${userId}/${giftId}/videos/${mediaId}.${ext}`
}

/**
 * Generate standard storage path for voice recordings (Part 4D):
 * gifts/{userId}/{giftId}/voice/{mediaId}.{ext}
 */
export function generateVoiceStoragePath(
  userId: string,
  giftId: string,
  mediaId: string,
  ext = 'webm'
): string {
  return `gifts/${userId}/${giftId}/voice/${mediaId}.${ext}`
}

/**
 * Generate standard storage path for background music (Part 4D):
 * gifts/{userId}/{giftId}/music/{mediaId}.{ext}
 */
export function generateMusicStoragePath(
  userId: string,
  giftId: string,
  mediaId: string,
  fileName: string
): string {
  const parts = fileName.split('.')
  const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'mp3'
  return `gifts/${userId}/${giftId}/music/${mediaId}.${ext}`
}

/**
 * Upload binary file/blob to Supabase Storage gift-media bucket
 */
export async function uploadMediaToStorage(
  storagePath: string,
  file: File | Blob,
  contentType?: string
): Promise<{ error: Error | null }> {
  try {
    const mime = contentType || (file instanceof File ? file.type : 'application/octet-stream')
    const { error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: mime,
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

/**
 * Delete all binary storage objects associated with a gift:
 * gifts/{userId}/{giftId}/*
 */
export async function deleteAllGiftMediaFromStorage(
  userId: string,
  giftId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const folders = ['images', 'videos', 'voice', 'music']
    const pathsToDelete: string[] = []

    for (const folder of folders) {
      const folderPath = `gifts/${userId}/${giftId}/${folder}`
      const { data: files, error: listError } = await supabase.storage
        .from(MEDIA_BUCKET)
        .list(folderPath)

      if (!listError && files && files.length > 0) {
        for (const file of files) {
          if (file.name && file.name !== '.emptyFolderPlaceholder') {
            pathsToDelete.push(`${folderPath}/${file.name}`)
          }
        }
      }
    }

    // Also list direct root folder gifts/${userId}/${giftId}
    const rootPath = `gifts/${userId}/${giftId}`
    const { data: rootFiles, error: rootListError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .list(rootPath)

    if (!rootListError && rootFiles && rootFiles.length > 0) {
      for (const file of rootFiles) {
        if (file.name && !folders.includes(file.name) && file.name !== '.emptyFolderPlaceholder') {
          pathsToDelete.push(`${rootPath}/${file.name}`)
        }
      }
    }

    if (pathsToDelete.length > 0) {
      const { error: removeError } = await supabase.storage
        .from(MEDIA_BUCKET)
        .remove(pathsToDelete)

      if (removeError) {
        console.warn('[storage] Error removing batch storage paths:', removeError.message)
      }
    }

    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Storage folder cleanup failed'
    console.error('[storage] Delete all gift media error:', msg)
    return { success: false, error: msg }
  }
}

