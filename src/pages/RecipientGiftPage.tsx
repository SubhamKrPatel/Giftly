import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Heart,
  MessageSquareHeart,
  Image as ImageIcon,
  Video as VideoIcon,
  Mic,
  Music,
  ChevronDown,
  Gift,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type {
  GiftWithDetails,
  GiftSection,
  CoverSectionContent,
  MessageSectionContent,
  FinalMessageSectionContent,
  GiftMedia,
  GiftMediaItem,
} from '@/lib/database.types'
import { getBatchSignedMediaUrls } from '@/lib/storage'
import { DEFAULT_THEME } from '@/config/themes'
import { getPublicGift } from '@/lib/services/publishService'
import PhotoLightbox from '@/components/recipient/PhotoLightbox'

export default function RecipientGiftPage() {
  const { giftId, publicSlug } = useParams<{ giftId?: string; publicSlug?: string }>()

  const [gift, setGift] = useState<GiftWithDetails | null>(null)
  const [sections, setSections] = useState<GiftSection[]>([])
  const [mediaItems, setMediaItems] = useState<GiftMediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const contentRef = useRef<HTMLDivElement | null>(null)

  // Fetch gift details, visible sections, and media
  useEffect(() => {
    async function loadRecipientGift() {
      if (!giftId && !publicSlug) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setLoading(true)
      setNotFound(false)

      try {
        // Mode A: Public Anonymous Access via /g/:publicSlug
        if (publicSlug) {
          const res = await getPublicGift(publicSlug)
          if (res.error || !res.data) {
            setNotFound(true)
            return
          }

          const pubGift = res.data.gift as unknown as GiftWithDetails
          setGift(pubGift)
          setSections(res.data.sections)
          setMediaItems(res.data.media)

          // Update page title
          document.title = pubGift.title || `${pubGift.occasion?.name || 'A Special Gift'} for ${pubGift.recipient_name}`
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
          document.title = loadedGift.title || `${loadedGift.occasion?.name || 'Gift'} for ${loadedGift.recipient_name}`

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
      } catch (err) {
        console.error('[RecipientGiftPage] Error loading gift:', err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    loadRecipientGift()
  }, [giftId, publicSlug])

  // Open Gift interaction
  const handleOpenGift = () => {
    setHasOpened(true)
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // Loading State
  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
        style={{
          background: 'linear-gradient(160deg, #fdf8ef 0%, #fff1f2 50%, #fdf4f5 100%)',
        }}
      >
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-sm mb-4 animate-bounce">
          <Gift className="w-8 h-8" />
        </div>
        <p className="font-serif text-xl font-medium text-neutral-800">
          Preparing your surprise…
        </p>
        <p className="text-xs text-neutral-400 mt-1.5 flex items-center gap-1.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
          <span>Opening special memories</span>
        </p>
      </div>
    )
  }

  // Not Found State
  if (notFound || !gift) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{
          background: 'linear-gradient(160deg, #fdf8ef 0%, #fff1f2 50%, #fdf4f5 100%)',
        }}
      >
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-warm-200 shadow-card text-center max-w-md w-full animate-fade-in-up">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-rose-500">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-neutral-800 mb-2">
            Oops! This gift couldn&apos;t be found.
          </h2>
          <p className="text-xs text-neutral-500 mb-8 leading-relaxed">
            The gift link may be incorrect or the creator has not published it yet.
          </p>
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

  // Extract Theme
  const theme = gift.theme_config || DEFAULT_THEME
  const primaryColor = theme.primaryColor || '#f43f5e'
  const secondaryColor = theme.secondaryColor || '#fda4af'
  const accentColor = theme.accentColor || '#e11d48'
  const backgroundColor = theme.backgroundColor || '#fff1f2'
  const textColor = theme.textColor || '#1f2937'

  // Partition Media
  const photos = mediaItems.filter((m) => m.media_type === 'image')
  const videos = mediaItems.filter((m) => m.media_type === 'video')
  const voiceItem = mediaItems.find((m) => m.media_type === 'audio' && sections.find((s) => s.id === m.section_id)?.section_type === 'voice') || mediaItems.find((m) => m.media_type === 'audio' && m.storage_path.includes('/voice/'))
  const musicItem = mediaItems.find((m) => m.media_type === 'audio' && sections.find((s) => s.id === m.section_id)?.section_type === 'music') || mediaItems.find((m) => m.media_type === 'audio' && m.storage_path.includes('/music/'))

  const coverSection = sections.find((s) => s.section_type === 'cover')
  const coverContent = (coverSection?.content as CoverSectionContent) || {}
  const headline = coverContent.headline || `A Special Surprise for ${gift.recipient_name}`
  const subheadline = coverContent.subheadline

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-300 font-sans antialiased"
      style={{
        backgroundColor: backgroundColor,
        color: textColor,
      }}
    >
      {/* ── 1. Hero Cover Screen ── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        {/* Ambient Theme Background Glows */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-40 blur-3xl pointer-events-none"
          style={{ backgroundColor: secondaryColor }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{ backgroundColor: primaryColor }}
        />

        <div className="relative z-10 max-w-xl w-full mx-auto space-y-6 animate-fade-in-up">
          {/* Occasion Badge */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md shadow-xs border border-white/60 text-xs font-semibold">
            <span className="text-base">{gift.occasion?.icon || '🎁'}</span>
            <span style={{ color: primaryColor }}>{gift.occasion?.name || 'A Special Surprise'}</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.15] drop-shadow-xs">
            {headline}
          </h1>

          {/* Subheadline */}
          {subheadline && (
            <p className="text-base sm:text-lg text-neutral-600 max-w-md mx-auto leading-relaxed">
              {subheadline}
            </p>
          )}

          {/* Sender & Recipient Tag */}
          <div className="pt-2 flex items-center justify-center gap-2 text-xs font-medium text-neutral-500">
            <span>Crafted for <strong className="text-neutral-800">{gift.recipient_name}</strong></span>
            {gift.sender_name && (
              <>
                <span>•</span>
                <span>From <strong className="text-neutral-800">{gift.sender_name}</strong></span>
              </>
            )}
          </div>

          {/* Open Your Gift CTA Button */}
          <div className="pt-8">
            <button
              type="button"
              onClick={handleOpenGift}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full text-base font-semibold text-white shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
              }}
            >
              <Gift className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Open Your Gift</span>
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. Gift Story Content Flow ── */}
      <div
        ref={contentRef}
        id="gift-story-content"
        className={`max-w-2xl w-full mx-auto px-4 sm:px-6 py-12 space-y-8 transition-opacity duration-700 ${
          hasOpened ? 'opacity-100' : 'opacity-90'
        }`}
      >
        {sections.map((section) => {
          // ── A. Message Section ──
          if (section.section_type === 'message') {
            const msg = (section.content as MessageSectionContent) || {}
            const msgHeading = msg.heading || 'A Message For You'
            const msgBody = msg.body

            return (
              <article
                key={section.id}
                className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-card border border-warm-200/80 space-y-5 animate-fade-in-up"
              >
                <div className="flex items-center gap-3 border-b border-warm-100 pb-4">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <MessageSquareHeart className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-neutral-800">
                      {msgHeading}
                    </h2>
                    <p className="text-[11px] text-neutral-400">Personal Note</p>
                  </div>
                </div>

                <div className="font-serif text-sm sm:text-base text-neutral-700 leading-relaxed sm:leading-loose whitespace-pre-line font-normal">
                  {msgBody}
                </div>
              </article>
            )
          }

          // ── B. Photo Memories Section ──
          if (section.section_type === 'gallery' && photos.length > 0) {
            return (
              <section
                key={section.id}
                className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-card border border-warm-200/80 space-y-5 animate-fade-in-up"
              >
                <div className="flex items-center justify-between border-b border-warm-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-serif text-lg sm:text-xl font-bold text-neutral-800">
                        Photo Memories
                      </h2>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-neutral-400">
                    {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
                  </span>
                </div>

                {/* Photo Grid with Lightbox Triggers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {photos.map((item, index) => (
                    <div
                      key={item.id}
                      onClick={() => setLightboxIndex(index)}
                      className={`group relative rounded-2xl overflow-hidden shadow-xs cursor-pointer bg-warm-100 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                        photos.length % 2 !== 0 && index === 0 ? 'sm:col-span-2 aspect-[16/10]' : 'aspect-square'
                      }`}
                    >
                      <img
                        src={item.signedUrl}
                        alt={item.file_name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-neutral-900/0 group-hover:bg-neutral-900/20 transition-colors flex items-end p-3">
                        <span className="opacity-0 group-hover:opacity-100 text-white text-[11px] font-medium bg-neutral-900/60 backdrop-blur-sm px-2.5 py-1 rounded-full transition-opacity">
                          View full photo
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          }

          // ── C. Video Message Section ──
          if (section.section_type === 'video' && videos.length > 0) {
            return (
              <section
                key={section.id}
                className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-card border border-warm-200/80 space-y-5 animate-fade-in-up"
              >
                <div className="flex items-center gap-2.5 border-b border-warm-100 pb-3">
                  <div
                    className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <VideoIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg sm:text-xl font-bold text-neutral-800">
                      Video Message
                    </h2>
                  </div>
                </div>

                <div className="space-y-4">
                  {videos.map((item) => (
                    <div
                      key={item.id}
                      className="aspect-video w-full rounded-2xl overflow-hidden bg-neutral-950 shadow-md"
                    >
                      {item.signedUrl && (
                        <video
                          src={item.signedUrl}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )
          }

          // ── D. Voice Message Section ──
          if (section.section_type === 'voice' && voiceItem && voiceItem.signedUrl) {
            return (
              <section
                key={section.id}
                className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-card border border-warm-200/80 space-y-4 animate-fade-in-up"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs flex-shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg sm:text-xl font-bold text-neutral-800">
                      A Voice Note For You
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Listen to a personal audio recording
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-warm-50/80 rounded-2xl border border-warm-200">
                  <audio
                    src={voiceItem.signedUrl}
                    controls
                    preload="metadata"
                    className="w-full"
                  />
                </div>
              </section>
            )
          }

          // ── E. Background Soundtrack Section ──
          if (section.section_type === 'music' && musicItem && musicItem.signedUrl) {
            return (
              <section
                key={section.id}
                className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-card border border-warm-200/80 space-y-4 animate-fade-in-up"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs flex-shrink-0"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Music className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-serif text-lg sm:text-xl font-bold text-neutral-800 truncate">
                        Background Soundtrack
                      </h2>
                      <p className="text-xs text-neutral-500 truncate" title={musicItem.file_name}>
                        🎵 {musicItem.file_name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-warm-50/80 rounded-2xl border border-warm-200">
                  <audio
                    src={musicItem.signedUrl}
                    controls
                    preload="metadata"
                    className="w-full"
                  />
                </div>
              </section>
            )
          }

          // ── F. Final Message Section ──
          if (section.section_type === 'final_message') {
            const finalMsg = (section.content as FinalMessageSectionContent) || {}
            const finalHeading = finalMsg.heading || 'With Love'
            const finalBody = finalMsg.body

            return (
              <section
                key={section.id}
                className="bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-card border border-warm-200/80 text-center space-y-4 animate-fade-in-up"
              >
                <div
                  className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-white shadow-md animate-pulse-subtle"
                  style={{ backgroundColor: accentColor }}
                >
                  <Heart className="w-6 h-6 fill-white" />
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-800">
                  {finalHeading}
                </h2>

                {finalBody && (
                  <p className="font-serif text-sm sm:text-base text-neutral-600 max-w-md mx-auto leading-relaxed whitespace-pre-line">
                    &quot;{finalBody}&quot;
                  </p>
                )}

                {gift.sender_name && (
                  <p
                    className="font-serif text-base font-semibold italic pt-2"
                    style={{ color: primaryColor }}
                  >
                    — {gift.sender_name}
                  </p>
                )}
              </section>
            )
          }

          return null
        })}

        {/* ── 3. Footer Signature ── */}
        <footer className="pt-12 pb-16 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-neutral-400">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>Made with love on Giftly</span>
          </div>
        </footer>
      </div>

      {/* ── 4. Photo Lightbox Modal ── */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          isOpen={lightboxIndex !== null}
          onClose={() => setLightboxIndex(null)}
          items={photos}
          initialIndex={lightboxIndex}
        />
      )}
    </div>
  )
}
