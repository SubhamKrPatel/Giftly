import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepHeaderProps {
  currentStep: 1 | 2 | 3
  onStepClick?: (step: 1 | 2 | 3) => void
}

const STEPS = [
  { step: 1, title: 'Choose Occasion', shortTitle: 'Occasion' },
  { step: 2, title: 'Select Template', shortTitle: 'Template' },
  { step: 3, title: 'Gift Details', shortTitle: 'Details' },
] as const

export default function StepHeader({ currentStep, onStepClick }: StepHeaderProps) {
  const progressPercent = currentStep === 1 ? 33 : currentStep === 2 ? 66 : 100

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0">
      {/* Step numbers and titles */}
      <div className="flex items-center justify-between mb-4">
        {STEPS.map((s) => {
          const isCompleted = currentStep > s.step
          const isCurrent = currentStep === s.step
          const isAccessible = s.step < currentStep

          return (
            <button
              key={s.step}
              type="button"
              disabled={!isAccessible}
              onClick={() => isAccessible && onStepClick?.(s.step as 1 | 2 | 3)}
              className={cn(
                'flex items-center gap-2 text-left transition-all duration-200',
                isAccessible ? 'cursor-pointer group' : 'cursor-default'
              )}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {/* Badge */}
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300',
                  isCompleted
                    ? 'bg-rose-500 text-white shadow-sm'
                    : isCurrent
                    ? 'bg-rose-500 text-white ring-4 ring-rose-100 shadow-glow'
                    : 'bg-warm-200 text-neutral-400'
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : s.step}
              </div>

              {/* Title */}
              <div className="hidden sm:block">
                <span className="block text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
                  Step {s.step}
                </span>
                <span
                  className={cn(
                    'text-xs sm:text-sm font-semibold transition-colors',
                    isCurrent
                      ? 'text-neutral-800'
                      : isCompleted
                      ? 'text-neutral-600 group-hover:text-rose-600'
                      : 'text-neutral-400'
                  )}
                >
                  {s.title}
                </span>
              </div>

              {/* Mobile title */}
              <span
                className={cn(
                  'text-xs font-medium sm:hidden',
                  isCurrent ? 'text-neutral-800 font-semibold' : 'text-neutral-400'
                )}
              >
                {s.shortTitle}
              </span>
            </button>
          )
        })}
      </div>

      {/* Progress Bar track */}
      <div className="h-1.5 w-full bg-warm-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}
