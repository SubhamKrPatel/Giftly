import { Sparkles, BookOpen } from 'lucide-react'
import type { GiftThemeConfig } from '@/lib/database.types'
import type { RecipientPage } from '@/lib/recipientPages'

interface StoryMomentProps {
  page: RecipientPage
  theme: GiftThemeConfig
}

export default function StoryMoment({ page, theme }: StoryMomentProps) {
  const primaryColor = theme.primaryColor || '#f43f5e'
  const heading = page.content.heading || 'Our Story'
  const subtitle = page.subtitle
  const body = page.content.body
  const items = page.content.items || []

  return (
    <article className="max-w-xl mx-auto w-full bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-card border border-warm-200/80 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3.5 border-b border-warm-100 pb-4">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs flex-shrink-0"
          style={{ backgroundColor: primaryColor }}
        >
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Special Moments
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-neutral-800 truncate">
            {heading}
          </h2>
          {subtitle && <p className="text-xs text-neutral-500 truncate">{subtitle}</p>}
        </div>
      </div>

      {/* Narrative Body */}
      {body && (
        <div className="font-serif text-sm sm:text-base text-neutral-700 leading-relaxed whitespace-pre-line">
          {body}
        </div>
      )}

      {/* Story Items / Chapters */}
      {items.length > 0 && (
        <div className="space-y-3 pt-2">
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              className="flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-warm-50/70 border border-warm-100 transition-all hover:bg-warm-100/70"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-white shadow-xs border border-warm-200"
                style={{ color: item.colorTag || primaryColor }}
              >
                {item.iconEmoji || <Sparkles className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-neutral-800">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  )
}
