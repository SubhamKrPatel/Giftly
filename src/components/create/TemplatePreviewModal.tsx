import { useState, useEffect, useRef, useCallback } from 'react'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Sparkles,
  Gift,
  Check,
  MessageSquareHeart,
  Image as ImageIcon,
  ArrowRight,
} from 'lucide-react'
import type { Template, Occasion } from '@/lib/database.types'
import { cn } from '@/lib/utils'
import { getTemplateDemoContent } from './demoContent'

interface TemplatePreviewModalProps {
  isOpen: boolean
  template: Template | null
  occasion: Occasion | null
  onClose: () => void
  onUseTemplate: (template: Template) => void
}

export default function TemplatePreviewModal({
  isOpen,
  template,
  occasion,
  onClose,
  onUseTemplate,
}: TemplatePreviewModalProps) {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right')
  const previousActiveElementRef = useRef<HTMLElement | null>(null)
  const modalContainerRef = useRef<HTMLDivElement | null>(null)

  // Touch swipe handling
  const touchStartXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)

  // Reset page to 1 whenever a new template is opened
  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement | null
      setCurrentPage(1)
      setSlideDirection('right')
      // Focus modal container
      setTimeout(() => {
        modalContainerRef.current?.focus()
      }, 50)
    } else {
      // Restore focus on close
      previousActiveElementRef.current?.focus?.()
    }
  }, [isOpen, template?.id])

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      setSlideDirection('left')
      setCurrentPage((prev) => prev - 1)
    }
  }, [currentPage])

  const handleNextPage = useCallback(() => {
    if (currentPage < 4) {
      setSlideDirection('right')
      setCurrentPage((prev) => prev + 1)
    }
  }, [currentPage])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrevPage()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNextPage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, handlePrevPage, handleNextPage])

  // Touch swipe listeners
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
    touchStartYRef.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return
    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY

    const deltaX = touchStartXRef.current - touchEndX
    const deltaY = touchStartYRef.current - touchEndY

    // Only treat as horizontal swipe if horizontal distance is significantly greater than vertical
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX > 0) {
        // Swiped left -> Go to next page
        handleNextPage()
      } else {
        // Swiped right -> Go to previous page
        handlePrevPage()
      }
    }

    touchStartXRef.current = null
    touchStartYRef.current = null
  }

  if (!isOpen || !template) return null

  // Extract theme configuration
  const theme = template.theme_config || {}
  const primaryColor = (theme.primaryColor as string) || '#f43f5e'
  const secondaryColor = (theme.secondaryColor as string) || '#fda4af'
  const accentColor = (theme.accentColor as string) || '#e11d48'
  const backgroundColor = (theme.backgroundColor as string) || '#fff1f2'
  const textColor = (theme.textColor as string) || '#1f2937'

  // Fetch static demo data
  const demoData = getTemplateDemoContent(
    template.slug,
    occasion?.name,
    occasion?.icon
  )

  const currentScreenData = demoData.screens[currentPage - 1]

  const handleUseThisTemplate = () => {
    onClose()
    onUseTemplate(template)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
      aria-describedby="preview-modal-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-neutral-950/80 backdrop-blur-md select-none animate-fade-in"
      onClick={onClose}
    >
      {/* Modal Card Container */}
      <div
        ref={modalContainerRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'relative w-full max-w-lg md:max-w-xl h-full max-h-[96vh] sm:max-h-[92vh]',
          'bg-neutral-900 text-white rounded-3xl sm:rounded-[2.25rem] shadow-2xl',
          'border border-neutral-700/80 flex flex-col overflow-hidden outline-none'
        )}
      >
        {/* Modal Top Header Bar */}
        <header className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-3.5 border-b border-neutral-800 flex items-center justify-between gap-3 bg-neutral-900/90 z-20">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl flex-shrink-0">{occasion?.icon || '🎁'}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2
                  id="preview-modal-title"
                  className="font-serif text-sm sm:text-base font-semibold text-neutral-100 truncate"
                >
                  {template.name}
                </h2>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex-shrink-0 hidden xs:inline-block">
                  Live Preview
                </span>
              </div>
              <p id="preview-modal-desc" className="text-[11px] text-neutral-400 truncate">
                Interactive preview with demo recipient (Chahat)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Screen Reader Page Status */}
            <span className="sr-only" aria-live="polite">
              Page {currentPage} of 4: {currentScreenData?.title}
            </span>

            {/* Page Count Badge */}
            <div
              className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300"
              aria-hidden="true"
            >
              {currentPage} / 4
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 active:scale-95 transition-all"
              aria-label="Close preview modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Modal Center: Realistic Phone Mockup Preview Area */}
        <div className="flex-1 relative flex items-center justify-center p-2 sm:p-4 overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950">
          {/* Desktop/Tablet Left Arrow Control */}
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={cn(
              'hidden sm:flex absolute left-3 md:left-4 z-30 p-2.5 rounded-full backdrop-blur-md border transition-all duration-200 shadow-lg',
              currentPage === 1
                ? 'opacity-20 cursor-not-allowed text-neutral-500 border-neutral-800 bg-neutral-900/40'
                : 'opacity-90 hover:opacity-100 text-white bg-neutral-800/80 border-neutral-700 hover:bg-neutral-700 hover:scale-110 active:scale-95'
            )}
            aria-label="Previous preview screen"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Desktop/Tablet Right Arrow Control */}
          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage === 4}
            className={cn(
              'hidden sm:flex absolute right-3 md:right-4 z-30 p-2.5 rounded-full backdrop-blur-md border transition-all duration-200 shadow-lg',
              currentPage === 4
                ? 'opacity-20 cursor-not-allowed text-neutral-500 border-neutral-800 bg-neutral-900/40'
                : 'opacity-90 hover:opacity-100 text-white bg-neutral-800/80 border-neutral-700 hover:bg-neutral-700 hover:scale-110 active:scale-95'
            )}
            aria-label="Next preview screen"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Phone Frame Device Wrapper */}
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className={cn(
              'relative w-full max-w-[340px] sm:max-w-[360px] h-full max-h-[560px] sm:max-h-[580px]',
              'rounded-[2rem] sm:rounded-[2.5rem] border-4 sm:border-[6px] border-neutral-800 bg-neutral-900 shadow-2xl',
              'flex flex-col overflow-hidden transition-all'
            )}
            style={{
              boxShadow: `0 20px 40px -15px ${primaryColor}25, 0 0 0 1px rgba(255,255,255,0.06)`,
            }}
          >
            {/* Phone Top Notch / Dynamic Island */}
            <div className="absolute top-2 inset-x-0 z-30 flex justify-center pointer-events-none">
              <div className="w-24 h-4 bg-neutral-950 rounded-full flex items-center justify-end px-3">
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
              </div>
            </div>

            {/* Interactive Phone Screen Content */}
            <div
              className="flex-1 w-full h-full flex flex-col justify-between overflow-y-auto overflow-x-hidden pt-8 pb-4 px-4 sm:px-5 select-none relative transition-colors duration-300"
              style={{
                backgroundColor: backgroundColor,
                color: textColor,
              }}
            >
              {/* Subtle ambient light gradient glow */}
              <div
                className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-35 blur-2xl pointer-events-none"
                style={{ backgroundColor: secondaryColor }}
              />
              <div
                className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-30 blur-2xl pointer-events-none"
                style={{ backgroundColor: primaryColor }}
              />

              {/* Dynamic Screen View with Smooth Animation */}
              <div
                key={currentPage}
                className={cn(
                  'relative z-10 flex-1 flex flex-col justify-between py-2 transition-all duration-300 transform',
                  slideDirection === 'right' ? 'animate-fade-in-up' : 'animate-fade-in-up'
                )}
              >
                {/* ── Screen 1: Hero Cover Screen ── */}
                {currentPage === 1 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-4">
                    {/* Occasion pill */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 shadow-xs border border-white/80 text-[11px] font-semibold text-neutral-800">
                      <span>{demoData.occasionIcon}</span>
                      <span style={{ color: primaryColor }}>{currentScreenData.badge}</span>
                    </div>

                    {/* Main Headline */}
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 leading-snug drop-shadow-xs px-1">
                      {currentScreenData.title}
                    </h3>

                    {/* Subtitle */}
                    {currentScreenData.subtitle && (
                      <p className="text-xs sm:text-sm text-neutral-600 max-w-[260px] leading-relaxed">
                        {currentScreenData.subtitle}
                      </p>
                    )}

                    {/* Sender & Recipient Tag */}
                    <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-medium text-neutral-500">
                      <span>For <strong className="text-neutral-900">{demoData.recipientName}</strong></span>
                      <span>•</span>
                      <span>{currentScreenData.signature}</span>
                    </div>

                    {/* Interactive "Open Gift" Demo Button */}
                    <div className="pt-4 w-full">
                      <button
                        type="button"
                        onClick={handleNextPage}
                        className="group w-full py-3 px-5 rounded-full text-xs sm:text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                        }}
                      >
                        <Gift className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        <span>Open Your Surprise</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Screen 2: Emotional Message Screen ── */}
                {currentPage === 2 && (
                  <div className="flex-1 flex flex-col justify-center space-y-3 py-2">
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-card border border-white/60 space-y-3">
                      <div className="flex items-center gap-2.5 border-b border-neutral-100 pb-2.5">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs flex-shrink-0"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <MessageSquareHeart className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-serif text-base font-bold text-neutral-900 truncate">
                            {currentScreenData.title}
                          </h4>
                          <span className="text-[10px] text-neutral-400 font-medium">
                            {currentScreenData.badge}
                          </span>
                        </div>
                      </div>

                      <p className="font-serif text-xs sm:text-sm text-neutral-700 leading-relaxed sm:leading-loose whitespace-pre-line">
                        &quot;{currentScreenData.body}&quot;
                      </p>

                      <div className="pt-1 flex items-center justify-end text-[11px] font-semibold italic text-neutral-500">
                        — {demoData.senderName} ❤️
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Screen 3: Photo Memories / Highlights Screen ── */}
                {currentPage === 3 && (
                  <div className="flex-1 flex flex-col justify-center space-y-3 py-2">
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-card border border-white/60 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-xs"
                            style={{ backgroundColor: primaryColor }}
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h4 className="font-serif text-sm font-bold text-neutral-900">
                              {currentScreenData.title}
                            </h4>
                            <span className="text-[10px] text-neutral-400">
                              {currentScreenData.subtitle}
                            </span>
                          </div>
                        </div>
                        <Sparkles className="w-4 h-4 text-amber-500" />
                      </div>

                      {/* Memory Cards */}
                      <div className="space-y-2 pt-1">
                        {currentScreenData.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-warm-50/90 border border-warm-200/70 flex items-start gap-2.5 transition-transform hover:scale-[1.01]"
                          >
                            <span className="text-base flex-shrink-0 pt-0.5">{item.iconEmoji}</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-neutral-800 truncate">
                                {item.title}
                              </p>
                              {item.description && (
                                <p className="text-[11px] text-neutral-500 line-clamp-1 leading-tight">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Screen 4: Final Wish & Signature Screen ── */}
                {currentPage === 4 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 py-4">
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-card border border-white/60 w-full space-y-3">
                      <div
                        className="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-white shadow-md animate-pulse-soft"
                        style={{ backgroundColor: accentColor }}
                      >
                        <Heart className="w-5 h-5 fill-white" />
                      </div>

                      <h4 className="font-serif text-lg font-bold text-neutral-900">
                        {currentScreenData.title}
                      </h4>

                      {currentScreenData.body && (
                        <p className="font-serif text-xs sm:text-sm text-neutral-600 leading-relaxed">
                          &quot;{currentScreenData.body}&quot;
                        </p>
                      )}

                      {currentScreenData.signature && (
                        <p
                          className="font-serif text-xs sm:text-sm font-semibold italic pt-1"
                          style={{ color: primaryColor }}
                        >
                          {currentScreenData.signature}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* In-Phone Bottom Page Indicator Dots */}
              <div className="relative z-10 pt-2 flex items-center justify-center gap-1.5">
                {[1, 2, 3, 4].map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => {
                      setSlideDirection(page > currentPage ? 'right' : 'left')
                      setCurrentPage(page)
                    }}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      currentPage === page
                        ? 'w-6 shadow-xs'
                        : 'w-1.5 bg-neutral-400/50 hover:bg-neutral-500'
                    )}
                    style={{
                      backgroundColor: currentPage === page ? primaryColor : undefined,
                    }}
                    aria-label={`Go to preview page ${page}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <footer className="flex-shrink-0 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-neutral-800 bg-neutral-900 flex flex-col xs:flex-row items-center justify-between gap-3 z-20">
          {/* Mobile pagination controls */}
          <div className="flex items-center gap-1.5 w-full xs:w-auto justify-between xs:justify-start">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={cn(
                'min-h-[44px] px-3 rounded-xl text-xs font-semibold flex items-center gap-1 border transition-colors',
                currentPage === 1
                  ? 'text-neutral-600 border-neutral-800 cursor-not-allowed'
                  : 'text-neutral-300 border-neutral-700 bg-neutral-800/80 hover:bg-neutral-800 hover:text-white'
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <span className="text-xs font-mono text-neutral-400 px-2 xs:hidden">
              {currentPage} / 4
            </span>

            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage === 4}
              className={cn(
                'min-h-[44px] px-3 rounded-xl text-xs font-semibold flex items-center gap-1 border transition-colors',
                currentPage === 4
                  ? 'text-neutral-600 border-neutral-800 cursor-not-allowed'
                  : 'text-neutral-300 border-neutral-700 bg-neutral-800/80 hover:bg-neutral-800 hover:text-white'
              )}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Primary CTA: Use This Template */}
          <div className="flex items-center gap-2 w-full xs:w-auto">
            <button
              type="button"
              onClick={handleUseThisTemplate}
              className="w-full xs:w-auto min-h-[44px] py-2.5 px-5 sm:px-6 rounded-xl text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Use This Template ❤️</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
