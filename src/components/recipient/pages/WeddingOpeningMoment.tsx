import { useState, useCallback } from 'react'
import { ChevronRight, Mail, Heart, Sparkles } from 'lucide-react'
import type { GiftWithDetails, GiftThemeConfig } from '@/lib/database.types'
import type { RecipientPage } from '@/lib/recipientPages'

interface WeddingOpeningMomentProps {
  page: RecipientPage
  gift: GiftWithDetails
  theme: GiftThemeConfig
  onContinue: () => void
  isCompact?: boolean
}

export default function WeddingOpeningMoment({
  page,
  gift,
  theme,
  onContinue,
  isCompact = false,
}: WeddingOpeningMomentProps) {
  const primaryColor = theme.primaryColor || '#b45309'
  const accentColor = theme.accentColor || '#92400e'

  const recipientName = gift.recipient_name?.trim() || 'Chahat'
  const senderName = gift.sender_name?.trim()

  const coupleTitle =
    page.content.headline ||
    (senderName ? `${recipientName} & ${senderName}` : `${recipientName}'s Wedding`)

  const subheadline = page.content.subheadline || 'invite you to celebrate their special day with love and joy.'

  // State: 'intro' | 'opening' | 'opened'
  const [state, setState] = useState<'intro' | 'opening' | 'opened'>('intro')

  const handleOpenInvitation = useCallback(() => {
    if (state !== 'intro') return
    setState('opening')
    setTimeout(() => {
      setState('opened')
    }, 800)
  }, [state])

  const isOpened = state === 'opened'
  const isOpening = state === 'opening'

  return (
    <article
      className={`flex flex-col items-center justify-center text-center mx-auto w-full animate-fade-in select-none ${
        isCompact ? 'py-2 px-1 max-w-xs space-y-3' : 'py-4 sm:py-8 px-4 max-w-lg space-y-5 sm:space-y-6'
      }`}
    >
      {/* ── Occasion Badge ── */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 backdrop-blur-md shadow-xs border border-amber-200/80 text-xs font-serif font-semibold tracking-wide">
        <span className="text-sm">💍</span>
        <span style={{ color: primaryColor }}>Wedding Celebration</span>
      </div>

      {/* ── Invitation Card Container ── */}
      <div
        className={`w-full bg-white/95 backdrop-blur-md rounded-3xl border border-amber-200/80 shadow-card transition-all duration-500 overflow-hidden ${
          isCompact ? 'p-4 space-y-3' : 'p-6 sm:p-8 space-y-4 sm:space-y-5'
        } ${isOpened ? 'ring-2 ring-amber-300' : ''}`}
      >
        <span className="text-[10px] sm:text-xs font-serif font-semibold uppercase tracking-widest text-amber-800/70 block">
          {isOpened ? 'Honored Invitation' : 'Together With Their Families'}
        </span>

        {/* Couple Headline */}
        <h1
          className={`font-serif font-bold tracking-tight text-neutral-900 leading-tight drop-shadow-xs transition-all duration-500 ${
            isCompact
              ? 'text-lg sm:text-xl'
              : 'text-2xl sm:text-3xl md:text-4xl'
          }`}
        >
          {isOpened ? 'We\'re Getting Married! 🥂' : coupleTitle}
        </h1>

        <p
          className={`text-neutral-600 max-w-md mx-auto font-serif italic leading-relaxed transition-opacity duration-300 ${
            isCompact ? 'text-[11px]' : 'text-xs sm:text-sm'
          }`}
        >
          {isOpened
            ? 'Your love, blessings, and presence mean the world to us as we begin this new journey together.'
            : subheadline}
        </p>

        {/* ── Botanical Invitation Envelope Visual ── */}
        <div className="relative flex flex-col items-center justify-center py-2">
          {/* Ambient Gold Glow */}
          <div
            className={`absolute w-28 h-28 rounded-full blur-2xl opacity-40 transition-all duration-700 pointer-events-none ${
              isOpened ? 'scale-125 bg-amber-300' : 'bg-amber-200'
            }`}
          />

          {/* Envelope / Wax Seal Icon */}
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-white shadow-md transition-all duration-500 ${
              isOpened ? 'scale-110 rotate-3' : isOpening ? 'scale-105' : 'hover:scale-105'
            }`}
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
            }}
          >
            {isOpened ? (
              <Heart className="w-8 h-8 sm:w-10 sm:h-10 fill-white animate-pulse" />
            ) : (
              <Mail className="w-8 h-8 sm:w-10 sm:h-10" />
            )}
          </div>
        </div>

        {/* ── Invitation Action Button ── */}
        <div className="pt-2 w-full flex justify-center">
          {!isOpened ? (
            <button
              type="button"
              onClick={handleOpenInvitation}
              disabled={isOpening}
              className={`group inline-flex items-center justify-center gap-2.5 px-7 py-3 sm:px-8 sm:py-3.5 rounded-full text-sm sm:text-base font-serif font-semibold text-white shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer min-h-[48px] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                isOpening ? 'opacity-80 scale-95' : ''
              }`}
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
              }}
              aria-label="Open wedding invitation"
            >
              <span>{isOpening ? 'Opening Invitation...' : 'Open Invitation ✉️'}</span>
              <Sparkles className="w-4 h-4 text-amber-200 group-hover:scale-125 transition-transform" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onContinue}
              className="group inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full text-base font-serif font-semibold text-white shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer min-h-[48px] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none animate-fade-in-up"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
              }}
              aria-label="View wedding invitation"
            >
              <span>View Invitation</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
