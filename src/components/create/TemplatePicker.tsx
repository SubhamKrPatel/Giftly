import { Check, ArrowRight, ArrowLeft, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import type { Template, Occasion } from '@/lib/database.types'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'

interface TemplatePickerProps {
  templates: Template[]
  selectedTemplate: Template | null
  occasion: Occasion | null
  onSelect: (template: Template) => void
  onContinue: () => void
  onBack: () => void
  loading?: boolean
  error?: string | null
  onRetry?: () => void
}

export default function TemplatePicker({
  templates,
  selectedTemplate,
  occasion,
  onSelect,
  onContinue,
  onBack,
  loading = false,
  error = null,
  onRetry,
}: TemplatePickerProps) {
  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-3" />
        <p className="text-sm text-neutral-500">Loading templates for {occasion?.name || 'occasion'}…</p>
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
          Unable to load templates
        </h3>
        <p className="text-sm text-neutral-500 mb-6">{error}</p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
            Back to Occasions
          </Button>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header text */}
      <div className="text-center max-w-lg mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 mb-3">
          <span>{occasion?.icon}</span>
          <span>{occasion?.name}</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-neutral-800 tracking-tight">
          Choose your visual style
        </h2>
        <p className="text-sm text-neutral-500 mt-2">
          Select a template design. You will be able to customize messages, memories, and music in the editor.
        </p>
      </div>

      {/* Template Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto"
        role="radiogroup"
        aria-label="Choose a template"
      >
        {templates.map((template) => {
          const isSelected = selectedTemplate?.id === template.id
          const primaryColor = template.theme_config.primaryColor || '#f43f5e'
          const secondaryColor = template.theme_config.secondaryColor || '#fda4af'
          const tag = template.theme_config.tag

          return (
            <div
              key={template.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onSelect(template)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault()
                  onSelect(template)
                }
              }}
              className={cn(
                'group relative text-left rounded-3xl border-2 transition-all duration-200 cursor-pointer bg-white overflow-hidden select-none',
                isSelected
                  ? 'border-rose-500 shadow-glow ring-2 ring-rose-200'
                  : 'border-warm-200 hover:border-rose-300 hover:shadow-card-hover'
              )}
            >
              {/* Visual Color-Block Card Preview */}
              <div
                className="h-44 p-4 relative flex flex-col justify-between overflow-hidden transition-transform duration-300"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                }}
              >
                {/* Decorative background overlay elements */}
                <div className="absolute inset-0 bg-black/5 backdrop-blur-[0.5px]" />
                <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-black/10 blur-xl pointer-events-none" />

                {/* Top preview row */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-xl drop-shadow-sm">{occasion?.icon || '🎁'}</span>
                  {tag && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-white/90 text-neutral-800 shadow-sm backdrop-blur-sm">
                      {tag}
                    </span>
                  )}
                </div>

                {/* Card Mockup content preview */}
                <div className="relative z-10 bg-white/90 backdrop-blur-md rounded-xl p-3 shadow-sm border border-white/40">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <div className="h-2 w-24 bg-neutral-300 rounded-full" />
                  </div>
                  <div className="h-1.5 w-16 bg-neutral-200 rounded-full" />
                </div>

                {/* Selected Checkmark overlay */}
                {isSelected && (
                  <div className="absolute top-3 right-3 z-20 w-7 h-7 bg-white text-rose-600 rounded-full flex items-center justify-center shadow-md animate-scale-in">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Card Meta Content */}
              <div className="p-5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-serif text-lg font-semibold text-neutral-800 group-hover:text-rose-600 transition-colors">
                    {template.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: secondaryColor }}
                    />
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-neutral-500 line-clamp-2 leading-relaxed">
                  {template.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 text-neutral-500 text-sm">
          No templates found for this occasion yet.
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-warm-200">
        <Button variant="outline" size="md" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          <span>Change Occasion</span>
        </Button>

        <Button
          size="lg"
          disabled={!selectedTemplate}
          onClick={onContinue}
        >
          <span>Continue to Details</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
