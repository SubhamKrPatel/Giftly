import { Sparkles, BookOpen, Calendar } from 'lucide-react'
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
  const backgroundImageUrl = page.content.backgroundImageUrl

  return (
    <article className="relative max-w-xl mx-auto w-full rounded-3xl overflow-hidden shadow-card border border-warm-200/80 animate-fade-in transition-all">
      {/* Optional Story Background Photo Layer */}
      {backgroundImageUrl && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src={backgroundImageUrl}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover filter blur-[2px] scale-105 opacity-25 dark:opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/95 backdrop-blur-xs" />
        </div>
      )}

      {/* Main Content Card Container */}
      <div className="relative z-10 p-6 sm:p-8 space-y-6 bg-white/90 backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center gap-3.5 border-b border-warm-100 pb-4">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs flex-shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Special Moments
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-neutral-800 truncate">
              {heading}
            </h2>
            {subtitle && <p className="text-xs text-neutral-500 truncate">{subtitle}</p>}
          </div>
        </div>

        {/* Narrative Body (if any) */}
        {body && (
          <div className="font-serif text-sm sm:text-base text-neutral-700 leading-relaxed whitespace-pre-line">
            {body}
          </div>
        )}

        {/* Story Memories / Chapters Sequence */}
        {items.length > 0 && (
          <div className="space-y-4 pt-1">
            {items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="rounded-2xl bg-white/80 backdrop-blur-sm border border-warm-200/80 p-4 sm:p-5 shadow-xs hover:border-warm-300 transition-all space-y-3 group"
              >
                {/* Memory Photo (Optional) */}
                {item.imageUrl && (
                  <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden bg-warm-100 border border-warm-200/80 shadow-2xs">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Memory Details */}
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {!item.imageUrl && (
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 bg-warm-100 text-rose-500 border border-warm-200"
                          style={{ color: item.colorTag || primaryColor }}
                        >
                          {item.iconEmoji || <Sparkles className="w-4 h-4" />}
                        </div>
                      )}
                      <h3 className="font-serif text-base sm:text-lg font-bold text-neutral-800 leading-snug">
                        {item.title}
                      </h3>
                    </div>

                    {item.date && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-warm-100/90 text-[11px] font-medium text-neutral-600 flex-shrink-0 border border-warm-200/60">
                        <Calendar className="w-3 h-3 text-neutral-400" />
                        <span>{item.date}</span>
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans pt-0.5 whitespace-pre-line">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
