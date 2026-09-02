import { Gift, ChevronRight } from 'lucide-react'
import type { GiftWithDetails, GiftThemeConfig } from '@/lib/database.types'
import type { RecipientPage } from '@/lib/recipientPages'

interface OpeningMomentProps {
  page: RecipientPage
  gift: GiftWithDetails
  theme: GiftThemeConfig
  onContinue: () => void
}

export default function OpeningMoment({
  page,
  gift,
  theme,
  onContinue,
}: OpeningMomentProps) {
  const primaryColor = theme.primaryColor || '#f43f5e'
  const accentColor = theme.accentColor || '#e11d48'

  const headline = page.content.headline || `A Special Surprise for ${gift.recipient_name}`
  const subheadline = page.content.subheadline

  return (
    <article className="flex flex-col items-center justify-center text-center py-6 sm:py-10 px-4 max-w-lg mx-auto w-full space-y-6 animate-fade-in">
      {/* Occasion Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md shadow-xs border border-white/60 text-xs font-semibold">
        <span className="text-base">{gift.occasion?.icon || '🎁'}</span>
        <span style={{ color: primaryColor }}>
          {gift.occasion?.name || 'A Special Surprise'}
        </span>
      </div>

      {/* Decorative Icon */}
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-card transition-transform duration-300 hover:scale-105"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
        }}
      >
        <Gift className="w-10 h-10 animate-bounce-subtle" />
      </div>

      {/* Main Headline */}
      <div className="space-y-3">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 leading-[1.2] drop-shadow-xs">
          {headline}
        </h1>

        {subheadline && (
          <p className="text-sm sm:text-base text-neutral-600 max-w-md mx-auto leading-relaxed">
            {subheadline}
          </p>
        )}
      </div>

      {/* Sender & Recipient Tag */}
      <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-neutral-500">
        <span>
          Crafted with love for <strong className="text-neutral-800">{gift.recipient_name}</strong>
        </span>
        {gift.sender_name && (
          <>
            <span>•</span>
            <span>
              From <strong className="text-neutral-800">{gift.sender_name}</strong>
            </span>
          </>
        )}
      </div>

      {/* Primary Open Gift CTA */}
      <div className="pt-4 w-full sm:w-auto">
        <button
          type="button"
          onClick={onContinue}
          className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-base font-semibold text-white shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer min-h-[48px]"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
          }}
          aria-label="Open your gift"
        >
          <Gift className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span>Open Your Gift</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </article>
  )
}
