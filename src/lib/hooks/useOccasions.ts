import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Occasion } from '@/lib/database.types'

export function useOccasions() {
  const [occasions, setOccasions] = useState<Occasion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOccasions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: queryError } = await supabase
        .from('occasions')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (queryError) {
        throw queryError
      }

      setOccasions(data || [])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (err as { message?: string })?.message || 'Failed to load occasions.'
      console.error('[useOccasions] error fetching occasions:', msg)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOccasions()
  }, [fetchOccasions])

  return { occasions, loading, error, refetch: fetchOccasions }
}
