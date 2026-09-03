import { useState, useCallback } from 'react'
import { Sparkles, ChevronRight, Gift, Flame } from 'lucide-react'
import type { GiftWithDetails, GiftThemeConfig } from '@/lib/database.types'
import type { RecipientPage } from '@/lib/recipientPages'

interface FestivalOpeningMomentProps {
  page: RecipientPage
  gift: GiftWithDetails
  theme: GiftThemeConfig
  onContinue: () => void
  isCompact?: boolean
}

export default function FestivalOpeningMoment({
  page,
  gift,
  theme,
  onContinue,
  isCompact = false,
}: FestivalOpeningMomentProps) {
  const primaryColor = theme.primaryColor || '#d97706'
  const accentColor = theme.accentColor || '#b45309'

  const recipientName = gift.recipient_name?.trim() || 'Chahat'
  const senderName = gift.sender_name?.trim()

  const headline = page.content.headline || `Happy Festivities, ${recipientName}! ✨`
  const subheadline = page.content.subheadline || 'A little celebration, made just for you.'

  // State: 'intro' | 'opening' | 'revealed'
  const [state, setState] = useState<'intro' | 'opening' | 'revealed'>('intro')

  const handleOpenSurprise = useCallback(() => {
    if (state !== 'intro') return
    setState('opening')
    setTimeout(() => {
      setState('revealed')
    }, 750)
  }, [state])

  const isRevealed = state === 'revealed'
  const isOpening = state === 'opening'

  return (
    <article
      className={`flex flex-col items-center justify-center text-center mx-auto w-full animate-fade-in select-none ${
        isCompact ? 'py-2 px-1 max-w-xs space-y-3' : 'py-4 sm:py-8 px-4 max-w-lg space-y-5 sm:space-y-6'
      }`}
    >
      {/* ── Occasion Badge ── */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/85 backdrop-blur-md shadow-xs border border-amber-200/60 text-xs font-semibold">
        <span className="text-sm">🪔</span>
        <span style={{ color: primaryColor }}>Festive Celebration</span>
      </div>

      {/* ── Headline & Narrative ── */}
      <div className="space-y-1 sm:space-y-2">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-700/70">
          {isRevealed ? 'Brightest Wishes' : 'A Little Celebration'}
        </span>

        <h1
          className={`font-serif font-bold tracking-tight text-neutral-900 leading-tight drop-shadow-xs transition-all duration-500 ${
            isCompact
              ? 'text-lg sm:text-xl'
              : 'text-2xl sm:text-4xl md:text-5xl'
          }`}
        >
          {isRevealed ? 'Wishing You Joy & Brightness! 🌟' : headline}
        </h1>

        <p
          className={`text-neutral-600 max-w-md mx-auto leading-relaxed transition-opacity duration-300 ${
            isCompact ? 'text-[11px]' : 'text-xs sm:text-sm'
          }`}
        >
          {isRevealed
            ? 'May this season bring boundless light, warmth, happiness, and prosperity to your home.'
            : subheadline}
        </p>
      </div>

      {/* ── Radiant Festive Visual ── */}
      <div className="relative flex flex-col items-center justify-center py-2 sm:py-4">
        {/* Ambient Golden Glow */}
        <div
          className={`absolute w-36 h-36 rounded-full blur-2xl opacity-40 transition-all duration-700 pointer-events-none ${
            isRevealed ? 'scale-125 bg-amber-400' : 'bg-amber-300'
          }`}
        />

        {/* Festive Gift / Lantern Centerpiece */}
        <div className="relative flex items-center justify-center">
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center text-white shadow-card transition-all duration-500 ${
              isRevealed
                ? 'scale-110 rotate-6'
                : isOpening
                ? 'scale-105'
                : 'hover:scale-105 animate-pulse-subtle'
            }`}
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
            }}
          >
            {isRevealed ? (
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 animate-bounce" />
            ) : (
              <Gift className="w-10 h-10 sm:w-12 sm:h-12" />
            )}
          </div>

          {/* Floating Lantern Flame Sparkles */}
          <Flame className="w-5 h-5 fill-amber-300 text-amber-500 absolute -top-2 -right-3 animate-pulse" />
          <Sparkles className="w-5 h-5 text-amber-300 absolute -bottom-2 -left-3 animate-spin-slow" />
        </div>
      </div>

      {/* ── Sender & Recipient Tag ── */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-medium text-neutral-500">
        <span>
          For <strong className="text-neutral-800">{recipientName}</strong>
        </span>
        {senderName && (
          <>
            <span>•</span>
            <span>
              Sent with love by <strong className="text-neutral-800">{senderName}</strong>
            </span>
          </>
        )}
      </div>

      {/* ── Action Button ── */}
      <div className="pt-2 sm:pt-4 w-full sm:w-auto flex justify-center">
        {!isRevealed ? (
          <button
            type="button"
            onClick={handleOpenSurprise}
            disabled={isOpening}
            className={`group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:px-8 sm:py-4 rounded-full text-sm sm:text-base font-semibold text-white shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer min-h-[48px] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
              isOpening ? 'opacity-80 scale-95' : ''
            }`}
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
            }}
            aria-label="Open your festive surprise"
          >
            <Gift className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>{isOpening ? 'Opening Surprise...' : 'Open Your Surprise 🎁'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onContinue}
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-base font-semibold text-white shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer min-h-[48px] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none animate-fade-in-up"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
            }}
            aria-label="Open festive gift"
          >
            <span>Open Festive Gift</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </article>
  )
}
