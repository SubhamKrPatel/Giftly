import { Link } from 'react-router-dom'
import { Calendar, Trash2, ArrowRight, User } from 'lucide-react'
import type { GiftWithDetails } from '@/lib/database.types'
import { cn } from '@/lib/utils'

interface GiftCardProps {
  gift: GiftWithDetails
  onDeleteClick: (gift: GiftWithDetails) => void
}

export default function GiftCard({ gift, onDeleteClick }: GiftCardProps) {
  const primaryColor = gift.template?.theme_config?.primaryColor || '#f43f5e'
  const secondaryColor = gift.template?.theme_config?.secondaryColor || '#fda4af'

  const formattedDate = new Date(gift.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="group bg-white rounded-3xl border border-warm-200 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col justify-between">
      {/* Top Banner Accent */}
      <div
        className="h-28 p-4 relative flex items-start justify-between overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-black/5" />

        {/* Occasion Badge */}
        <div className="relative z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-neutral-800 shadow-sm">
          <span>{gift.occasion?.icon || '🎁'}</span>
          <span>{gift.occasion?.name || 'Gift'}</span>
        </div>

        {/* Status Badge */}
        <span
          className={cn(
            'relative z-10 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider shadow-sm',
            gift.status === 'published'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-white/90 text-neutral-700'
          )}
        >
          {gift.status}
        </span>
      </div>

      {/* Main Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-serif text-lg sm:text-xl font-semibold text-neutral-800 group-hover:text-rose-600 transition-colors line-clamp-1">
            {gift.title || `Gift for ${gift.recipient_name}`}
          </h3>

          <div className="mt-2.5 space-y-1.5 text-xs sm:text-sm text-neutral-500">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
              <span>
                For: <strong className="text-neutral-700 font-medium">{gift.recipient_name}</strong>
              </span>
            </div>

            {gift.sender_name && (
              <div className="flex items-center gap-1.5 text-neutral-400">
                <span className="w-3.5 text-center flex-shrink-0">•</span>
                <span>From: {gift.sender_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Meta & Actions */}
        <div className="pt-4 border-t border-warm-100 flex items-center justify-between gap-2">
          <span className="text-[11px] text-neutral-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formattedDate}
          </span>

          <div className="flex items-center gap-2">
            {/* Delete button */}
            <button
              type="button"
              onClick={() => onDeleteClick(gift)}
              className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Delete gift"
              aria-label={`Delete ${gift.title || 'gift'}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Continue Editing CTA */}
            <Link
              to={`/create/${gift.id}`}
              className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors"
            >
              <span>Edit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
