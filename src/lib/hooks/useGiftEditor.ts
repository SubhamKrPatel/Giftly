import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type {
  GiftWithDetails,
  GiftSection,
  GiftThemeConfig,
  SectionContent,
  CoverSectionContent,
  MessageSectionContent,
  FinalMessageSectionContent,
} from '@/lib/database.types'
import { DEFAULT_THEME } from '@/config/themes'
import { publishGift as apiPublishGift, unpublishGift as apiUnpublishGift } from '@/lib/services/publishService'

export type EditorTab = 'details' | 'cover' | 'message' | 'final_message' | 'theme' | string

export const DEFAULT_INITIAL_SECTIONS = [
  {
    section_type: 'cover',
    position: 0,
    content: {
      headline: 'A Little Surprise For You',
      subheadline: '',
    } as CoverSectionContent,
    is_visible: true,
  },
  {
    section_type: 'message',
    position: 1,
    content: {
      heading: 'A Message From Me',
      body: '',
    } as MessageSectionContent,
    is_visible: true,
  },
  {
    section_type: 'gallery',
    position: 2,
    content: {
      items: [],
    },
    is_visible: true,
  },
  {
    section_type: 'video',
    position: 3,
    content: {},
    is_visible: true,
  },
  {
    section_type: 'voice',
    position: 4,
    content: {},
    is_visible: true,
  },
  {
    section_type: 'music',
    position: 5,
    content: {},
    is_visible: true,
  },
  {
    section_type: 'final_message',
    position: 6,
    content: {
      heading: 'With Love',
      body: '',
    } as FinalMessageSectionContent,
    is_visible: true,
  },
]

export function useGiftEditor(giftId?: string | null) {
  const { user } = useAuth()

  const [gift, setGift] = useState<GiftWithDetails | null>(null)
  const [sections, setSections] = useState<GiftSection[]>([])
  const [selectedSectionType, setSelectedSectionType] = useState<EditorTab>('cover')
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved')
  const [saveError, setSaveError] = useState<string | null>(null)

  // Tracking pending saves
  const isDirtyRef = useRef(false)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const giftRef = useRef<GiftWithDetails | null>(null)
  const sectionsRef = useRef<GiftSection[]>([])

  giftRef.current = gift
  sectionsRef.current = sections

  // Fetch gift and its sections
  const fetchGiftAndSections = useCallback(async () => {
    if (!giftId || !user) return

    setLoading(true)
    setNotFound(false)
    try {
      // 1. Fetch gift with joined occasion and template
      const { data: giftData, error: giftError } = await supabase
        .from('gifts')
        .select(`
          *,
          occasion:occasions(*),
          template:templates(*)
        `)
        .eq('id', giftId)
        .single()

      if (giftError || !giftData) {
        setNotFound(true)
        return
      }

      const loadedGift = giftData as unknown as GiftWithDetails
      // Ensure theme_config has fallback
      if (!loadedGift.theme_config || Object.keys(loadedGift.theme_config).length === 0) {
        loadedGift.theme_config = (loadedGift.template?.theme_config as GiftThemeConfig) || DEFAULT_THEME
      }
      setGift(loadedGift)

      // 2. Fetch sections
      const { data: sectionData, error: sectionError } = await supabase
        .from('gift_sections')
        .select('*')
        .eq('gift_id', giftId)
        .order('position', { ascending: true })

      if (sectionError) {
        throw sectionError
      }

      let loadedSections = (sectionData as GiftSection[]) || []

      // 3. Fallback: If no sections exist (e.g. legacy gift), create default sections
      if (loadedSections.length === 0) {
        const sectionsToInsert = DEFAULT_INITIAL_SECTIONS.map((s) => ({
          gift_id: giftId,
          section_type: s.section_type,
          position: s.position,
          content: s.content,
          is_visible: s.is_visible,
        }))

        const { data: newSections, error: initError } = await supabase
          .from('gift_sections')
          .insert(sectionsToInsert)
          .select()
          .order('position', { ascending: true })

        if (!initError && newSections) {
          loadedSections = newSections as GiftSection[]
        }
      } else {
        // If existing gift lacks video, voice, or music sections, insert them smoothly
        const missingTypes = ['video', 'voice', 'music'].filter(
          (t) => !loadedSections.some((s) => s.section_type === t)
        )

        if (missingTypes.length > 0) {
          let maxPos = loadedSections.reduce((max, s) => Math.max(max, s.position), 0)
          for (const mType of missingTypes) {
            maxPos++
            const { data: newSec } = await supabase
              .from('gift_sections')
              .insert({
                gift_id: giftId,
                section_type: mType,
                position: maxPos,
                content: {},
                is_visible: true,
              })
              .select()
              .single()

            if (newSec) {
              loadedSections.push(newSec as GiftSection)
            }
          }
        }
      }

      setSections(loadedSections)
      setSaveStatus('saved')
      isDirtyRef.current = false
    } catch (err) {
      console.error('[useGiftEditor] Load error:', err)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [giftId, user])

  useEffect(() => {
    fetchGiftAndSections()
  }, [fetchGiftAndSections])

  // Save all pending changes to Supabase
  const saveAll = useCallback(async () => {
    const currentGift = giftRef.current
    const currentSections = sectionsRef.current

    if (!giftId || !currentGift) return

    setSaveStatus('saving')
    setSaveError(null)

    try {
      // 1. Update gift details and theme_config
      const { error: giftUpdateError } = await supabase
        .from('gifts')
        .update({
          title: currentGift.title,
          recipient_name: currentGift.recipient_name,
          sender_name: currentGift.sender_name,
          theme_config: currentGift.theme_config,
        })
        .eq('id', giftId)

      if (giftUpdateError) throw giftUpdateError

      // 2. Upsert sections
      if (currentSections.length > 0) {
        const updates = currentSections.map((s) =>
          supabase
            .from('gift_sections')
            .update({
              position: s.position,
              content: s.content,
              is_visible: s.is_visible,
            })
            .eq('id', s.id)
        )
        const results = await Promise.all(updates)
        const firstError = results.find((r) => r.error)?.error
        if (firstError) throw firstError
      }

      setSaveStatus('saved')
      isDirtyRef.current = false
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || 'Failed to save changes.'
      console.error('[useGiftEditor] Save error:', msg)
      setSaveError(msg)
      setSaveStatus('error')
    }
  }, [giftId])

  // Trigger debounced autosave (1000ms delay)
  const triggerAutosave = useCallback(() => {
    isDirtyRef.current = true
    setSaveStatus('unsaved')

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      saveAll()
    }, 1000)
  }, [saveAll])

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  // ── Modifiers ─────────────────────────────────────────────────────────────

  // Update gift basic fields (title, recipient, sender)
  const updateGiftDetails = useCallback(
    (details: { title?: string; recipient_name?: string; sender_name?: string | null }) => {
      setGift((prev) => (prev ? { ...prev, ...details } : null))
      triggerAutosave()
    },
    [triggerAutosave]
  )

  // Update gift theme
  const updateTheme = useCallback(
    (themeConfig: GiftThemeConfig) => {
      setGift((prev) => (prev ? { ...prev, theme_config: themeConfig } : null))
      triggerAutosave()
    },
    [triggerAutosave]
  )

  // Update section content
  const updateSectionContent = useCallback(
    (sectionType: string, contentUpdates: Partial<SectionContent>) => {
      setSections((prev) =>
        prev.map((section) => {
          if (section.section_type === sectionType) {
            return {
              ...section,
              content: { ...section.content, ...contentUpdates },
            }
          }
          return section
        })
      )
      triggerAutosave()
    },
    [triggerAutosave]
  )

  // Reorder sections up or down
  const reorderSection = useCallback(
    (sectionId: string, direction: 'up' | 'down') => {
      setSections((prev) => {
        const sorted = [...prev].sort((a, b) => a.position - b.position)
        const index = sorted.findIndex((s) => s.id === sectionId)
        if (index === -1) return prev

        const targetIndex = direction === 'up' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= sorted.length) return prev

        // Swap positions
        const temp = sorted[index]
        sorted[index] = sorted[targetIndex]
        sorted[targetIndex] = temp

        // Reassign clean normalized positions 0, 1, 2, ...
        const updated = sorted.map((s, idx) => ({
          ...s,
          position: idx,
        }))

        return updated
      })
      triggerAutosave()
    },
    [triggerAutosave]
  )

  // Toggle section visibility
  const toggleVisibility = useCallback(
    (sectionId: string) => {
      setSections((prev) =>
        prev.map((section) => {
          if (section.id === sectionId) {
            return { ...section, is_visible: !section.is_visible }
          }
          return section
        })
      )
      triggerAutosave()
    },
    [triggerAutosave]
  )

  // Publish Gift (Part 7)
  const publish = useCallback(async (): Promise<{
    success: boolean
    public_slug?: string
    error?: string
  }> => {
    if (!giftId) return { success: false, error: 'Missing gift ID' }

    // Save pending edits first
    await saveAll()

    const res = await apiPublishGift(giftId)
    if (res.success && res.public_slug) {
      setGift((prev) =>
        prev ? { ...prev, status: 'published', public_slug: res.public_slug! } : null
      )
    }
    return res
  }, [giftId, saveAll])

  // Unpublish Gift (Part 7)
  const unpublish = useCallback(async (): Promise<{
    success: boolean
    error?: string
  }> => {
    if (!giftId) return { success: false, error: 'Missing gift ID' }

    const res = await apiUnpublishGift(giftId)
    if (res.success) {
      setGift((prev) => (prev ? { ...prev, status: 'draft' } : null))
    }
    return res
  }, [giftId])

  return {
    gift,
    sections,
    selectedSectionType,
    setSelectedSectionType,
    loading,
    notFound,
    saveStatus,
    saveError,
    updateGiftDetails,
    updateTheme,
    updateSectionContent,
    reorderSection,
    toggleVisibility,
    saveAll,
    publish,
    unpublish,
    refetch: fetchGiftAndSections,
  }
}
