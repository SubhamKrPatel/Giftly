import type { GiftThemeConfig } from '@/lib/database.types'

export interface ThemePreset extends GiftThemeConfig {
  id: string
  name: string
  tag?: string
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'rose',
    name: 'Rose',
    primaryColor: '#f43f5e',
    secondaryColor: '#fda4af',
    accentColor: '#e11d48',
    backgroundColor: '#fff1f2',
    textColor: '#1f2937',
    tag: 'Classic Romance',
  },
  {
    id: 'romantic',
    name: 'Romantic',
    primaryColor: '#be123c',
    secondaryColor: '#fb7185',
    accentColor: '#9f1239',
    backgroundColor: '#fdf2f4',
    textColor: '#1f2937',
    tag: 'Deep Love',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    primaryColor: '#ea580c',
    secondaryColor: '#fbbf24',
    accentColor: '#f97316',
    backgroundColor: '#fffbeb',
    textColor: '#1f2937',
    tag: 'Warm & Joyful',
  },
  {
    id: 'lavender',
    name: 'Lavender',
    primaryColor: '#7c3aed',
    secondaryColor: '#c084fc',
    accentColor: '#6d28d9',
    backgroundColor: '#faf5ff',
    textColor: '#1f2937',
    tag: 'Whimsical Dream',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    primaryColor: '#6366f1',
    secondaryColor: '#ec4899',
    accentColor: '#818cf8',
    backgroundColor: '#0f172a',
    textColor: '#f8fafc',
    tag: 'Sleek Dark',
  },
  {
    id: 'elegant',
    name: 'Elegant',
    primaryColor: '#0d9488',
    secondaryColor: '#34d399',
    accentColor: '#115e59',
    backgroundColor: '#f0fdfa',
    textColor: '#1f2937',
    tag: 'Botanical Gold',
  },
]

export const DEFAULT_THEME = THEME_PRESETS[0]
