import { Check, Palette } from 'lucide-react'
import type { GiftThemeConfig } from '@/lib/database.types'
import { THEME_PRESETS, type ThemePreset } from '@/config/themes'
import { cn } from '@/lib/utils'

interface ThemePickerProps {
  currentTheme: GiftThemeConfig
  onSelectTheme: (theme: ThemePreset) => void
}

export default function ThemePicker({ currentTheme, onSelectTheme }: ThemePickerProps) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
          <Palette className="w-4 h-4 text-rose-500" />
          <span>Visual Theme Customization</span>
        </div>
        <h2 className="font-serif text-2xl font-semibold text-neutral-800">
          Gift Color Palette
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Choose a curated color palette for your gift. This changes background gradients, text accents, and card styling in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="radiogroup" aria-label="Theme choices">
        {THEME_PRESETS.map((preset) => {
          const isSelected =
            currentTheme?.primaryColor === preset.primaryColor &&
            currentTheme?.secondaryColor === preset.secondaryColor

          return (
            <div
              key={preset.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onSelectTheme(preset)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault()
                  onSelectTheme(preset)
                }
              }}
              className={cn(
                'group relative text-left p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer bg-white select-none',
                isSelected
                  ? 'border-rose-500 shadow-glow ring-2 ring-rose-200'
                  : 'border-warm-200 hover:border-rose-300 hover:shadow-card'
              )}
            >
              {/* Selected Check badge */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-sm animate-scale-in">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              {/* Swatch Header Preview */}
              <div
                className="h-16 rounded-xl p-3 mb-3 relative overflow-hidden flex items-end justify-between shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${preset.primaryColor} 0%, ${preset.secondaryColor} 100%)`,
                }}
              >
                <div className="flex items-center gap-1.5 bg-white/85 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] font-semibold text-neutral-800">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: preset.accentColor || preset.primaryColor }}
                  />
                  <span>{preset.tag || preset.name}</span>
                </div>
              </div>

              {/* Theme Name & Swatches */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-base font-semibold text-neutral-800 group-hover:text-rose-600 transition-colors">
                    {preset.name}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {preset.backgroundColor === '#0f172a' ? 'Dark mode' : 'Light mode'}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <div
                    className="w-4 h-4 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: preset.primaryColor }}
                    title="Primary"
                  />
                  <div
                    className="w-4 h-4 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: preset.secondaryColor }}
                    title="Secondary"
                  />
                  <div
                    className="w-4 h-4 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: preset.accentColor || preset.primaryColor }}
                    title="Accent"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
