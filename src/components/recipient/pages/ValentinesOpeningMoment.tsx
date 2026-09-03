import { useState, useCallback, useRef } from 'react'
import { Heart, Sparkles, ChevronRight, PartyPopper } from 'lucide-react'
import type { GiftWithDetails, GiftThemeConfig } from '@/lib/database.types'
import type { RecipientPage } from '@/lib/recipientPages'

interface ValentinesOpeningMomentProps {
  page: RecipientPage
  gift: GiftWithDetails
  theme: GiftThemeConfig
  onContinue: () => void
  isCompact?: boolean
}

const NO_PHRASES = [
  'No',
  'Are you sure? 😏',
  'Really? 👀',
  'Think again! 🥺',
  'Okay, I won\'t run away 💔',
]

// Deterministic safe dodge offsets (relative pixels) strictly bounded within the container
const DODGE_POSITIONS = [
  { x: 0, y: 0 },
  { x: 30, y: -25 },
  { x: -35, y: 20 },
  { x: 25, y: 30 },
  { x: 0, y: 0 },
]

export default function ValentinesOpeningMoment({
  page,
  gift,
  theme,
  onContinue,
  isCompact = false,
}: ValentinesOpeningMomentProps) {
  const primaryColor = theme.primaryColor || '#f43f5e'
  const accentColor = theme.accentColor || '#e11d48'

  const recipientName = gift.recipient_name?.trim() || 'Chahat'
  const senderName = gift.sender_name?.trim()

  const defaultQuestion = recipientName
    ? `${recipientName}, will you be my Valentine?`
    : 'Will you be my Valentine? ❤️'

  const question = page.content.headline || defaultQuestion
  const subheadline = page.content.subheadline || 'Be honest... but choose carefully 😉'

  // State: 'asking' | 'celebrating' | 'accepted' | 'declined'
  const [state, setState] = useState<'asking' | 'celebrating' | 'accepted' | 'declined'>('asking')
  const [dodgeCount, setDodgeCount] = useState(0)
  const isKeyboardFocusedRef = useRef(false)

  // Handle YES
  const handleYes = useCallback(() => {
    if (state !== 'asking') return
    setState('celebrating')
    setTimeout(() => {
      setState('accepted')
    }, 800)
  }, [state])

  // Handle NO (Pointer hover or touch dodge)
  const handleNoPointerAttempt = useCallback((e?: React.SyntheticEvent) => {
    // If keyboard triggered, don't dodge!
    if (isKeyboardFocusedRef.current) return
    if (state !== 'asking') return

    // If already at max dodges (4), let the user click it freely
    if (dodgeCount >= 4) return

    e?.preventDefault?.()
    setDodgeCount((prev) => Math.min(prev + 1, 4))
  }, [state, dodgeCount])

  // Handle NO activation (when user actually clicks NO or uses keyboard)
  const handleNoActivate = useCallback(() => {
    if (state !== 'asking') return
    setState('declined')
  }, [state])

  const currentNoPhrase = NO_PHRASES[dodgeCount] || 'No'
  const currentOffset = DODGE_POSITIONS[dodgeCount] || { x: 0, y: 0 }
  const isAccepted = state === 'accepted' || state === 'celebrating'
  const isDeclined = state === 'declined'

  return (
    <article
      className={`flex flex-col items-center justify-center text-center mx-auto w-full animate-fade-in select-none ${
        isCompact ? 'py-2 px-1 max-w-xs space-y-3' : 'py-4 sm:py-8 px-4 max-w-lg space-y-5 sm:space-y-6'
      }`}
    >
      {/* ── Occasion Pill ── */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/85 backdrop-blur-md shadow-xs border border-rose-200/60 text-xs font-semibold">
        <span className="text-sm">💕</span>
        <span style={{ color: primaryColor }}>Valentine's Special</span>
      </div>

      {/* ── Headline & Question ── */}
      <div className="space-y-1 sm:space-y-2">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400">
          {isAccepted
            ? 'Forever & Always'
            : isDeclined
            ? 'From the Bottom of My Heart'
            : 'A Question for You'}
        </span>

        <h1
          className={`font-serif font-bold tracking-tight text-neutral-900 leading-tight drop-shadow-xs transition-all duration-500 ${
            isCompact
              ? 'text-lg sm:text-xl'
              : 'text-2xl sm:text-4xl md:text-5xl'
          }`}
        >
          {isAccepted
            ? 'Yay! You said YES! 💖'
            : isDeclined
            ? 'That\'s okay ❤️'
            : question}
        </h1>

        <p
          className={`text-neutral-600 max-w-md mx-auto leading-relaxed transition-opacity duration-300 ${
            isCompact ? 'text-[11px]' : 'text-xs sm:text-sm'
          }`}
        >
          {isAccepted
            ? `${recipientName}, you just made this the most special moment. This surprise was crafted with all my love.`
            : isDeclined
            ? `${recipientName}, no matter what, I still put my whole heart into making this surprise for you.`
            : subheadline}
        </p>
      </div>

      {/* ── Romantic Visual Illustration ── */}
      <div className="relative flex flex-col items-center justify-center py-2 sm:py-4">
        {/* Ambient Wine/Rose Glow */}
        <div
          className={`absolute w-36 h-36 rounded-full blur-2xl opacity-40 transition-all duration-700 pointer-events-none ${
            isAccepted ? 'scale-125 bg-rose-500' : isDeclined ? 'scale-100 bg-amber-400' : 'bg-rose-400'
          }`}
        />

        {/* Layered Hearts */}
        <div className="relative flex items-center justify-center">
          {/* Main Hero Heart */}
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center text-white shadow-card transition-all duration-500 ${
              isAccepted
                ? 'scale-110 rotate-6'
                : isDeclined
                ? 'scale-95'
                : 'hover:scale-105 animate-pulse-subtle'
            }`}
            style={{
              background: isDeclined
                ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
                : `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
            }}
          >
            {isAccepted ? (
              <PartyPopper className="w-10 h-10 sm:w-12 sm:h-12 animate-bounce" />
            ) : (
              <Heart className="w-10 h-10 sm:w-12 sm:h-12 fill-white animate-pulse" />
            )}
          </div>

          {/* Floating mini hearts / sparkles */}
          <Heart className="w-5 h-5 fill-rose-300 text-rose-400 absolute -top-2 -right-3 animate-float-slow" />
          <Sparkles className="w-5 h-5 text-amber-300 absolute -bottom-2 -left-3 animate-pulse" />
        </div>
      </div>

      {/* ── Sender Attribution ── */}
      {senderName && (
        <div className="text-xs font-medium text-neutral-500">
          — With love, <strong className="text-neutral-800">{senderName}</strong>
        </div>
      )}

      {/* ── Interactive Choices (YES / NO vs Continue) ── */}
      <div className="pt-2 sm:pt-4 w-full flex flex-col items-center justify-center min-h-[64px] relative">
        {state === 'asking' || state === 'celebrating' ? (
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 relative w-full max-w-sm">
            {/* YES Button */}
            <button
              type="button"
              onClick={handleYes}
              disabled={state === 'celebrating'}
              className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 sm:px-8 sm:py-4 rounded-full text-sm sm:text-base font-bold text-white shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer min-h-[48px] focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
              }}
              aria-label="Say yes to be their Valentine"
            >
              <Heart className="w-4 h-4 fill-white group-hover:scale-125 transition-transform" />
              <span>YES ❤️</span>
            </button>

            {/* Playful NO Button (Dodges on pointer/touch up to 4 times, stationary on keyboard/reduced-motion) */}
            <div
              className="transition-transform duration-300 ease-out motion-reduce:transform-none"
              style={{
                transform: `translate3d(${currentOffset.x}px, ${currentOffset.y}px, 0)`,
              }}
            >
              <button
                type="button"
                onMouseEnter={() => handleNoPointerAttempt()}
                onTouchStart={() => handleNoPointerAttempt()}
                onFocus={() => {
                  isKeyboardFocusedRef.current = true
                }}
                onBlur={() => {
                  isKeyboardFocusedRef.current = false
                }}
                onClick={handleNoActivate}
                className="inline-flex items-center justify-center px-5 py-3 sm:px-6 sm:py-3.5 rounded-full text-xs sm:text-sm font-semibold text-neutral-600 bg-white/80 hover:bg-white hover:text-neutral-900 border border-warm-200 shadow-sm transition-colors cursor-pointer min-h-[48px] focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none"
                aria-label={`Decline Valentine's invitation (${currentNoPhrase})`}
              >
                {currentNoPhrase}
              </button>
            </div>
          </div>
        ) : isAccepted ? (
          /* Accepted State Continue Button */
          <button
            type="button"
            onClick={onContinue}
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-base font-semibold text-white shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer min-h-[48px] focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none animate-fade-in-up"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
            }}
            aria-label="Continue to our story"
          >
            <Heart className="w-5 h-5 fill-white group-hover:scale-125 transition-transform" />
            <span>Continue to Our Story</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          /* Declined State Continue Button */
          <button
            type="button"
            onClick={onContinue}
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-base font-semibold text-white shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer min-h-[48px] focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none animate-fade-in-up"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
            }}
            aria-label="Read message anyway"
          >
            <span>Read Message Anyway</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </article>
  )
}
