import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Gift as GiftIcon } from 'lucide-react'
import type {
  GiftWithDetails,
  GiftSection,
  GiftMediaItem,
  MusicSectionContent,
} from '@/lib/database.types'
import { resolveRecipientPages, type RecipientPage } from '@/lib/recipientPages'
import { getOccasionVisualTheme } from '@/lib/occasionThemes'
import { DEFAULT_THEME } from '@/config/themes'
import MomentRenderer from './MomentRenderer'
import RecipientNavigation from './RecipientNavigation'
import PhotoLightbox from './PhotoLightbox'
import RecipientBackground from './visuals/RecipientBackground'
import RecipientMusicController, { type RecipientMusicControllerHandle } from './RecipientMusicController'

interface RecipientGiftExperienceProps {
  gift: GiftWithDetails
  sections: GiftSection[]
  mediaItems: GiftMediaItem[]
  initialPageIndex?: number
}

export default function RecipientGiftExperience({
  gift,
  sections,
  mediaItems,
  initialPageIndex = 0,
}: RecipientGiftExperienceProps) {
  // 1. Resolve ordered recipient pages
  const pages: RecipientPage[] = useMemo(() => {
    return resolveRecipientPages({ gift, sections, mediaItems })
  }, [gift, sections, mediaItems])

  // Resolve Occasion Theme
  const occasionTheme = useMemo(() => {
    return getOccasionVisualTheme(gift.occasion?.slug || gift.occasion?.name)
  }, [gift.occasion?.slug, gift.occasion?.name])

  // Extract Theme
  const theme = gift.theme_config || DEFAULT_THEME
  const primaryColor = theme.primaryColor || occasionTheme.ambientGlows.primary || '#f43f5e'
  const backgroundColor = theme.backgroundColor || '#fff1f2'
  const textColor = theme.textColor || '#1f2937'

  // Extract Background Music Item (if music section is visible)
  const musicSection = sections.find((s) => s.section_type === 'music')
  const musicContent = musicSection?.content as MusicSectionContent | undefined
  const defaultVolume = typeof musicContent?.volume === 'number' ? musicContent.volume / 100 : 0.7

  const musicItem = useMemo(() => {
    if (musicSection && musicSection.is_visible === false) return null
    return (
      mediaItems.find(
        (m) =>
          m.media_type === 'audio' &&
          sections.find((s) => s.id === m.section_id)?.section_type === 'music'
      ) ||
      mediaItems.find((m) => m.media_type === 'audio' && m.storage_path.includes('/music/')) ||
      null
    )
  }, [mediaItems, sections, musicSection])

  // Music Controller Handle Ref
  const musicHandleRef = useRef<RecipientMusicControllerHandle | null>(null)

  const onRegisterMusicHandle = useCallback((handle: RecipientMusicControllerHandle) => {
    musicHandleRef.current = handle
  }, [])

  const handleMediaPlay = useCallback(() => {
    musicHandleRef.current?.handleVideoPlay()
  }, [])

  const handleMediaPause = useCallback(() => {
    musicHandleRef.current?.handleVideoPause()
  }, [])

  // Extract Photos for Lightbox
  const photos = useMemo(
    () => mediaItems.filter((m) => m.media_type === 'image'),
    [mediaItems]
  )

  // 2. Determine initial page index (from URL query param ?page=N if present)
  const getInitialPage = (): number => {
    try {
      const params = new URLSearchParams(window.location.search)
      const pageParam = params.get('page')
      if (pageParam) {
        const parsed = parseInt(pageParam, 10) - 1
        if (!isNaN(parsed) && parsed >= 0 && parsed < pages.length) {
          return parsed
        }
      }
    } catch {
      // Ignore URL parsing errors
    }
    return Math.min(Math.max(0, initialPageIndex), Math.max(0, pages.length - 1))
  }

  const [currentPageIndex, setCurrentPageIndex] = useState<number>(getInitialPage)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward')

  // Ref for scroll container
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  // 3. Keep URL query param synced with current page & support browser back/forward
  const updateUrlPage = useCallback((newIndex: number, replace = false) => {
    try {
      const pageNum = newIndex + 1
      const url = new URL(window.location.href)
      url.searchParams.set('page', String(pageNum))

      if (replace) {
        window.history.replaceState({ pageIndex: newIndex }, '', url.toString())
      } else {
        window.history.pushState({ pageIndex: newIndex }, '', url.toString())
      }
    } catch {
      // URL update not critical if restricted
    }
  }, [])

  // Listen to browser popstate (back / forward buttons)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && typeof event.state.pageIndex === 'number') {
        const target = event.state.pageIndex
        if (target >= 0 && target < pages.length) {
          setSlideDirection(target > currentPageIndex ? 'forward' : 'backward')
          setCurrentPageIndex(target)
        }
      } else {
        // Parse from URL
        const params = new URLSearchParams(window.location.search)
        const pageParam = params.get('page')
        if (pageParam) {
          const parsed = parseInt(pageParam, 10) - 1
          if (!isNaN(parsed) && parsed >= 0 && parsed < pages.length) {
            setSlideDirection(parsed > currentPageIndex ? 'forward' : 'backward')
            setCurrentPageIndex(parsed)
          }
        } else {
          setCurrentPageIndex(0)
        }
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [pages.length, currentPageIndex])

  // Navigate to specific page with transition
  const goToPage = useCallback(
    (targetIndex: number) => {
      if (targetIndex === currentPageIndex) return
      const clamped = Math.max(0, Math.min(targetIndex, pages.length - 1))
      setSlideDirection(clamped > currentPageIndex ? 'forward' : 'backward')

      // Check reduced motion preference
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (!prefersReducedMotion) {
        setIsTransitioning(true)
        setTimeout(() => {
          setCurrentPageIndex(clamped)
          setIsTransitioning(false)
          updateUrlPage(clamped)
          scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
        }, 120)
      } else {
        setCurrentPageIndex(clamped)
        updateUrlPage(clamped)
        scrollContainerRef.current?.scrollTo({ top: 0 })
      }
    },
    [currentPageIndex, pages.length, updateUrlPage]
  )

  const handleNext = useCallback(() => {
    if (currentPageIndex < pages.length - 1) {
      goToPage(currentPageIndex + 1)
    }
  }, [currentPageIndex, pages.length, goToPage])

  const handlePrev = useCallback(() => {
    if (currentPageIndex > 0) {
      goToPage(currentPageIndex - 1)
    }
  }, [currentPageIndex, goToPage])

  const handleReplay = useCallback(() => {
    musicHandleRef.current?.handleReplayReset()
    goToPage(0)
  }, [goToPage])

  // 4. Keyboard Navigation (ArrowRight / ArrowLeft / Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not capture keyboard when lightbox is open or user is typing in form controls
      if (lightboxIndex !== null) return

      const activeElement = document.activeElement
      const isInput =
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.tagName === 'SELECT' ||
          activeElement.getAttribute('contenteditable') === 'true')

      if (isInput) return

      if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrev, lightboxIndex])

  // Current active page definition
  const currentPage = pages[currentPageIndex] || pages[0]
  const isFirstPage = currentPageIndex === 0
  const isLastPage = currentPageIndex === pages.length - 1

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between transition-colors duration-300 font-sans antialiased relative overflow-hidden"
      style={{
        backgroundColor: backgroundColor,
        color: textColor,
      }}
    >
      {/* ── Dynamic Occasion Background Layer ── */}
      <RecipientBackground
        occasionTheme={occasionTheme}
        theme={theme}
        pageType={currentPage.type}
        background={currentPage.background}
      />

      {/* ── Top Header Brand Bar ── */}
      <header className="relative z-10 w-full max-w-xl mx-auto px-4 pt-4 sm:pt-6 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-xs"
            style={{ backgroundColor: primaryColor }}
          >
            <GiftIcon className="w-3.5 h-3.5" />
          </div>
          <span className="font-serif text-sm sm:text-base font-bold tracking-tight text-neutral-800">
            Giftly
          </span>
        </div>

        {/* Header Right Actions: Occasion Tag + Floating Music Control */}
        <div className="flex items-center gap-2">
          {/* Music Controller */}
          <RecipientMusicController
            musicItem={musicItem}
            theme={theme}
            defaultVolume={defaultVolume}
            onRegisterHandle={onRegisterMusicHandle}
          />

          {/* Current Occasion Tag */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-warm-200/60 shadow-xs text-[11px] font-semibold text-neutral-700">
            <span>{gift.occasion?.icon || '✨'}</span>
            <span className="hidden xs:inline">{gift.occasion?.name || 'Surprise'}</span>
          </div>
        </div>
      </header>

      {/* ── Center Moment Canvas ── */}
      <main
        ref={scrollContainerRef}
        className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-4 sm:py-8 w-full max-w-2xl mx-auto overflow-y-auto max-h-[calc(100dvh-150px)] sm:max-h-none scrollbar-thin"
        role="region"
        aria-label={`Gift moment ${currentPageIndex + 1} of ${pages.length}: ${currentPage?.title || ''}`}
        aria-live="polite"
      >
        <div
          className={`w-full transition-all duration-200 transform ${
            isTransitioning
              ? slideDirection === 'forward'
                ? 'opacity-0 translate-x-4 scale-[0.98]'
                : 'opacity-0 -translate-x-4 scale-[0.98]'
              : 'opacity-100 translate-x-0 scale-100'
          }`}
        >
          {currentPage && (
            <MomentRenderer
              page={currentPage}
              gift={gift}
              theme={theme}
              onContinue={handleNext}
              onSelectPhoto={(idx) => setLightboxIndex(idx)}
              onReplay={handleReplay}
              onMediaPlay={handleMediaPlay}
              onMediaPause={handleMediaPause}
            />
          )}
        </div>
      </main>

      {/* ── Bottom Navigation Controls ── */}
      <footer className="relative z-20 w-full pb-4 sm:pb-6 pt-2 bg-gradient-to-t from-white/30 to-transparent">
        <RecipientNavigation
          currentPageIndex={currentPageIndex}
          totalPages={pages.length}
          onPrev={handlePrev}
          onNext={handleNext}
          onGoToPage={goToPage}
          theme={theme}
          isLastPage={isLastPage}
          isFirstPage={isFirstPage}
          onReplay={handleReplay}
        />
      </footer>

      {/* ── Photo Lightbox Modal ── */}
      {lightboxIndex !== null && photos.length > 0 && (
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
