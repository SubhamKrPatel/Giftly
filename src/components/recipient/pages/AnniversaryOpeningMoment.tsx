import { useState, useCallback } from 'react'
import { Sparkles, ChevronRight, Heart, Compass } from 'lucide-react'
import type { GiftWithDetails, GiftThemeConfig } from '@/lib/database.types'
import type { RecipientPage } from '@/lib/recipientPages'

interface AnniversaryOpeningMomentProps {
  page: RecipientPage
  gift: GiftWithDetails
  theme: GiftThemeConfig
  onContinue: () => void
  isCompact?: boolean
}

export default function AnniversaryOpeningMoment({
  page,
  gift,
  theme,
  onContinue,
  isCompact = false,
}: AnniversaryOpeningMomentProps) {
  const primaryColor = theme.primaryColor || '#d97706'
  const accentColor = theme.accentColor || '#b45309'

  const recipientName = gift.recipient_name?.trim() || 'Chahat'
  const senderName = gift.sender_name?.trim()

  const headline = page.content.headline || `Happy Anniversary, ${recipientName} ❤️`
  const subheadline = page.content.subheadline || 'Some stories are worth celebrating again and again.'

  // State: 'intro' | 'transitioning' | 'revealed'
  const [state, setState] = useState<'intro' | 'transitioning' | 'revealed'>('intro')

  const handleBeginJourney = useCallback(() => {
    if (state !== 'intro') return
    setState('transitioning')
    setTimeout(() => {
      setState('revealed')
    }, 750)
  }, [state])

  const isRevealed = state === 'revealed'
  const isTransitioning = state === 'transitioning'

  return (
    <article
      className={`flex flex-col items-center justify-center text-center mx-auto w-full animate-fade-in select-none ${
        isCompact ? 'py-2 px-1 max-w-xs space-y-3' : 'py-4 sm:py-8 px-4 max-w-lg space-y-5 sm:space-y-6'
      }`}
    >
      {/* ── Occasion Badge ── */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/85 backdrop-blur-md shadow-xs border border-amber-200/60 text-xs font-semibold">
        <span className="text-sm">🥂</span>
        <span style={{ color: primaryColor }}>Anniversary Celebration</span>
      </div>

      {/* ── Headline & Narrative ── */}
      <div className="space-y-1 sm:space-y-2">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-700/70">
          {isRevealed ? 'Our Beautiful Journey' : 'A Timeless Love'}
        </span>

        <h1
          className={`font-serif font-bold tracking-tight text-neutral-900 leading-tight drop-shadow-xs transition-all duration-500 ${
            isCompact
              ? 'text-lg sm:text-xl'
              : 'text-2xl sm:text-4xl md:text-5xl'
          }`}
        >
          {isRevealed ? 'Another Beautiful Chapter... ✨' : headline}
        </h1>

        <p
          className={`text-neutral-600 max-w-md mx-auto leading-relaxed transition-opacity duration-300 ${
            isCompact ? 'text-[11px]' : 'text-xs sm:text-sm'
          }`}
        >
          {isRevealed
            ? "Here's to everything we've shared, every smile along the way, and everything still ahead."
            : subheadline}
        </p>
      </div>

      {/* ── Visual Journey Motif ── */}
      <div className="relative flex flex-col items-center justify-center py-2 sm:py-4">
        {/* Ambient Champagne Glow */}
        <div
          className={`absolute w-36 h-36 rounded-full blur-2xl opacity-40 transition-all duration-700 pointer-events-none ${
            isRevealed ? 'scale-125 bg-amber-400' : 'bg-amber-300'
          }`}
        />

        {/* Milestone Node Track */}
        <div className="relative flex items-center justify-center gap-3">
          {/* Node 1 */}
          <div className="w-10 h-10 rounded-full bg-white/90 border border-amber-300 shadow-sm flex items-center justify-center text-amber-600">
            <Sparkles className="w-4 h-4" />
          </div>

          {/* Golden Path Line */}
          <div className="w-16 sm:w-24 h-0.5 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 relative overflow-hidden">
            <div
              className={`absolute inset-0 bg-white/80 transition-all duration-700 ${
                isRevealed ? 'translate-x-full' : isTransitioning ? 'animate-pulse' : '-translate-x-full'
              }`}
            />
          </div>

          {/* Center Heart Gem */}
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white shadow-card transition-all duration-500 ${
              isRevealed ? 'scale-110 rotate-6' : isTransitioning ? 'scale-105' : 'hover:scale-105'
            }`}
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
            }}
          >
            {isRevealed ? (
              <Heart className="w-7 h-7 sm:w-8 sm:h-8 fill-white animate-pulse" />
            ) : (
              <Compass className="w-7 h-7 sm:w-8 sm:h-8" />
            )}
          </div>

          {/* Golden Path Line */}
          <div className="w-16 sm:w-24 h-0.5 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300" />

          {/* Node 2 */}
          <div className="w-10 h-10 rounded-full bg-white/90 border border-amber-300 shadow-sm flex items-center justify-center text-amber-600">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ── Sender & Recipient Tag ── */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-medium text-neutral-500">
        <span>
          Celebrating <strong className="text-neutral-800">{recipientName}</strong>
        </span>
        {senderName && (
          <>
            <span>•</span>
            <span>
              With all my love, <strong className="text-neutral-800">{senderName}</strong>
            </span>
          </>
        )}
      </div>

      {/* ── Action Button ── */}
      <div className="pt-2 sm:pt-4 w-full sm:w-auto flex justify-center">
        {!isRevealed ? (
          <button
            type="button"
            onClick={handleBeginJourney}
            disabled={isTransitioning}
            className={`group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:px-8 sm:py-4 rounded-full text-sm sm:text-base font-semibold text-white shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer min-h-[48px] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
              isTransitioning ? 'opacity-80 scale-95' : ''
            }`}
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
            }}
            aria-label="Begin our journey"
          >
            <span>{isTransitioning ? 'Opening Our Journey...' : 'Begin Our Journey'}</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onContinue}
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-base font-semibold text-white shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer min-h-[48px] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none animate-fade-in-up"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
            }}
            aria-label="Continue to our story"
          >
            <span>Continue to Our Story</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </article>
  )
}
