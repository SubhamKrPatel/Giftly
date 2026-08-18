import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { GiftWithDetails } from '@/lib/database.types'

export function useGifts() {
  const { user } = useAuth()
  const [gifts, setGifts] = useState<GiftWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGifts = useCallback(async () => {
    if (!user) {
      setGifts([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const { data, error: queryError } = await supabase
        .from('gifts')
        .select(`
          *,
          occasion:occasions(*),
          template:templates(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (queryError) {
        throw queryError
      }

      setGifts((data as unknown as GiftWithDetails[]) || [])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (err as { message?: string })?.message || 'Failed to load gifts.'
      console.error('[useGifts] error fetching gifts:', msg)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [user])

  const deleteGift = useCallback(
    async (giftId: string): Promise<{ success: boolean; error: string | null }> => {
      try {
        const { error: deleteError } = await supabase
          .from('gifts')
          .delete()
          .eq('id', giftId)

        if (deleteError) {
          throw deleteError
        }

        setGifts((prev) => prev.filter((g) => g.id !== giftId))
        return { success: true, error: null }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : (err as { message?: string })?.message || 'Failed to delete gift.'
        console.error('[useGifts] error deleting gift:', msg)
        return { success: false, error: msg }
      }
    },
    []
  )

  useEffect(() => {
    fetchGifts()
  }, [fetchGifts])

  return { gifts, loading, error, refetch: fetchGifts, deleteGift }
}
