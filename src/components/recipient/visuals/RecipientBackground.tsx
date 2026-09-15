import type { GiftThemeConfig, SlideBackgroundConfig } from '@/lib/database.types'
import type { RecipientPageType } from '@/lib/recipientPages'
import type { OccasionVisualTheme } from '@/lib/occasionThemes'
import { resolveSlideBackground } from '@/lib/slideBackground'
import FloatingParticles from './FloatingParticles'

interface RecipientBackgroundProps {
  occasionTheme: OccasionVisualTheme
  theme: GiftThemeConfig
  pageType: RecipientPageType
  background?: SlideBackgroundConfig
  isCompact?: boolean
}

export default function RecipientBackground({
  occasionTheme,
  theme,
  pageType,
  background,
  isCompact = false,
}: RecipientBackgroundProps) {
  const primaryColor = theme.primaryColor || occasionTheme.ambientGlows.primary || '#f43f5e'
  const secondaryColor = theme.secondaryColor || occasionTheme.ambientGlows.secondary || '#fda4af'
  const accentColor = theme.accentColor || occasionTheme.ambientGlows.accent || '#e11d48'

  const intensity = occasionTheme.pageIntensity[pageType] || 'subtle'

  // Resolve custom slide background (if any)
  const resolvedBg = resolveSlideBackground(background, occasionTheme.slug, theme)

  // Opacity for ambient radial glows based on intensity
  const glowOpacity =
    intensity === 'minimal'
      ? 'opacity-15'
      : intensity === 'subtle'
      ? 'opacity-25'
      : intensity === 'medium'
      ? 'opacity-35'
      : 'opacity-45'

  // Map photo focus position
  const positionClass =
    resolvedBg.position === 'top'
      ? 'object-top'
      : resolvedBg.position === 'bottom'
      ? 'object-bottom'
      : 'object-center'

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 transition-all duration-700"
    >
      {/* ── Custom Background Modes ── */}
      {/* 1. Photo Backdrop */}
      {resolvedBg.mode === 'photo' && resolvedBg.photoUrl && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={resolvedBg.photoUrl}
            alt=""
            aria-hidden="true"
            className={`w-full h-full object-cover filter blur-[1px] scale-105 transition-all duration-700 ${positionClass}`}
          />
          {/* Adaptive Readability Overlay */}
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              backgroundColor: `rgba(255, 255, 255, ${Math.max(0.4, resolvedBg.overlayOpacity)})`,
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
            }}
          />
        </div>
      )}

      {/* 2. Gradient Mood Backdrop */}
      {resolvedBg.mode === 'gradient' && (
        <div
          className="absolute inset-0 z-0 transition-all duration-700"
          style={resolvedBg.containerStyle}
        />
      )}

      {/* 3. Solid Color Backdrop */}
      {resolvedBg.mode === 'solid' && (
        <div
          className="absolute inset-0 z-0 transition-colors duration-700"
          style={resolvedBg.containerStyle}
        />
      )}

      {/* 4. Automatic / Default: Ambient Corner Radial Glows */}
      {resolvedBg.mode === 'automatic' && (
        <>
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
        </>
      )}

      {/* ── Subtle Watermark Corner Motif ── */}
      {occasionTheme.motifs.cornerIcon && (
        <div
          className={`absolute -bottom-6 -left-6 ${
            isCompact ? 'text-4xl' : 'text-6xl sm:text-7xl'
          } select-none opacity-10 blur-[1px] transition-transform duration-700 rotate-12`}
        >
          {occasionTheme.motifs.cornerIcon}
        </div>
      )}

      {/* ── Occasion-Specific Ambient Particles ── */}
      <FloatingParticles
        particleType={occasionTheme.particles.type}
        intensity={resolvedBg.mode === 'photo' ? 'minimal' : intensity}
        palette={occasionTheme.particles.palette}
        isCompact={isCompact}
      />
    </div>
  )
}
