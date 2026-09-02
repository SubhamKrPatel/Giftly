import { Heart, RotateCcw, Sparkles } from 'lucide-react'
import type { GiftWithDetails, GiftThemeConfig } from '@/lib/database.types'
import type { RecipientPage } from '@/lib/recipientPages'

interface ClosingMomentProps {
  page: RecipientPage
  gift: GiftWithDetails
  theme: GiftThemeConfig
  onReplay?: () => void
}

export default function ClosingMoment({
  page,
  gift,
  theme,
  onReplay,
}: ClosingMomentProps) {
  const primaryColor = theme.primaryColor || '#f43f5e'
  const accentColor = theme.accentColor || '#e11d48'
  const heading = page.content.heading || 'With Love'
  const body = page.content.body || ''
  const senderName = page.content.signature || gift.sender_name

  return (
    <article className="max-w-xl mx-auto w-full bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-card border border-warm-200/80 text-center space-y-6 animate-fade-in">
      {/* Heart Icon */}
      <div
        className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white shadow-md animate-pulse-subtle"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
        }}
      >
        <Heart className="w-8 h-8 fill-white" />
      </div>

      {/* Heading */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
          Final Wish
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-800">
          {heading}
        </h2>
      </div>

      {/* Body */}
      {body && (
        <p className="font-serif text-base sm:text-lg text-neutral-600 max-w-md mx-auto leading-relaxed whitespace-pre-line">
          &quot;{body}&quot;
        </p>
      )}

      {/* Sender Signature */}
      {senderName && (
        <div className="pt-2">
          <p
            className="font-serif text-lg font-bold italic"
            style={{ color: primaryColor }}
          >
            — {senderName}
          </p>
        </div>
      )}

      {/* Replay action */}
      {onReplay && (
        <div className="pt-6">
          <button
            type="button"
            onClick={onReplay}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold text-neutral-600 bg-warm-100 hover:bg-warm-200 hover:text-neutral-900 transition-colors shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Experience Again</span>
          </button>
        </div>
      )}

      {/* Footer watermark */}
      <div className="pt-6 border-t border-warm-100 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-neutral-400">
        <Sparkles className="w-3.5 h-3.5 text-rose-500" />
        <span>Made with love on Giftly</span>
      </div>
    </article>
  )
}
