import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Template } from '@/lib/database.types'

export function useTemplates(occasionId?: string | null) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTemplates = useCallback(async () => {
    if (!occasionId) {
      setTemplates([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const { data, error: queryError } = await supabase
        .from('templates')
        .select('*')
        .eq('occasion_id', occasionId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (queryError) {
        throw queryError
      }

      setTemplates(data || [])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (err as { message?: string })?.message || 'Failed to load templates.'
      console.error('[useTemplates] error fetching templates:', msg)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [occasionId])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  return { templates, loading, error, refetch: fetchTemplates }
}
