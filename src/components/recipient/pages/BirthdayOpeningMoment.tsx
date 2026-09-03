import { useState, useCallback } from 'react'
import { Sparkles, ChevronRight, Cake, PartyPopper } from 'lucide-react'
import type { GiftWithDetails, GiftThemeConfig } from '@/lib/database.types'
import type { RecipientPage } from '@/lib/recipientPages'

interface BirthdayOpeningMomentProps {
  page: RecipientPage
  gift: GiftWithDetails
  theme: GiftThemeConfig
  onContinue: () => void
  isCompact?: boolean
}

export default function BirthdayOpeningMoment({
  page,
  gift,
  theme,
  onContinue,
  isCompact = false,
}: BirthdayOpeningMomentProps) {
  const primaryColor = theme.primaryColor || '#f43f5e'
  const accentColor = theme.accentColor || '#e11d48'

  const recipientName = gift.recipient_name?.trim() || 'Chahat'
  const senderName = gift.sender_name?.trim()
  const headline = page.content.headline || `Happy Birthday, ${recipientName}!`
  const subheadline = page.content.subheadline || 'A special moment crafted just for you.'

  // State: 'idle' (ready to cut) | 'cutting' (animating) | 'cut' (celebrating)
  const [cutState, setCutState] = useState<'idle' | 'cutting' | 'cut'>('idle')

  const handleCutCake = useCallback(() => {
    if (cutState !== 'idle') return

    // Start cutting animation
    setCutState('cutting')

    // After animation duration, reveal birthday celebration
    setTimeout(() => {
      setCutState('cut')
    }, 850)
  }, [cutState])

  const isCut = cutState === 'cut'
  const isCutting = cutState === 'cutting'

  return (
    <article
      className={`flex flex-col items-center justify-center text-center mx-auto w-full animate-fade-in select-none ${
        isCompact ? 'py-2 px-1 max-w-xs space-y-3' : 'py-4 sm:py-8 px-4 max-w-lg space-y-5 sm:space-y-6'
      }`}
    >
      {/* ── Occasion Badge ── */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/85 backdrop-blur-md shadow-xs border border-rose-200/60 text-xs font-semibold">
        <span className="text-sm">🎂</span>
        <span style={{ color: primaryColor }}>Birthday Celebration</span>
      </div>

      {/* ── Personalized Intro Headline ── */}
      <div className="space-y-1 sm:space-y-2">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400">
          {isCut ? 'Celebration Time' : 'Make a Wish &'}
        </span>
        <h1
          className={`font-serif font-bold tracking-tight text-neutral-900 leading-tight drop-shadow-xs transition-all duration-500 ${
            isCompact
              ? 'text-lg sm:text-xl'
              : 'text-2xl sm:text-4xl md:text-5xl'
          }`}
        >
          {isCut ? `🎉 Happy Birthday, ${recipientName}! 🎉` : headline}
        </h1>

        <p
          className={`text-neutral-600 max-w-md mx-auto leading-relaxed transition-opacity duration-300 ${
            isCompact ? 'text-[11px]' : 'text-xs sm:text-sm'
          }`}
        >
          {isCut
            ? subheadline || 'May your day be filled with endless love, laughter, and unforgettable moments!'
            : 'Someone special made something magical for your big day.'}
        </p>
      </div>

      {/* ── Interactive Birthday Cake Illustration ── */}
      <div className="relative flex flex-col items-center justify-center py-2 sm:py-4">
        {/* Ambient Glow behind cake */}
        <div
          className={`absolute w-36 h-36 rounded-full blur-2xl opacity-40 transition-all duration-700 pointer-events-none ${
            isCut ? 'scale-125 bg-amber-400' : 'bg-rose-400'
          }`}
        />

        {/* Cake Container */}
        <div
          className={`relative transition-transform duration-500 ${
            isCutting ? 'scale-105' : isCut ? 'scale-100' : 'hover:scale-105'
          }`}
        >
          {/* Candle Flames (Flickering before cut, transformed into sparkles when cut) */}
          <div className="flex justify-center gap-4 sm:gap-6 mb-1 relative z-10">
            {[0, 1, 2].map((candleIdx) => (
              <div key={candleIdx} className="flex flex-col items-center">
                {/* Flame */}
                <div
                  className={`w-3 h-4 rounded-full transition-all duration-500 ${
                    isCut
                      ? 'scale-0 opacity-0'
                      : isCutting
                      ? 'animate-ping opacity-80'
                      : 'animate-pulse'
                  }`}
                  style={{
                    background: 'radial-gradient(ellipse at bottom, #fbbf24 0%, #f59e0b 60%, #ef4444 100%)',
                    boxShadow: '0 0 10px #f59e0b',
                    animationDelay: `${candleIdx * 150}ms`,
                  }}
                />
                {/* Candle Stick */}
                <div
                  className="w-1.5 h-6 rounded-t-sm shadow-xs"
                  style={{
                    background:
                      candleIdx === 1
                        ? 'repeating-linear-gradient(45deg, #f43f5e, #f43f5e 3px, #ffffff 3px, #ffffff 6px)'
                        : 'repeating-linear-gradient(45deg, #3b82f6, #3b82f6 3px, #ffffff 3px, #ffffff 6px)',
                  }}
                />
              </div>
            ))}
          </div>

          {/* SVG Birthday Cake (With Splitting Animation when Cut) */}
          <div className="relative flex items-center justify-center">
            {/* Left Cake Half */}
            <div
              className={`transition-all duration-700 ease-out origin-bottom-left ${
                isCut
                  ? '-translate-x-3 -rotate-3'
                  : isCutting
                  ? '-translate-x-1'
                  : ''
              }`}
            >
              <svg
                width={isCompact ? '100' : '140'}
                height={isCompact ? '85' : '110'}
                viewBox="0 0 100 80"
                className="drop-shadow-md"
              >
                {/* Top Tier Left */}
                <path
                  d="M15,30 Q50,30 50,30 L50,50 Q50,50 15,50 Z"
                  fill="#fecdd3"
                />
                <path
                  d="M15,30 Q30,35 50,30"
                  stroke="#fda4af"
                  strokeWidth="3"
                  fill="none"
                />
                {/* Frosting Drips Top */}
                <circle cx="25" cy="34" r="3" fill="#ffffff" />
                <circle cx="40" cy="35" r="3.5" fill="#ffffff" />

                {/* Bottom Tier Left */}
                <path
                  d="M5,50 Q50,50 50,50 L50,80 Q50,80 5,80 Z"
                  fill="#fda4af"
                />
                {/* Frosting Drips Bottom */}
                <circle cx="15" cy="56" r="4" fill="#ffffff" />
                <circle cx="35" cy="57" r="4.5" fill="#ffffff" />

                {/* Plate Left */}
                <path d="M0,80 Q50,80 50,80" stroke="#e2e8f0" strokeWidth="4" />
              </svg>
            </div>

            {/* Right Cake Half */}
            <div
              className={`transition-all duration-700 ease-out origin-bottom-right ${
                isCut
                  ? 'translate-x-3 rotate-3'
                  : isCutting
                  ? 'translate-x-1'
                  : ''
              }`}
            >
              <svg
                width={isCompact ? '100' : '140'}
                height={isCompact ? '85' : '110'}
                viewBox="0 0 100 80"
                className="drop-shadow-md"
              >
                {/* Top Tier Right */}
                <path
                  d="M50,30 Q50,30 85,30 L85,50 Q50,50 50,50 Z"
                  fill="#fecdd3"
                />
                <path
                  d="M50,30 Q70,35 85,30"
                  stroke="#fda4af"
                  strokeWidth="3"
                  fill="none"
                />
                {/* Frosting Drips Top */}
                <circle cx="60" cy="34" r="3.5" fill="#ffffff" />
                <circle cx="75" cy="35" r="3" fill="#ffffff" />

                {/* Bottom Tier Right */}
                <path
                  d="M50,50 Q50,50 95,50 L95,80 Q50,80 50,80 Z"
                  fill="#fda4af"
                />
                {/* Frosting Drips Bottom */}
                <circle cx="65" cy="57" r="4.5" fill="#ffffff" />
                <circle cx="85" cy="56" r="4" fill="#ffffff" />

                {/* Plate Right */}
                <path d="M50,80 Q50,80 100,80" stroke="#e2e8f0" strokeWidth="4" />
              </svg>
            </div>

            {/* Celebration Sparkles Burst when Cut */}
            {isCut && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-scale-up">
                <div className="w-12 h-12 rounded-full bg-amber-400/20 animate-ping" />
                <PartyPopper className="w-8 h-8 text-amber-500 absolute -top-4 animate-bounce" />
              </div>
            )}
          </div>
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
              With love from <strong className="text-neutral-800">{senderName}</strong>
            </span>
          </>
        )}
      </div>

      {/* ── Action Controls (Cut Cake vs Continue) ── */}
      <div className="pt-2 sm:pt-4 w-full sm:w-auto flex justify-center">
        {!isCut ? (
          <button
            type="button"
            onClick={handleCutCake}
            disabled={isCutting}
            className={`group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:px-8 sm:py-4 rounded-full text-sm sm:text-base font-semibold text-white shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer min-h-[48px] focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none ${
              isCutting ? 'opacity-80 scale-95' : ''
            }`}
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
            }}
            aria-label="Cut the birthday cake"
          >
            <Cake className={`w-5 h-5 ${isCutting ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} />
            <span>{isCutting ? 'Cutting the Cake...' : 'Cut the Cake 🎂'}</span>
            <Sparkles className="w-4 h-4 text-amber-200 group-hover:scale-125 transition-transform" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onContinue}
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-base font-semibold text-white shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer min-h-[48px] focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none animate-fade-in-up"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
            }}
            aria-label="Read birthday message"
          >
            <PartyPopper className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>Read Birthday Message</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </article>
  )
}
