import { Check, ArrowRight, Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import type { Occasion } from '@/lib/database.types'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'

interface OccasionPickerProps {
  occasions: Occasion[]
  selectedOccasion: Occasion | null
  onSelect: (occasion: Occasion) => void
  onContinue: () => void
  loading?: boolean
  error?: string | null
  onRetry?: () => void
}

// Visual gradient accents for different occasion themes
const occasionGradients: Record<string, { bg: string; iconBg: string; border: string }> = {
  birthday: {
    bg: 'from-amber-500/10 to-orange-500/10',
    iconBg: 'from-amber-400 to-orange-500',
    border: 'hover:border-amber-300',
  },
  valentines: {
    bg: 'from-rose-500/10 to-pink-500/10',
    iconBg: 'from-rose-400 to-rose-600',
    border: 'hover:border-rose-300',
  },
  anniversary: {
    bg: 'from-purple-500/10 to-violet-500/10',
    iconBg: 'from-purple-400 to-violet-500',
    border: 'hover:border-purple-300',
  },
  friendship: {
    bg: 'from-sky-500/10 to-blue-500/10',
    iconBg: 'from-sky-400 to-blue-500',
    border: 'hover:border-sky-300',
  },
  wedding: {
    bg: 'from-emerald-500/10 to-teal-500/10',
    iconBg: 'from-emerald-400 to-teal-500',
    border: 'hover:border-emerald-300',
  },
  festival: {
    bg: 'from-yellow-500/10 to-amber-500/10',
    iconBg: 'from-yellow-400 to-amber-500',
    border: 'hover:border-yellow-300',
  },
}

export default function OccasionPicker({
  occasions,
  selectedOccasion,
  onSelect,
  onContinue,
  loading = false,
  error = null,
  onRetry,
}: OccasionPickerProps) {
  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-3" />
        <p className="text-sm text-neutral-500">Loading occasions…</p>
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors shadow-sm"
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
          What is the special occasion?
        </h2>
        <p className="text-sm text-neutral-500 mt-2">
          Select an occasion to tailor the templates, style, and atmosphere of your gift.
        </p>
      </div>

      {/* Occasions Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        role="radiogroup"
        aria-label="Choose an occasion"
      >
        {occasions.map((occasion) => {
          const isSelected = selectedOccasion?.id === occasion.id
          const gradient = occasionGradients[occasion.slug] || {
            bg: 'from-rose-500/10 to-pink-500/10',
            iconBg: 'from-rose-400 to-rose-600',
            border: 'hover:border-rose-300',
          }

          return (
            <div
              key={occasion.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onSelect(occasion)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault()
                  onSelect(occasion)
                }
              }}
              className={cn(
                'group relative text-left p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer bg-white select-none',
                isSelected
                  ? 'border-rose-500 bg-gradient-to-br shadow-glow ring-2 ring-rose-200'
                  : cn('border-warm-200 hover:shadow-card-hover', gradient.border)
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
                  'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-4 transition-transform duration-300 group-hover:scale-105',
                  isSelected
                    ? 'bg-rose-500/15'
                    : 'bg-warm-100 group-hover:bg-rose-50'
                )}
              >
                <span>{occasion.icon}</span>
              </div>

              {/* Title & Description */}
              <h3 className="font-serif text-lg font-semibold text-neutral-800 group-hover:text-rose-600 transition-colors mb-1">
                {occasion.name}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                {occasion.description}
              </p>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-4 border-t border-warm-200">
        <Button
          size="lg"
          disabled={!selectedOccasion}
          onClick={onContinue}
          className="w-full sm:w-auto"
        >
          <span>Continue to Templates</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
