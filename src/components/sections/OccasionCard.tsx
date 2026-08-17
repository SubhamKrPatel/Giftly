import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OccasionCardProps {
  icon: LucideIcon
  emoji: string
  title: string
  description: string
  gradient: string
  iconColor: string
}

export default function OccasionCard({
  icon: Icon,
  emoji,
  title,
  description,
  gradient,
  iconColor,
}: OccasionCardProps) {
  return (
    <article
      className={cn(
        'group relative bg-white rounded-2xl p-6 border border-warm-200 shadow-card cursor-pointer',
        'transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover',
        'focus-within:ring-2 focus-within:ring-rose-400 focus-within:ring-offset-2'
      )}
    >
      {/* Gradient overlay on hover */}
      <div
        className={cn(
          'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          gradient
        )}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110',
            iconColor
          )}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>

        {/* Emoji accent */}
        <div
          className="text-2xl mb-3 transition-transform duration-300 group-hover:scale-110"
          role="img"
          aria-hidden="true"
        >
          {emoji}
        </div>

        <h3 className="font-serif text-xl font-semibold text-neutral-800 mb-2 group-hover:text-rose-700 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm text-neutral-500 leading-relaxed group-hover:text-neutral-600 transition-colors duration-300">
          {description}
        </p>
      </div>
    </article>
  )
}
