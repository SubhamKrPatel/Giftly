import type { CSSProperties } from 'react'
import type {
  SlideBackgroundConfig,
  SlideGradientMood,
  SlideSolidColor,
  SlidePhotoPosition,
  GiftThemeConfig,
} from './database.types'
import { getOccasionVisualTheme } from './occasionThemes'

export interface GradientMoodOption {
  id: SlideGradientMood
  label: string
  description: string
  gradientCss: string
}

export interface SolidColorOption {
  id: SlideSolidColor
  label: string
  hex: string
  textColor: string
  borderHex: string
}

/**
 * Curated gradient mood palettes mapped to occasion themes
 */
export function getCuratedGradientMoods(
  occasionSlug?: string | null,
  theme?: GiftThemeConfig
): GradientMoodOption[] {
  const occasion = getOccasionVisualTheme(occasionSlug)
  const primary = theme?.primaryColor || occasion.ambientGlows.primary || '#f43f5e'
  const secondary = theme?.secondaryColor || occasion.ambientGlows.secondary || '#fda4af'
  const accent = theme?.accentColor || occasion.ambientGlows.accent || '#e11d48'

  return [
    {
      id: 'automatic',
      label: 'Occasion Flow',
      description: 'Luminous blend inspired by this celebration',
      gradientCss: `linear-gradient(145deg, ${secondary}33 0%, ${primary}1f 50%, ${accent}2e 100%)`,
    },
    {
      id: 'soft',
      label: 'Soft Pastel',
      description: 'Delicate, airy and gentle glow',
      gradientCss: 'linear-gradient(135deg, #ffffff 0%, #fff1f2 50%, #fdf2f8 100%)',
    },
    {
      id: 'warm',
      label: 'Golden Sunset',
      description: 'Cozy, warm and radiant ambient tones',
      gradientCss: 'linear-gradient(140deg, #fffbeb 0%, #fef3c7 40%, #fed7aa 100%)',
    },
    {
      id: 'elegant',
      label: 'Timeless Velvet',
      description: 'Rich, luxurious and deep emotional atmosphere',
      gradientCss: 'linear-gradient(150deg, #1e1b4b 0%, #311042 50%, #0f172a 100%)',
    },
    {
      id: 'dreamy',
      label: 'Dreamy Aurora',
      description: 'Whimsical blend of stardust and ethereal light',
      gradientCss: 'linear-gradient(135deg, #ede9fe 0%, #fae8ff 50%, #e0e7ff 100%)',
    },
  ]
}

/**
 * Curated solid color options with guaranteed readability contrast
 */
export const CURATED_SOLID_COLORS: SolidColorOption[] = [
  {
    id: 'ivory',
    label: 'Soft Ivory',
    hex: '#fcfaf7',
    textColor: '#292524',
    borderHex: '#e7e5e4',
  },
  {
    id: 'cream',
    label: 'Warm Cream',
    hex: '#fdf6e9',
    textColor: '#451a03',
    borderHex: '#fed7aa',
  },
  {
    id: 'rose',
    label: 'Gentle Rose',
    hex: '#fff1f2',
    textColor: '#881337',
    borderHex: '#fecdd3',
  },
  {
    id: 'golden',
    label: 'Golden Glow',
    hex: '#fefce8',
    textColor: '#713f12',
    borderHex: '#fde047',
  },
  {
    id: 'midnight',
    label: 'Midnight Slate',
    hex: '#0f172a',
    textColor: '#f8fafc',
    borderHex: '#334155',
  },
  {
    id: 'plum',
    label: 'Deep Plum',
    hex: '#2e1065',
    textColor: '#f3e8ff',
    borderHex: '#581c87',
  },
]

export interface ResolvedSlideBackground {
  mode: SlideBackgroundConfig['mode']
  containerStyle: CSSProperties
  overlayStyle: CSSProperties
  isDark: boolean
  photoUrl?: string
  position: SlidePhotoPosition
  overlayOpacity: number
}

/**
 * Resolves slide background configuration to CSS properties and display parameters.
 */
export function resolveSlideBackground(
  bg?: SlideBackgroundConfig | null,
  occasionSlug?: string | null,
  theme?: GiftThemeConfig,
  defaultPhotoUrl?: string
): ResolvedSlideBackground {
  const mode = bg?.mode || 'automatic'
  const position: SlidePhotoPosition = bg?.position || 'center'
  const rawOverlay = typeof bg?.overlay === 'number' ? bg.overlay : 50
  const overlayOpacity = Math.min(100, Math.max(0, rawOverlay)) / 100

  // 1. Photo Background
  if (mode === 'photo') {
    const photoUrl = bg?.mediaUrl || defaultPhotoUrl
    return {
      mode: 'photo',
      photoUrl,
      position,
      overlayOpacity,
      isDark: overlayOpacity > 0.45,
      containerStyle: {
        position: 'relative',
      },
      overlayStyle: {
        backgroundColor: `rgba(255, 255, 255, ${Math.max(0.6, overlayOpacity)})`,
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
      },
    }
  }

  // 2. Gradient Background
  if (mode === 'gradient') {
    const moods = getCuratedGradientMoods(occasionSlug, theme)
    const mood = moods.find((m) => m.id === bg?.gradientMood) || moods[0]
    const isDark = mood.id === 'elegant'

    return {
      mode: 'gradient',
      position,
      overlayOpacity,
      isDark,
      containerStyle: {
        background: mood.gradientCss,
      },
      overlayStyle: {},
    }
  }

  // 3. Solid Background
  if (mode === 'solid') {
    const color = CURATED_SOLID_COLORS.find((c) => c.id === bg?.solidColor) || CURATED_SOLID_COLORS[0]
    const isDark = color.id === 'midnight' || color.id === 'plum'

    return {
      mode: 'solid',
      position,
      overlayOpacity,
      isDark,
      containerStyle: {
        backgroundColor: color.hex,
        color: color.textColor,
      },
      overlayStyle: {},
    }
  }

  // 4. Default: Automatic (Occasion Visuals)
  return {
    mode: 'automatic',
    position,
    overlayOpacity: 0.5,
    isDark: false,
    containerStyle: {},
    overlayStyle: {},
  }
}
