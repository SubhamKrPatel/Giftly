import { useState } from 'react'
import { Check, Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import type { Occasion } from '@/lib/database.types'
import { cn } from '@/lib/utils'

interface OccasionPickerProps {
  occasions: Occasion[]
  selectedOccasion: Occasion | null
  onSelect: (occasion: Occasion) => void
  loading?: boolean
  error?: string | null
  onRetry?: () => void
}

// Visual gradient accents and glow colors for different occasion themes
const occasionGradients: Record<
  string,
  { bg: string; iconBg: string; border: string; activeGlow: string }
> = {
  birthday: {
    bg: 'from-amber-500/10 to-orange-500/10',
    iconBg: 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-900',
    border: 'hover:border-amber-300',
    activeGlow: 'border-amber-500 ring-amber-200 shadow-amber-500/10',
  },
  valentines: {
    bg: 'from-rose-500/10 to-pink-500/10',
    iconBg: 'bg-gradient-to-br from-rose-100 to-pink-100 text-rose-900',
    border: 'hover:border-rose-300',
    activeGlow: 'border-rose-500 ring-rose-200 shadow-rose-500/10',
  },
  anniversary: {
    bg: 'from-purple-500/10 to-violet-500/10',
    iconBg: 'bg-gradient-to-br from-purple-100 to-violet-100 text-purple-900',
    border: 'hover:border-purple-300',
    activeGlow: 'border-purple-500 ring-purple-200 shadow-purple-500/10',
  },
  friendship: {
    bg: 'from-sky-500/10 to-blue-500/10',
    iconBg: 'bg-gradient-to-br from-sky-100 to-blue-100 text-sky-900',
    border: 'hover:border-sky-300',
    activeGlow: 'border-sky-500 ring-sky-200 shadow-sky-500/10',
  },
  wedding: {
    bg: 'from-emerald-500/10 to-teal-500/10',
    iconBg: 'bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-900',
    border: 'hover:border-emerald-300',
    activeGlow: 'border-emerald-500 ring-emerald-200 shadow-emerald-500/10',
  },
  festival: {
    bg: 'from-yellow-500/10 to-amber-500/10',
    iconBg: 'bg-gradient-to-br from-yellow-100 to-amber-100 text-yellow-900',
    border: 'hover:border-yellow-300',
    activeGlow: 'border-amber-500 ring-amber-200 shadow-amber-500/10',
  },
}

export default function OccasionPicker({
  occasions,
  selectedOccasion,
  onSelect,
  loading = false,
  error = null,
  onRetry,
}: OccasionPickerProps) {
  const [animatingId, setAnimatingId] = useState<string | null>(null)

  const handleCardClick = (occasion: Occasion) => {
    setAnimatingId(occasion.id)
    // Small delay to visually confirm selection before auto-advancing
    setTimeout(() => {
      onSelect(occasion)
    }, 150)
  }

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-9 h-9 text-rose-500 animate-spin mb-3" />
        <p className="text-sm font-medium text-neutral-500">Loading occasions…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4 text-rose-600">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-lg font-semibold text-neutral-800 mb-1">
          Unable to load occasions
        </h3>
        <p className="text-sm text-neutral-500 mb-6">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header text */}
      <div className="text-center max-w-lg mx-auto">
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-neutral-800 tracking-tight">
          What are you celebrating?
        </h2>
        <p className="text-sm text-neutral-500 mt-2">
          Choose an occasion and we'll personalize the experience for you.
        </p>
      </div>

      {/* Occasions Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto"
        role="radiogroup"
        aria-label="Choose an occasion"
      >
        {occasions.map((occasion) => {
          const isSelected = selectedOccasion?.id === occasion.id || animatingId === occasion.id
          const gradient = occasionGradients[occasion.slug] || {
            bg: 'from-rose-500/10 to-pink-500/10',
            iconBg: 'bg-gradient-to-br from-rose-100 to-pink-100 text-rose-900',
            border: 'hover:border-rose-300',
            activeGlow: 'border-rose-500 ring-rose-200 shadow-rose-500/10',
          }

          return (
            <div
              key={occasion.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => handleCardClick(occasion)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault()
                  handleCardClick(occasion)
                }
              }}
              className={cn(
                'group relative text-left p-6 sm:p-7 rounded-2xl sm:rounded-3xl border-2 transition-all duration-200 cursor-pointer bg-white select-none',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2',
                isSelected
                  ? cn('scale-[1.01] shadow-glow ring-2', gradient.activeGlow)
                  : cn('border-warm-200 hover:shadow-card-hover hover:-translate-y-0.5', gradient.border)
              )}
            >
              {/* Selected check badge */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-sm animate-scale-in">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              {/* Emoji Icon */}
              <div
                className={cn(
                  'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-sm mb-4 transition-all duration-300',
                  isSelected
                    ? 'scale-105 bg-rose-50'
                    : 'bg-warm-100 group-hover:bg-rose-50 group-hover:scale-105'
                )}
              >
                <span>{occasion.icon}</span>
              </div>

              {/* Title & Description */}
              <h3
                className={cn(
                  'font-serif text-lg sm:text-xl font-semibold transition-colors mb-1.5',
                  isSelected ? 'text-rose-600' : 'text-neutral-800 group-hover:text-rose-600'
                )}
              >
                {occasion.name}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                {occasion.description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
