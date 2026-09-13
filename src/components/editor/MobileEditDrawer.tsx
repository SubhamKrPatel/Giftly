import React, { useEffect } from 'react'
import {
  ArrowLeft,
  Check,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Eye,
} from 'lucide-react'

interface MobileEditDrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  sectionType: string
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'error'
  onSave?: () => void
  onPrevSection?: () => void
  onNextSection?: () => void
  prevTitle?: string
  nextTitle?: string
  children: React.ReactNode
}

export default function MobileEditDrawer({
  isOpen,
  onClose,
  title,
  saveStatus,
  onPrevSection,
  onNextSection,
  prevTitle,
  nextTitle,
  children,
}: MobileEditDrawerProps) {
  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-drawer-title"
      className="fixed inset-0 z-50 flex flex-col bg-cream-50 animate-fade-in"
    >
      {/* ── 1. Sticky Mobile Edit Header ── */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-warm-200/90 px-4 py-3 flex items-center justify-between gap-3 shadow-xs">
        {/* Left: Back / Done link */}
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 bg-warm-100 hover:bg-warm-200 transition-colors min-h-[44px] min-w-[44px] touch-manipulation cursor-pointer"
          aria-label="Back to preview"
        >
          <ArrowLeft className="w-4 h-4 text-neutral-600" />
          <span>Preview</span>
        </button>

        {/* Center: Title */}
        <div className="flex-1 min-w-0 text-center px-1">
          <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-neutral-400">
            <Sparkles className="w-3 h-3 text-rose-500" />
            <span>Editing Page</span>
          </div>
          <h2
            id="mobile-drawer-title"
            className="font-serif text-sm sm:text-base font-bold text-neutral-900 truncate"
          >
            {title}
          </h2>
        </div>

        {/* Right: Live Save Status & Done Action */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Live Status Tag */}
          <div
            className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500"
            aria-live="polite"
          >
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="w-3 h-3 text-rose-500 animate-spin" />
                <span className="hidden xs:inline">Saving</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <Check className="w-3 h-3 text-emerald-500 stroke-[3]" />
                <span className="hidden xs:inline">Saved</span>
              </>
            )}
            {saveStatus === 'unsaved' && (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="hidden xs:inline text-amber-700">Unsaved</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <AlertCircle className="w-3 h-3 text-rose-500" />
                <span className="hidden xs:inline text-rose-600">Error</span>
              </>
            )}
          </div>

          {/* Done CTA */}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-xs active:scale-95 transition-all min-h-[44px] touch-manipulation cursor-pointer"
          >
            Done
          </button>
        </div>
      </header>

      {/* ── 2. Scrollable Single-Column Content Form ── */}
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 max-w-xl w-full mx-auto space-y-6">
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-warm-200 shadow-card">
          {children}
        </div>

        {/* ── 3. Bottom In-flow Pagination & Done CTA ── */}
        <div className="space-y-4 pt-2 pb-8">
          {/* Section Navigation Buttons */}
          <div className="flex items-center justify-between gap-3">
            {onPrevSection ? (
              <button
                type="button"
                onClick={onPrevSection}
                className="flex-1 inline-flex items-center justify-center gap-1 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-neutral-700 bg-white border border-warm-200 hover:bg-warm-50 shadow-xs min-h-[44px] transition-all cursor-pointer truncate"
              >
                <ChevronLeft className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                <span className="truncate">{prevTitle ? `Prev: ${prevTitle}` : 'Previous'}</span>
              </button>
            ) : (
              <div className="flex-1" />
            )}

            {onNextSection ? (
              <button
                type="button"
                onClick={onNextSection}
                className="flex-1 inline-flex items-center justify-center gap-1 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-neutral-700 bg-white border border-warm-200 hover:bg-warm-50 shadow-xs min-h-[44px] transition-all cursor-pointer truncate"
              >
                <span className="truncate">{nextTitle ? `Next: ${nextTitle}` : 'Next'}</span>
                <ChevronRight className="w-4 h-4 text-neutral-500 flex-shrink-0" />
              </button>
            ) : (
              <div className="flex-1" />
            )}
          </div>

          {/* Primary Done Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 hover:from-rose-600 hover:to-pink-600 shadow-md hover:shadow-glow active:scale-[0.98] transition-all min-h-[48px] touch-manipulation cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Done Editing · View Live Preview</span>
          </button>
        </div>
      </main>
    </div>
  )
}
