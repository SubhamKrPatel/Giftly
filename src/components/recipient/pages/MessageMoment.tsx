import { MessageSquareHeart } from 'lucide-react'
import type { GiftWithDetails, GiftThemeConfig } from '@/lib/database.types'
import type { RecipientPage } from '@/lib/recipientPages'

interface MessageMomentProps {
  page: RecipientPage
  gift: GiftWithDetails
  theme: GiftThemeConfig
}

export default function MessageMoment({
  page,
  gift,
  theme,
}: MessageMomentProps) {
  const primaryColor = theme.primaryColor || '#f43f5e'
  const heading = page.content.heading || 'A Message For You'
  const body = page.content.body || ''
  const senderName = page.content.signature || gift.sender_name

  return (
    <article className="max-w-xl mx-auto w-full bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-card border border-warm-200/80 space-y-6 animate-fade-in">
      {/* Moment Header */}
      <div className="flex items-center gap-3.5 border-b border-warm-100 pb-4">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs flex-shrink-0"
          style={{ backgroundColor: primaryColor }}
        >
          <MessageSquareHeart className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Personal Note
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-neutral-800 truncate">
            {heading}
          </h2>
        </div>
      </div>

      {/* Message Body */}
      <div className="font-serif text-base sm:text-lg text-neutral-700 leading-relaxed sm:leading-loose whitespace-pre-line font-normal selection:bg-rose-100">
        {body}
      </div>

      {/* Signature */}
      {senderName && (
        <div className="pt-4 border-t border-warm-100 text-right">
          <p className="text-xs text-neutral-400 font-sans">With affection,</p>
          <p
            className="font-serif text-lg font-bold italic mt-0.5"
            style={{ color: primaryColor }}
          >
            — {senderName}
          </p>
        </div>
      )}
    </article>
  )
}
