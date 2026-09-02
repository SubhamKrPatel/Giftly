import type { GiftThemeConfig } from '@/lib/database.types'
import type { RecipientPageType } from '@/lib/recipientPages'
import type { OccasionVisualTheme } from '@/lib/occasionThemes'
import FloatingParticles from './FloatingParticles'

interface RecipientBackgroundProps {
  occasionTheme: OccasionVisualTheme
  theme: GiftThemeConfig
  pageType: RecipientPageType
  isCompact?: boolean
}

export default function RecipientBackground({
  occasionTheme,
  theme,
  pageType,
  isCompact = false,
}: RecipientBackgroundProps) {
  const primaryColor = theme.primaryColor || occasionTheme.ambientGlows.primary || '#f43f5e'
  const secondaryColor = theme.secondaryColor || occasionTheme.ambientGlows.secondary || '#fda4af'
  const accentColor = theme.accentColor || occasionTheme.ambientGlows.accent || '#e11d48'

  const intensity = occasionTheme.pageIntensity[pageType] || 'subtle'

  // Opacity for glows based on intensity
  const glowOpacity =
    intensity === 'minimal'
      ? 'opacity-15'
      : intensity === 'subtle'
      ? 'opacity-25'
      : intensity === 'medium'
      ? 'opacity-35'
      : 'opacity-45'

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 transition-opacity duration-700"
    >
      {/* ── 1. Ambient Corner Radial Glows ── */}
      <div
        className={`absolute -top-32 -left-32 ${
          isCompact ? 'w-48 h-48 blur-2xl' : 'w-80 sm:w-96 h-80 sm:h-96 blur-3xl'
        } rounded-full transition-all duration-1000 ${glowOpacity}`}
        style={{ backgroundColor: secondaryColor }}
      />

      <div
        className={`absolute -bottom-32 -right-32 ${
          isCompact ? 'w-48 h-48 blur-2xl' : 'w-80 sm:w-96 h-80 sm:h-96 blur-3xl'
        } rounded-full transition-all duration-1000 ${glowOpacity}`}
        style={{ backgroundColor: primaryColor }}
      />

      {/* Mid glow for strong intensity moments */}
      {(intensity === 'strong' || intensity === 'medium') && (
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
            isCompact ? 'w-40 h-40 blur-2xl' : 'w-72 sm:w-80 h-72 sm:h-80 blur-3xl'
          } rounded-full opacity-15 transition-all duration-1000`}
          style={{ backgroundColor: accentColor }}
        />
      )}

      {/* ── 2. Subtle Watermark Corner Motif ── */}
      {occasionTheme.motifs.cornerIcon && (
        <div
          className={`absolute -bottom-6 -left-6 ${
            isCompact ? 'text-4xl' : 'text-6xl sm:text-7xl'
          } select-none opacity-10 blur-[1px] transition-transform duration-700 rotate-12`}
        >
          {occasionTheme.motifs.cornerIcon}
        </div>
      )}

      {/* ── 3. Occasion-Specific Ambient Particles ── */}
      <FloatingParticles
        particleType={occasionTheme.particles.type}
        intensity={intensity}
        palette={occasionTheme.particles.palette}
        isCompact={isCompact}
      />
    </div>
  )
}
