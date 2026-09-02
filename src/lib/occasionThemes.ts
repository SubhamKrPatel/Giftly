import type { RecipientPageType } from '@/lib/recipientPages'

export type OccasionSlug =
  | 'birthday'
  | 'valentines'
  | 'anniversary'
  | 'friendship'
  | 'wedding'
  | 'festival'
  | 'raksha-bandhan'
  | 'diwali'
  | 'eid'
  | 'generic'
  | string

export type VisualIntensity = 'minimal' | 'subtle' | 'medium' | 'strong'

export type ParticleType =
  | 'confetti'
  | 'hearts'
  | 'gold-dust'
  | 'stars'
  | 'petals'
  | 'sparkles'
  | 'lights'
  | 'none'

export interface OccasionVisualTheme {
  slug: string
  name: string
  personality: string
  ambientGlows: {
    primary: string
    secondary: string
    accent?: string
    blendMode?: string
  }
  particles: {
    type: ParticleType
    palette: string[]
  }
  motifs: {
    cornerIcon?: string
    badgeIcon?: string
  }
  pageIntensity: Record<RecipientPageType, VisualIntensity>
}

// Default page-specific intensity hierarchy: Content > Decoration
const DEFAULT_PAGE_INTENSITY: Record<RecipientPageType, VisualIntensity> = {
  opening: 'strong',
  message: 'subtle',
  story: 'subtle',
  photos: 'subtle',
  video: 'minimal',
  voice: 'minimal',
  closing: 'strong',
}

export const OCCASION_VISUAL_THEMES: Record<string, OccasionVisualTheme> = {
  // ── 1. Birthday: Joyful, Celebratory, Colorful, Warm ──
  birthday: {
    slug: 'birthday',
    name: 'Birthday',
    personality: 'Joyful, Celebratory & Warm',
    ambientGlows: {
      primary: '#f59e0b', // warm amber
      secondary: '#f43f5e', // celebratory rose
      accent: '#ec4899', // pink highlight
    },
    particles: {
      type: 'confetti',
      palette: ['#f59e0b', '#f43f5e', '#ec4899', '#3b82f6', '#10b981', '#fbbf24'],
    },
    motifs: {
      cornerIcon: '🎂',
      badgeIcon: '✨',
    },
    pageIntensity: {
      ...DEFAULT_PAGE_INTENSITY,
      opening: 'strong',
      message: 'subtle',
      story: 'subtle',
      photos: 'subtle',
      video: 'minimal',
      voice: 'minimal',
      closing: 'strong',
    },
  },

  // ── 2. Valentine's: Romantic, Warm, Intimate, Elegant ──
  valentines: {
    slug: 'valentines',
    name: "Valentine's",
    personality: 'Romantic, Intimate & Elegant',
    ambientGlows: {
      primary: '#f43f5e', // rose
      secondary: '#fda4af', // soft petal pink
      accent: '#be123c', // deep wine
    },
    particles: {
      type: 'hearts',
      palette: ['#f43f5e', '#fda4af', '#e11d48', '#fb7185', '#be123c'],
    },
    motifs: {
      cornerIcon: '🌹',
      badgeIcon: '❤️',
    },
    pageIntensity: {
      ...DEFAULT_PAGE_INTENSITY,
      opening: 'medium',
      message: 'subtle',
      story: 'subtle',
      photos: 'subtle',
      video: 'minimal',
      voice: 'minimal',
      closing: 'strong',
    },
  },

  // ── 3. Anniversary: Elegant, Mature, Timeless, Emotional ──
  anniversary: {
    slug: 'anniversary',
    name: 'Anniversary',
    personality: 'Elegant, Timeless & Gold',
    ambientGlows: {
      primary: '#d97706', // warm champagne gold
      secondary: '#fef3c7', // luminous champagne
      accent: '#92400e', // rich bronze
    },
    particles: {
      type: 'gold-dust',
      palette: ['#d97706', '#f59e0b', '#fbbf24', '#fef08a', '#eab308'],
    },
    motifs: {
      cornerIcon: '🥂',
      badgeIcon: '✨',
    },
    pageIntensity: {
      ...DEFAULT_PAGE_INTENSITY,
      opening: 'strong',
      message: 'subtle',
      story: 'subtle',
      photos: 'subtle',
      video: 'minimal',
      voice: 'minimal',
      closing: 'strong',
    },
  },

  // ── 4. Friendship: Playful, Colorful, Energetic, Fun ──
  friendship: {
    slug: 'friendship',
    name: 'Friendship',
    personality: 'Playful, Energetic & Bright',
    ambientGlows: {
      primary: '#0ea5e9', // vivid sky
      secondary: '#f59e0b', // sunshine amber
      accent: '#8b5cf6', // electric purple
    },
    particles: {
      type: 'stars',
      palette: ['#0ea5e9', '#38bdf8', '#f59e0b', '#fbbf24', '#a855f7', '#ec4899'],
    },
    motifs: {
      cornerIcon: '☀️',
      badgeIcon: '🤝',
    },
    pageIntensity: {
      ...DEFAULT_PAGE_INTENSITY,
      opening: 'strong',
      message: 'subtle',
      story: 'subtle',
      photos: 'subtle',
      video: 'minimal',
      voice: 'minimal',
      closing: 'strong',
    },
  },

  // ── 5. Wedding: Elegant, Traditional, Celebratory, Premium ──
  wedding: {
    slug: 'wedding',
    name: 'Wedding',
    personality: 'Graceful, Botanical Gold & Premium',
    ambientGlows: {
      primary: '#0d9488', // soft botanical teal
      secondary: '#fde68a', // delicate gold
      accent: '#115e59', // deep emerald
    },
    particles: {
      type: 'petals',
      palette: ['#fde68a', '#fef3c7', '#a7f3d0', '#6ee7b7', '#fbcfe8'],
    },
    motifs: {
      cornerIcon: '💍',
      badgeIcon: '🕊️',
    },
    pageIntensity: {
      ...DEFAULT_PAGE_INTENSITY,
      opening: 'strong',
      message: 'subtle',
      story: 'subtle',
      photos: 'subtle',
      video: 'minimal',
      voice: 'minimal',
      closing: 'strong',
    },
  },

  // ── 6. Festival: Festive, Warm, Bright, Cultural ──
  festival: {
    slug: 'festival',
    name: 'Festival',
    personality: 'Warm Radiance & Festive Lights',
    ambientGlows: {
      primary: '#ea580c', // warm saffron
      secondary: '#f59e0b', // glowing amber
      accent: '#b45309', // deep golden glow
    },
    particles: {
      type: 'lights',
      palette: ['#ea580c', '#f59e0b', '#fbbf24', '#fde047', '#f97316'],
    },
    motifs: {
      cornerIcon: '🪔',
      badgeIcon: '✨',
    },
    pageIntensity: {
      ...DEFAULT_PAGE_INTENSITY,
      opening: 'strong',
      message: 'subtle',
      story: 'subtle',
      photos: 'subtle',
      video: 'minimal',
      voice: 'minimal',
      closing: 'strong',
    },
  },

  // ── 7. Raksha Bandhan (Future-Ready Configuration) ──
  'raksha-bandhan': {
    slug: 'raksha-bandhan',
    name: 'Raksha Bandhan',
    personality: 'Warm, Saffron & Traditional',
    ambientGlows: {
      primary: '#dc2626', // traditional crimson
      secondary: '#f59e0b', // saffron gold
      accent: '#b91c1c',
    },
    particles: {
      type: 'sparkles',
      palette: ['#dc2626', '#f59e0b', '#fbbf24', '#fde047'],
    },
    motifs: {
      cornerIcon: '🧵',
      badgeIcon: '✨',
    },
    pageIntensity: DEFAULT_PAGE_INTENSITY,
  },

  // ── 8. Diwali (Future-Ready Configuration) ──
  diwali: {
    slug: 'diwali',
    name: 'Diwali',
    personality: 'Luminous Diya Glow & Festive Lights',
    ambientGlows: {
      primary: '#ea580c', // festive flame
      secondary: '#fbbf24', // luminous gold
      accent: '#c2410c',
    },
    particles: {
      type: 'lights',
      palette: ['#ea580c', '#f59e0b', '#fbbf24', '#fde047', '#ffedd5'],
    },
    motifs: {
      cornerIcon: '🪔',
      badgeIcon: '✨',
    },
    pageIntensity: DEFAULT_PAGE_INTENSITY,
  },

  // ── 9. Eid (Future-Ready Configuration) ──
  eid: {
    slug: 'eid',
    name: 'Eid',
    personality: 'Calm, Starry Midnight & Emerald Glow',
    ambientGlows: {
      primary: '#059669', // emerald
      secondary: '#6366f1', // night indigo
      accent: '#047857',
    },
    particles: {
      type: 'stars',
      palette: ['#34d399', '#6ee7b7', '#a5b4fc', '#fef08a'],
    },
    motifs: {
      cornerIcon: '🌙',
      badgeIcon: '✨',
    },
    pageIntensity: DEFAULT_PAGE_INTENSITY,
  },

  // ── 10. Fallback / Generic Neutral Theme ──
  generic: {
    slug: 'generic',
    name: 'Special Surprise',
    personality: 'Warm & Celebratory',
    ambientGlows: {
      primary: '#f43f5e',
      secondary: '#fda4af',
      accent: '#e11d48',
    },
    particles: {
      type: 'sparkles',
      palette: ['#f43f5e', '#fda4af', '#fbbf24', '#f472b6'],
    },
    motifs: {
      cornerIcon: '🎁',
      badgeIcon: '✨',
    },
    pageIntensity: DEFAULT_PAGE_INTENSITY,
  },
}

/**
 * Resolves an occasion slug or name to its OccasionVisualTheme configuration.
 * Always returns a valid theme object with fallback to generic.
 */
export function getOccasionVisualTheme(slugOrName?: string | null): OccasionVisualTheme {
  if (!slugOrName) {
    return OCCASION_VISUAL_THEMES.generic
  }

  const normalized = slugOrName.toLowerCase().trim()

  // Match exact slug
  if (OCCASION_VISUAL_THEMES[normalized]) {
    return OCCASION_VISUAL_THEMES[normalized]
  }

  // Substring / fuzzy match
  if (normalized.includes('birth') || normalized.includes('bday')) {
    return OCCASION_VISUAL_THEMES.birthday
  }
  if (normalized.includes('valentin') || normalized.includes('love') || normalized.includes('romantic')) {
    return OCCASION_VISUAL_THEMES.valentines
  }
  if (normalized.includes('annivers') || normalized.includes('milestone')) {
    return OCCASION_VISUAL_THEMES.anniversary
  }
  if (normalized.includes('friend') || normalized.includes('bestie')) {
    return OCCASION_VISUAL_THEMES.friendship
  }
  if (normalized.includes('wed') || normalized.includes('marriage') || normalized.includes('shaadi')) {
    return OCCASION_VISUAL_THEMES.wedding
  }
  if (normalized.includes('festiv') || normalized.includes('celebrat')) {
    return OCCASION_VISUAL_THEMES.festival
  }
  if (normalized.includes('raksha') || normalized.includes('rakhi')) {
    return OCCASION_VISUAL_THEMES['raksha-bandhan']
  }
  if (normalized.includes('diwali') || normalized.includes('deepavali')) {
    return OCCASION_VISUAL_THEMES.diwali
  }
  if (normalized.includes('eid')) {
    return OCCASION_VISUAL_THEMES.eid
  }

  return OCCASION_VISUAL_THEMES.generic
}
