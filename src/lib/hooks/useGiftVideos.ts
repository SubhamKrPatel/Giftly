import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { GiftMedia, GiftMediaItem } from '@/lib/database.types'
import {
  validateVideoFile,
  generateVideoStoragePath,
  uploadMediaToStorage,
  getBatchSignedMediaUrls,
  deleteMediaFromStorage,
  MAX_VIDEOS_PER_GIFT,
} from '@/lib/storage'

export function useGiftVideos(giftId?: string | null, sectionId?: string | null) {
  const { user } = useAuth()

  const [videoItems, setVideoItems] = useState<GiftMediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{
    current: number
    total: number
    filename: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch video items for this gift
  const fetchVideos = useCallback(async () => {
    if (!giftId || !user) return

    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('gift_media')
        .select('*')
        .eq('gift_id', giftId)
        .eq('media_type', 'video')
        .order('position', { ascending: true })

      if (sectionId) {
        query = query.eq('section_id', sectionId)
      }

      const { data, error: dbError } = await query

      if (dbError) throw dbError

      const rawItems = (data as GiftMedia[]) || []

      // Batch resolve signed URLs for private videos
      const paths = rawItems.map((item) => item.storage_path)
      const urlMap = await getBatchSignedMediaUrls(paths)

      const itemsWithUrls: GiftMediaItem[] = rawItems.map((item) => ({
        ...item,
        signedUrl: urlMap[item.storage_path] || undefined,
      }))

      setVideoItems(itemsWithUrls)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load videos'
      console.error('[useGiftVideos] Fetch error:', msg)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [giftId, sectionId, user])

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  // Upload video files with progress and validation
  const uploadVideoFiles = useCallback(
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

      // Check max limit (max 5 videos)
      const currentCount = videoItems.length
      if (currentCount + fileArray.length > MAX_VIDEOS_PER_GIFT) {
        const availableSlots = Math.max(0, MAX_VIDEOS_PER_GIFT - currentCount)
        const errMsg = `You can only add ${availableSlots} more video(s). Maximum allowed is ${MAX_VIDEOS_PER_GIFT} videos per gift.`
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

        // 1. Validate video file
        const validation = validateVideoFile(file)
        if (!validation.valid) {
          uploadErrors.push(`${file.name}: ${validation.error}`)
          continue
        }

        try {
          const mediaId = crypto.randomUUID()
          const storagePath = generateVideoStoragePath(user.id, giftId, mediaId, file.name)

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
              media_type: 'video',
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
          console.error(`[useGiftVideos] Failed uploading ${file.name}:`, msg)
          uploadErrors.push(`${file.name}: ${msg}`)
        }
      }

      setUploading(false)
      setUploadProgress(null)

      if (uploadErrors.length > 0) {
        setError(uploadErrors.join(' | '))
      }

      // Refresh videos list
      await fetchVideos()

      return { successfulCount, errors: uploadErrors }
    },
    [giftId, sectionId, user, videoItems.length, fetchVideos]
  )

  // Reorder videos up or down
  const reorderVideos = useCallback(
    async (mediaId: string, direction: 'up' | 'down') => {
      const sorted = [...videoItems].sort((a, b) => a.position - b.position)
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
      setVideoItems(updatedList)

      try {
        const updates = updatedList.map((item) =>
          supabase
            .from('gift_media')
            .update({ position: item.position })
            .eq('id', item.id)
        )
        await Promise.all(updates)
      } catch (err) {
        console.error('[useGiftVideos] Reorder error:', err)
        fetchVideos()
      }
    },
    [videoItems, fetchVideos]
  )

  // Delete a video safely
  const deleteVideo = useCallback(
    async (videoItem: GiftMediaItem): Promise<{ success: boolean; error?: string }> => {
      try {
        // 1. Delete storage object
        const { error: storageError } = await deleteMediaFromStorage(videoItem.storage_path)
        if (storageError) {
          console.warn('[useGiftVideos] Storage deletion warning:', storageError.message)
        }

        // 2. Delete database record
        const { error: dbError } = await supabase
          .from('gift_media')
          .delete()
          .eq('id', videoItem.id)

        if (dbError) throw dbError

        // 3. Update local state and normalize positions
        setVideoItems((prev) => {
          const filtered = prev.filter((item) => item.id !== videoItem.id)
          return filtered.map((item, idx) => ({
            ...item,
            position: idx,
          }))
        })

        return { success: true }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to delete video'
        console.error('[useGiftVideos] Delete error:', msg)
        setError(msg)
        return { success: false, error: msg }
      }
    },
    []
  )

  return {
    videoItems,
    loading,
    uploading,
    uploadProgress,
    error,
    uploadVideoFiles,
    reorderVideos,
    deleteVideo,
    refetch: fetchVideos,
  }
}
