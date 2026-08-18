import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { GiftMedia, GiftMediaItem } from '@/lib/database.types'
import {
  validateMusicFile,
  generateVoiceStoragePath,
  generateMusicStoragePath,
  uploadMediaToStorage,
  getSignedMediaUrl,
  deleteMediaFromStorage,
} from '@/lib/storage'

export function useGiftAudio(
  giftId?: string | null,
  sectionId?: string | null,
  sectionType: 'voice' | 'music' = 'voice'
) {
  const { user } = useAuth()

  const [audioItem, setAudioItem] = useState<GiftMediaItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch single audio item for this section
  const fetchAudio = useCallback(async () => {
    if (!giftId || !user) return

    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('gift_media')
        .select('*')
        .eq('gift_id', giftId)
        .eq('media_type', 'audio')

      if (sectionId) {
        query = query.eq('section_id', sectionId)
      }

      const { data, error: dbError } = await query

      if (dbError) throw dbError

      const rawItems = (data as GiftMedia[]) || []
      if (rawItems.length > 0) {
        const item = rawItems[0]
        const signedUrl = await getSignedMediaUrl(item.storage_path)
        setAudioItem({
          ...item,
          signedUrl: signedUrl || undefined,
        })
      } else {
        setAudioItem(null)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load audio'
      console.error(`[useGiftAudio:${sectionType}] Fetch error:`, msg)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [giftId, sectionId, sectionType, user])

  useEffect(() => {
    fetchAudio()
  }, [fetchAudio])

  // Save voice recording (blob)
  const saveVoiceRecording = useCallback(
    async (blob: Blob, mimeType: string): Promise<{ success: boolean; error?: string }> => {
      if (!giftId || !user) {
        return { success: false, error: 'User not authenticated or gift not found.' }
      }

      setUploading(true)
      setError(null)

      try {
        // 1. If audio already exists, delete previous storage object & DB record
        if (audioItem) {
          await deleteMediaFromStorage(audioItem.storage_path)
          await supabase.from('gift_media').delete().eq('id', audioItem.id)
        }

        const mediaId = crypto.randomUUID()
        const ext = mimeType.includes('mp4') ? 'm4a' : mimeType.includes('ogg') ? 'ogg' : 'webm'
        const storagePath = generateVoiceStoragePath(user.id, giftId, mediaId, ext)

        // 2. Upload to storage
        const { error: storageError } = await uploadMediaToStorage(storagePath, blob, mimeType)
        if (storageError) {
          throw new Error(`Storage upload failed: ${storageError.message}`)
        }

        // 3. Insert record into gift_media
        const { error: dbError } = await supabase.from('gift_media').insert({
          id: mediaId,
          gift_id: giftId,
          section_id: sectionId || null,
          media_type: 'audio',
          storage_path: storagePath,
          file_name: 'voice-message.webm',
          mime_type: mimeType,
          file_size: blob.size,
          position: 0,
        })

        if (dbError) {
          await deleteMediaFromStorage(storagePath)
          throw dbError
        }

        await fetchAudio()
        return { success: true }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to save voice recording'
        console.error('[useGiftAudio:voice] Save error:', msg)
        setError(msg)
        return { success: false, error: msg }
      } finally {
        setUploading(false)
      }
    },
    [giftId, sectionId, user, audioItem, fetchAudio]
  )

  // Upload music file
  const uploadMusic = useCallback(
    async (file: File): Promise<{ success: boolean; error?: string }> => {
      if (!giftId || !user) {
        return { success: false, error: 'User not authenticated or gift not found.' }
      }

      // Validate music file
      const validation = validateMusicFile(file)
      if (!validation.valid) {
        setError(validation.error || 'Invalid audio file.')
        return { success: false, error: validation.error }
      }

      setUploading(true)
      setError(null)

      try {
        // 1. If audio already exists, delete previous storage object & DB record
        if (audioItem) {
          await deleteMediaFromStorage(audioItem.storage_path)
          await supabase.from('gift_media').delete().eq('id', audioItem.id)
        }

        const mediaId = crypto.randomUUID()
        const storagePath = generateMusicStoragePath(user.id, giftId, mediaId, file.name)

        // 2. Upload to storage
        const { error: storageError } = await uploadMediaToStorage(storagePath, file)
        if (storageError) {
          throw new Error(`Storage upload failed: ${storageError.message}`)
        }

        // 3. Insert record into gift_media
        const { error: dbError } = await supabase.from('gift_media').insert({
          id: mediaId,
          gift_id: giftId,
          section_id: sectionId || null,
          media_type: 'audio',
          storage_path: storagePath,
          file_name: file.name,
          mime_type: file.type || 'audio/mpeg',
          file_size: file.size,
          position: 0,
        })

        if (dbError) {
          await deleteMediaFromStorage(storagePath)
          throw dbError
        }

        await fetchAudio()
        return { success: true }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to upload music'
        console.error('[useGiftAudio:music] Upload error:', msg)
        setError(msg)
        return { success: false, error: msg }
      } finally {
        setUploading(false)
      }
    },
    [giftId, sectionId, user, audioItem, fetchAudio]
  )

  // Delete audio safely
  const deleteAudio = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!audioItem) return { success: true }

    try {
      // 1. Delete storage object
      const { error: storageError } = await deleteMediaFromStorage(audioItem.storage_path)
      if (storageError) {
        console.warn(`[useGiftAudio:${sectionType}] Storage delete warning:`, storageError.message)
      }

      // 2. Delete database record
      const { error: dbError } = await supabase
        .from('gift_media')
        .delete()
        .eq('id', audioItem.id)

      if (dbError) throw dbError

      setAudioItem(null)
      return { success: true }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete audio'
      console.error(`[useGiftAudio:${sectionType}] Delete error:`, msg)
      setError(msg)
      return { success: false, error: msg }
    }
  }, [audioItem, sectionType])

  return {
    audioItem,
    loading,
    uploading,
    error,
    saveVoiceRecording,
    uploadMusic,
    deleteAudio,
    refetch: fetchAudio,
  }
}
