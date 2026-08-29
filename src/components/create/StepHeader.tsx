import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export type CreationStep = 1 | 2 | 3 | 4

interface StepHeaderProps {
  currentStep: CreationStep
  onStepClick?: (step: CreationStep) => void
}

const STEPS = [
  { step: 1, title: 'Occasion', shortTitle: 'Occasion' },
  { step: 2, title: 'Relationship', shortTitle: 'Relationship' },
  { step: 3, title: 'Template', shortTitle: 'Template' },
  { step: 4, title: 'Details', shortTitle: 'Details' },
] as const

export default function StepHeader({ currentStep, onStepClick }: StepHeaderProps) {
  const progressPercent = (currentStep / 4) * 100
  const activeStepMeta = STEPS.find((s) => s.step === currentStep) || STEPS[0]

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-0">
      {/* Mobile Compact Progress Bar Header */}
      <div className="sm:hidden mb-3">
        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
          <span className="text-rose-600 font-semibold">
            Step {currentStep} of 4
          </span>
          <span className="text-neutral-600 font-serif">
            {activeStepMeta.title}
          </span>
        </div>
      </div>

      {/* Desktop Step Numbers and Titles */}
      <div className="hidden sm:flex items-center justify-between mb-4">
        {STEPS.map((s) => {
          const isCompleted = currentStep > s.step
          const isCurrent = currentStep === s.step
          const isAccessible = s.step < currentStep

          return (
            <button
              key={s.step}
              type="button"
              disabled={!isAccessible}
              onClick={() => isAccessible && onStepClick?.(s.step as CreationStep)}
              className={cn(
                'flex items-center gap-2.5 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 rounded-lg p-1',
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
                {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : s.step}
              </div>

              {/* Title */}
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
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
            </button>
          )
        })}
      </div>

      {/* Progress Bar track */}
      <div className="h-1.5 sm:h-2 w-full bg-warm-200 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}
