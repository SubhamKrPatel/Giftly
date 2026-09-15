import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Gift, Loader2, AlertCircle, ArrowLeft, RotateCcw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type {
  GiftWithDetails,
  GiftSection,
  GiftMedia,
  GiftMediaItem,
} from '@/lib/database.types'
import { getBatchSignedMediaUrls } from '@/lib/storage'
import { DEFAULT_THEME } from '@/config/themes'
import { getPublicGift } from '@/lib/services/publishService'
import RecipientGiftExperience from '@/components/recipient/RecipientGiftExperience'

export default function RecipientGiftPage() {
  const { giftId, publicSlug } = useParams<{ giftId?: string; publicSlug?: string }>()

  const [gift, setGift] = useState<GiftWithDetails | null>(null)
  const [sections, setSections] = useState<GiftSection[]>([])
  const [mediaItems, setMediaItems] = useState<GiftMediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [networkError, setNetworkError] = useState<string | null>(null)

  // Fetch gift details, visible sections, and media
  const loadRecipientGift = useCallback(async () => {
    if (!giftId && !publicSlug) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setLoading(true)
    setNotFound(false)
    setNetworkError(null)

    try {
      // Mode A: Public Anonymous Access via /g/:publicSlug
      if (publicSlug) {
        const res = await getPublicGift(publicSlug)
        if (res.error || !res.data) {
          // If not found or inactive
          setNotFound(true)
          return
        }

        const pubGift = res.data.gift as unknown as GiftWithDetails
        setGift(pubGift)
        setSections(res.data.sections)
        setMediaItems(res.data.media)

        // Update document title safely
        document.title =
          pubGift.title ||
          `${pubGift.occasion?.name || 'A Special Gift'} for ${pubGift.recipient_name}`
        return
      }

      // Mode B: Creator Preview via /gift-preview/:giftId
      if (giftId) {
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
        if (!loadedGift.theme_config || Object.keys(loadedGift.theme_config).length === 0) {
          loadedGift.theme_config = DEFAULT_THEME
        }
        setGift(loadedGift)

        // Update page title
        document.title =
          loadedGift.title ||
          `${loadedGift.occasion?.name || 'Gift'} for ${loadedGift.recipient_name}`

        // Fetch visible sections
        const { data: sectionData, error: sectionError } = await supabase
          .from('gift_sections')
          .select('*')
          .eq('gift_id', giftId)
          .eq('is_visible', true)
          .order('position', { ascending: true })

        if (sectionError) throw sectionError
        setSections((sectionData as GiftSection[]) || [])

        // Fetch media items & resolve signed URLs
        const { data: mediaData, error: mediaError } = await supabase
          .from('gift_media')
          .select('*')
          .eq('gift_id', giftId)
          .order('position', { ascending: true })

        if (!mediaError && mediaData) {
          const rawMedia = mediaData as GiftMedia[]
          const paths = rawMedia.map((m) => m.storage_path)
          const urlMap = await getBatchSignedMediaUrls(paths)

          const resolvedMedia: GiftMediaItem[] = rawMedia.map((m) => ({
            ...m,
            signedUrl: urlMap[m.storage_path] || undefined,
          }))

          setMediaItems(resolvedMedia)
        }
      }
    } catch (err: unknown) {
      console.warn('[RecipientGiftPage] Error loading gift:', err)
      setNetworkError('Something went wrong while loading your gift.')
    } finally {
      setLoading(false)
    }
  }, [giftId, publicSlug])

  useEffect(() => {
    loadRecipientGift()
  }, [loadRecipientGift])

  // 1. Loading State
  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 text-center select-none"
        style={{
          background: 'linear-gradient(160deg, #fdf8ef 0%, #fff1f2 50%, #fdf4f5 100%)',
        }}
      >
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-sm mb-4 animate-bounce">
          <Gift className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-xl sm:text-2xl font-medium text-neutral-800">
          A little surprise is loading… ❤️
        </h1>
        <p className="text-xs text-neutral-400 mt-2 flex items-center justify-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
          <span>Opening special moments</span>
        </p>
      </div>
    )
  }

  // 2. Network / Fetch Error State (with Try Again retry action)
  if (networkError) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{
          background: 'linear-gradient(160deg, #fdf8ef 0%, #fff1f2 50%, #fdf4f5 100%)',
        }}
      >
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-warm-200 shadow-card text-center max-w-md w-full animate-fade-in-up space-y-6">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-neutral-800 mb-2">
              Something went wrong while loading your gift.
            </h2>
            <p className="text-xs text-neutral-500 leading-relaxed">
              We couldn&apos;t reach the server. Please check your internet connection and try again.
            </p>
          </div>
          <button
            type="button"
            onClick={loadRecipientGift}
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-full text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    )
  }

  // 3. Not Found / Unpublished State
  if (notFound || !gift) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{
          background: 'linear-gradient(160deg, #fdf8ef 0%, #fff1f2 50%, #fdf4f5 100%)',
        }}
      >
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-warm-200 shadow-card text-center max-w-md w-full animate-fade-in-up space-y-6">
          <div className="w-16 h-16 bg-warm-100 rounded-2xl flex items-center justify-center mx-auto text-neutral-500">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-neutral-800 mb-2">
              This gift couldn&apos;t be found.
            </h2>
            <p className="text-xs text-neutral-500 leading-relaxed">
              The link may be incorrect or the gift may no longer be available.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-full text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Giftly</span>
          </Link>
        </div>
      </div>
    )
  }

  // 4. Multipage Recipient Experience
  return (
    <RecipientGiftExperience
      gift={gift}
      sections={sections}
      mediaItems={mediaItems}
    />
  )
}
