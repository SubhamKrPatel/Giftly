import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import type { GiftThemeConfig } from '@/lib/database.types'

interface RecipientNavigationProps {
  currentPageIndex: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  onGoToPage: (pageIndex: number) => void
  theme: GiftThemeConfig
  isLastPage: boolean
  isFirstPage: boolean
  onReplay?: () => void
}

export default function RecipientNavigation({
  currentPageIndex,
  totalPages,
  onPrev,
  onNext,
  onGoToPage,
  theme,
  isLastPage,
  isFirstPage,
  onReplay,
}: RecipientNavigationProps) {
  const primaryColor = theme.primaryColor || '#f43f5e'
  const accentColor = theme.accentColor || '#e11d48'

  const currentPageNumber = currentPageIndex + 1

  return (
    <nav
      aria-label="Gift moments navigation"
      className="w-full max-w-xl mx-auto px-4 py-3 sm:py-4 flex flex-col gap-3.5 select-none"
    >
      {/* Primary Action Buttons Bar */}
      <div className="flex items-center justify-between gap-3">
        {/* Previous / Back Button */}
        <button
          type="button"
          onClick={onPrev}
          disabled={isFirstPage}
          className={`min-h-[46px] px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none ${
            isFirstPage
              ? 'opacity-0 pointer-events-none'
              : 'bg-white/90 hover:bg-white text-neutral-700 hover:text-neutral-900 shadow-sm border border-warm-200/80 active:scale-95'
          }`}
          aria-label={`Go to previous moment, page ${currentPageNumber - 1}`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Page Step Counter ("2 / 5") */}
        <div
          className="text-xs sm:text-sm font-mono font-medium text-neutral-500 bg-white/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-warm-200/60 shadow-xs"
          aria-live="polite"
          aria-atomic="true"
        >
          <span>{currentPageNumber}</span>
          <span className="mx-1 text-neutral-300">/</span>
          <span>{totalPages}</span>
        </div>

        {/* Next / Continue Button */}
        {isLastPage ? (
          <button
            type="button"
            onClick={onReplay || (() => onGoToPage(0))}
            className="min-h-[46px] px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white shadow-md hover:shadow-glow transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
            }}
            aria-label="Replay gift from start"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Replay</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="min-h-[46px] px-6 sm:px-7 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white shadow-md hover:shadow-glow transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
            }}
            aria-label={`Continue to next moment, page ${currentPageNumber + 1}`}
          >
            <span>Continue</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Interactive Step Indicator Dots ("● ● ○ ○ ○") */}
      <div
        className="flex items-center justify-center gap-2 pt-1"
        role="tablist"
        aria-label="Moment progress indicators"
      >
        {Array.from({ length: totalPages }).map((_, idx) => {
          const isActive = idx === currentPageIndex
          const isPassed = idx < currentPageIndex

          return (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? 'step' : undefined}
              aria-label={`Go to moment ${idx + 1} of ${totalPages}`}
              onClick={() => onGoToPage(idx)}
              className="group p-1 cursor-pointer focus-visible:outline-none"
            >
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'w-7 shadow-xs'
                    : isPassed
                    ? 'w-2 bg-neutral-400/80 group-hover:bg-neutral-600'
                    : 'w-2 bg-neutral-300 group-hover:bg-neutral-400'
                }`}
                style={{
                  backgroundColor: isActive ? primaryColor : undefined,
                }}
              />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
