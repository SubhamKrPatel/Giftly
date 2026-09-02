import { Image as ImageIcon } from 'lucide-react'
import type { GiftThemeConfig } from '@/lib/database.types'
import type { RecipientPage } from '@/lib/recipientPages'

interface PhotosMomentProps {
  page: RecipientPage
  theme: GiftThemeConfig
  onSelectPhoto: (index: number) => void
}

export default function PhotosMoment({
  page,
  theme,
  onSelectPhoto,
}: PhotosMomentProps) {
  const primaryColor = theme.primaryColor || '#f43f5e'
  const photos = page.content.photos || []
  const subtitle = page.subtitle

  if (photos.length === 0) return null

  return (
    <article className="max-w-xl mx-auto w-full bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-8 shadow-card border border-warm-200/80 space-y-5 animate-fade-in">
      {/* Moment Header */}
      <div className="flex items-center justify-between border-b border-warm-100 pb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs flex-shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Moments
            </span>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-neutral-800">
              Photo Memories
            </h2>
            {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-warm-100 text-neutral-600">
          {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
        </span>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-h-[55vh] overflow-y-auto pr-1 scrollbar-thin">
        {photos.map((item, index) => (
          <div
            key={item.id}
            onClick={() => onSelectPhoto(index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelectPhoto(index)
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`View photo ${index + 1}: ${item.file_name}`}
            className={`group relative rounded-2xl overflow-hidden shadow-xs cursor-pointer bg-warm-100 transition-all duration-300 hover:shadow-md hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none ${
              photos.length % 2 !== 0 && index === 0
                ? 'sm:col-span-2 aspect-[16/10]'
                : 'aspect-square'
            }`}
          >
            <img
              src={item.signedUrl}
              alt={item.file_name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-neutral-900/0 group-hover:bg-neutral-900/25 transition-colors flex items-end p-3">
              <span className="opacity-0 group-hover:opacity-100 text-white text-[11px] font-medium bg-neutral-900/70 backdrop-blur-sm px-2.5 py-1 rounded-full transition-opacity shadow-xs">
                🔍 Tap to enlarge
              </span>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}
