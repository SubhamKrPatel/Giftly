import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { GiftMedia, GiftMediaItem } from '@/lib/database.types'
import {
  validateImageFile,
  generateMediaStoragePath,
  uploadMediaToStorage,
  getBatchSignedMediaUrls,
  deleteMediaFromStorage,
  MAX_IMAGES_PER_GIFT,
} from '@/lib/storage'

export function useGiftMedia(giftId?: string | null, sectionId?: string | null) {
  const { user } = useAuth()

  const [mediaItems, setMediaItems] = useState<GiftMediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{
    current: number
    total: number
    filename: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch media items for this gift
  const fetchMedia = useCallback(async () => {
    if (!giftId || !user) return

    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('gift_media')
        .select('*')
        .eq('gift_id', giftId)
        .order('position', { ascending: true })

      if (sectionId) {
        query = query.eq('section_id', sectionId)
      }

      const { data, error: dbError } = await query

      if (dbError) throw dbError

      const rawItems = (data as GiftMedia[]) || []

      // Batch resolve signed URLs for private images
      const paths = rawItems.map((item) => item.storage_path)
      const urlMap = await getBatchSignedMediaUrls(paths)

      const itemsWithUrls: GiftMediaItem[] = rawItems.map((item) => ({
        ...item,
        signedUrl: urlMap[item.storage_path] || undefined,
      }))

      setMediaItems(itemsWithUrls)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load gallery photos'
      console.error('[useGiftMedia] Fetch error:', msg)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [giftId, sectionId, user])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  // Upload multiple images with validation and progress
  const uploadFiles = useCallback(
    async (
      files: FileList | File[]
    ): Promise<{ successfulCount: number; errors: string[] }> => {
      if (!giftId || !user) {
        return { successfulCount: 0, errors: ['User not authenticated or gift not found.'] }
      }

      const fileArray = Array.from(files)
      if (fileArray.length === 0) {
        return { successfulCount: 0, errors: [] }
      }

      // Check max limit
      const currentCount = mediaItems.length
      if (currentCount + fileArray.length > MAX_IMAGES_PER_GIFT) {
        const availableSlots = Math.max(0, MAX_IMAGES_PER_GIFT - currentCount)
        const errMsg = `You can only add ${availableSlots} more photo(s). Maximum allowed is ${MAX_IMAGES_PER_GIFT} photos per gift.`
        setError(errMsg)
        return { successfulCount: 0, errors: [errMsg] }
      }

      setUploading(true)
      setError(null)

      const uploadErrors: string[] = []
      let successfulCount = 0
      let currentPosition = currentCount

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        setUploadProgress({
          current: i + 1,
          total: fileArray.length,
          filename: file.name,
        })

        // 1. Validate file
        const validation = validateImageFile(file)
        if (!validation.valid) {
          uploadErrors.push(`${file.name}: ${validation.error}`)
          continue
        }

        try {
          const mediaId = crypto.randomUUID()
          const storagePath = generateMediaStoragePath(user.id, giftId, mediaId, file.name)

          // 2. Upload to Supabase Storage
          const { error: storageError } = await uploadMediaToStorage(storagePath, file)
          if (storageError) {
            throw new Error(`Storage upload failed: ${storageError.message}`)
          }

          // 3. Insert record into gift_media
          const { error: dbError } = await supabase
            .from('gift_media')
            .insert({
              id: mediaId,
              gift_id: giftId,
              section_id: sectionId || null,
              media_type: 'image',
              storage_path: storagePath,
              file_name: file.name,
              mime_type: file.type,
              file_size: file.size,
              position: currentPosition,
            })

          if (dbError) {
            // Clean up storage object on DB failure
            await deleteMediaFromStorage(storagePath)
            throw dbError
          }

          successfulCount++
          currentPosition++
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Unknown upload error'
          console.error(`[useGiftMedia] Failed uploading ${file.name}:`, msg)
          uploadErrors.push(`${file.name}: ${msg}`)
        }
      }

      setUploading(false)
      setUploadProgress(null)

      if (uploadErrors.length > 0) {
        setError(uploadErrors.join(' | '))
      }

      // Refresh media items list
      await fetchMedia()

      return { successfulCount, errors: uploadErrors }
    },
    [giftId, sectionId, user, mediaItems.length, fetchMedia]
  )

  // Reorder photos up or down
  const reorderMedia = useCallback(
    async (mediaId: string, direction: 'up' | 'down') => {
      const sorted = [...mediaItems].sort((a, b) => a.position - b.position)
      const index = sorted.findIndex((m) => m.id === mediaId)
      if (index === -1) return

      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= sorted.length) return

      // Swap items
      const temp = sorted[index]
      sorted[index] = sorted[targetIndex]
      sorted[targetIndex] = temp

      // Normalize positions 0, 1, 2, ...
      const updatedList = sorted.map((item, idx) => ({
        ...item,
        position: idx,
      }))

      // Optimistic update
      setMediaItems(updatedList)

      try {
        const updates = updatedList.map((item) =>
          supabase
            .from('gift_media')
            .update({ position: item.position })
            .eq('id', item.id)
        )
        await Promise.all(updates)
      } catch (err) {
        console.error('[useGiftMedia] Reorder error:', err)
        fetchMedia()
      }
    },
    [mediaItems, fetchMedia]
  )

  // Delete a media item safely
  const deleteMedia = useCallback(
    async (mediaItem: GiftMediaItem): Promise<{ success: boolean; error?: string }> => {
      try {
        // 1. Delete storage object
        const { error: storageError } = await deleteMediaFromStorage(mediaItem.storage_path)
        if (storageError) {
          console.warn('[useGiftMedia] Storage deletion warning:', storageError.message)
        }

        // 2. Delete database record
        const { error: dbError } = await supabase
          .from('gift_media')
          .delete()
          .eq('id', mediaItem.id)

        if (dbError) throw dbError

        // 3. Update local state and normalize positions
        setMediaItems((prev) => {
          const filtered = prev.filter((item) => item.id !== mediaItem.id)
          return filtered.map((item, idx) => ({
            ...item,
            position: idx,
          }))
        })

        return { success: true }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to delete photo'
        console.error('[useGiftMedia] Delete error:', msg)
        setError(msg)
        return { success: false, error: msg }
      }
    },
    []
  )

  return {
    mediaItems,
    loading,
    uploading,
    uploadProgress,
    error,
    uploadFiles,
    reorderMedia,
    deleteMedia,
    refetch: fetchMedia,
  }
}
