import { useState } from 'react'
import {
  Heart,
  Users,
  Smile,
  Home,
  Sparkles,
  Flame,
  GraduationCap,
  Briefcase,
  Crown,
  Gift,
  ArrowLeft,
  Check,
} from 'lucide-react'
import type { Occasion } from '@/lib/database.types'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { getRelationshipsForOccasion, type RelationshipOption } from './recommendations'

interface RelationshipPickerProps {
  occasion: Occasion | null
  selectedRelationship: string | null
  onSelect: (relationshipId: string) => void
  onBack: () => void
}

// Icon mapper for relationship cards
function RelationshipIcon({ name, className }: { name?: string; className?: string }) {
  switch (name) {
    case 'Heart':
      return <Heart className={className} />
    case 'Flame':
      return <Flame className={className} />
    case 'Smile':
      return <Smile className={className} />
    case 'Home':
      return <Home className={className} />
    case 'Sparkles':
      return <Sparkles className={className} />
    case 'GraduationCap':
      return <GraduationCap className={className} />
    case 'Briefcase':
      return <Briefcase className={className} />
    case 'Crown':
      return <Crown className={className} />
    case 'Gift':
      return <Gift className={className} />
    case 'Users':
    default:
      return <Users className={className} />
  }
}

export default function RelationshipPicker({
  occasion,
  selectedRelationship,
  onSelect,
  onBack,
}: RelationshipPickerProps) {
  const [animatingSelection, setAnimatingSelection] = useState<string | null>(null)
  const options = getRelationshipsForOccasion(occasion?.slug)

  const handleCardClick = (rel: RelationshipOption) => {
    setAnimatingSelection(rel.id)
    // Trigger smooth transition
    setTimeout(() => {
      onSelect(rel.id)
    }, 150)
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header text */}
      <div className="text-center max-w-lg mx-auto">
        {occasion && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 mb-3 shadow-xs">
            <span>{occasion.icon}</span>
            <span>{occasion.name}</span>
          </div>
        )}
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-neutral-800 tracking-tight">
          Who is this gift for?
        </h2>
        <p className="text-sm text-neutral-500 mt-2">
          We'll use this to personalize your experience.
        </p>
      </div>

      {/* Relationship Cards Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto"
        role="radiogroup"
        aria-label="Select relationship"
      >
        {options.map((rel) => {
          const isSelected = selectedRelationship === rel.id || animatingSelection === rel.id

          return (
            <div
              key={rel.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => handleCardClick(rel)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault()
                  handleCardClick(rel)
                }
              }}
              className={cn(
                'group relative text-left p-5 sm:p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer bg-white select-none',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2',
                isSelected
                  ? 'border-rose-500 bg-rose-50/40 shadow-glow ring-2 ring-rose-200 scale-[1.01]'
                  : 'border-warm-200 hover:border-rose-300 hover:shadow-card-hover hover:-translate-y-0.5'
              )}
            >
              {/* Selected check badge */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-sm animate-scale-in">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              {/* Icon */}
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm mb-3.5 transition-all duration-300',
                  isSelected
                    ? 'bg-rose-500 text-white shadow-rose-200'
                    : 'bg-warm-100 text-neutral-600 group-hover:bg-rose-100 group-hover:text-rose-600 group-hover:scale-105'
                )}
              >
                <RelationshipIcon name={rel.iconName} className="w-5 h-5" />
              </div>

              {/* Label & Description */}
              <h3
                className={cn(
                  'font-serif text-lg font-semibold transition-colors mb-1',
                  isSelected ? 'text-rose-700' : 'text-neutral-800 group-hover:text-rose-600'
                )}
              >
                {rel.label}
              </h3>
              {rel.description && (
                <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                  {rel.description}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Back button */}
      <div className="flex items-center justify-between pt-6 border-t border-warm-200 max-w-4xl mx-auto">
        <Button variant="outline" size="md" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          <span>Change Occasion</span>
        </Button>
      </div>
    </div>
  )
}
