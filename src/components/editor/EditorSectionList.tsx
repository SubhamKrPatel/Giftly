import {
  FileText,
  Sparkles,
  MessageSquareHeart,
  Image as ImageIcon,
  Music,
  Gift,
  Lock,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Palette,
  Video,
  Mic,
} from 'lucide-react'
import type { GiftSection } from '@/lib/database.types'
import { cn } from '@/lib/utils'

interface EditorSectionListProps {
  sections: GiftSection[]
  activeSection: string
  onSectionSelect: (id: string) => void
  onReorder?: (sectionId: string, direction: 'up' | 'down') => void
  onToggleVisibility?: (sectionId: string) => void
}

const SECTION_METADATA: Record<
  string,
  {
    title: string
    subtitle: string
    icon: typeof Sparkles
    available: boolean
    badge?: string
  }
> = {
  cover: {
    title: 'Cover Page',
    subtitle: 'Opening greeting & title',
    icon: Sparkles,
    available: true,
  },
  message: {
    title: 'Personal Message',
    subtitle: 'Heartfelt note & letter',
    icon: MessageSquareHeart,
    available: true,
  },
  gallery: {
    title: 'Photo Memories',
    subtitle: 'Moments, captions & gallery',
    icon: ImageIcon,
    available: true,
  },
  final_message: {
    title: 'Final Message',
    subtitle: 'Closing words & signature',
    icon: Gift,
    available: true,
  },
  music: {
    title: 'Background Music',
    subtitle: 'Atmospheric audio tracks',
    icon: Music,
    available: false,
    badge: 'Coming soon',
  },
  video: {
    title: 'Video Message',
    subtitle: 'Personal recorded clip',
    icon: Video,
    available: false,
    badge: 'Coming soon',
  },
  voice: {
    title: 'Voice Note',
    subtitle: 'Recorded audio note',
    icon: Mic,
    available: false,
    badge: 'Coming soon',
  },
}

export default function EditorSectionList({
  sections,
  activeSection,
  onSectionSelect,
  onReorder,
  onToggleVisibility,
}: EditorSectionListProps) {
  // Sort sections by position
  const sortedSections = [...sections].sort((a, b) => a.position - b.position)

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-warm-200 shadow-sm space-y-4">
      {/* General Settings Tabs */}
      <div>
        <div className="px-3 py-1 mb-2">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Gift Settings
          </h2>
        </div>
        <div className="space-y-1.5">
          {/* Details tab */}
          <button
            type="button"
            onClick={() => onSectionSelect('details')}
            className={cn(
              'w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-all duration-200',
              activeSection === 'details'
                ? 'bg-rose-50 border border-rose-200 text-neutral-900 shadow-sm ring-1 ring-rose-200'
                : 'hover:bg-warm-100 text-neutral-700'
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
                activeSection === 'details'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-warm-200 text-neutral-600'
              )}
            >
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span
                className={cn(
                  'text-xs sm:text-sm font-semibold truncate block',
                  activeSection === 'details' ? 'text-rose-700' : 'text-neutral-800'
                )}
              >
                Basic Information
              </span>
              <p className="text-[11px] text-neutral-400 truncate">Title, recipient & sender</p>
            </div>
          </button>

          {/* Theme tab */}
          <button
            type="button"
            onClick={() => onSectionSelect('theme')}
            className={cn(
              'w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-all duration-200',
              activeSection === 'theme'
                ? 'bg-rose-50 border border-rose-200 text-neutral-900 shadow-sm ring-1 ring-rose-200'
                : 'hover:bg-warm-100 text-neutral-700'
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
                activeSection === 'theme'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-warm-200 text-neutral-600'
              )}
            >
              <Palette className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span
                className={cn(
                  'text-xs sm:text-sm font-semibold truncate block',
                  activeSection === 'theme' ? 'text-rose-700' : 'text-neutral-800'
                )}
              >
                Color Palette & Theme
              </span>
              <p className="text-[11px] text-neutral-400 truncate">Preset styles & colors</p>
            </div>
          </button>
        </div>
      </div>

      <div className="h-px bg-warm-200" />

      {/* Gift Sections List */}
      <div>
        <div className="px-3 py-1 mb-2 flex items-center justify-between">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Gift Sections
          </h2>
          <span className="text-[10px] text-neutral-400">Reorder with ↑ / ↓</span>
        </div>

        <nav className="space-y-1.5" aria-label="Gift Sections">
          {sortedSections.map((section, index) => {
            const meta = SECTION_METADATA[section.section_type] || {
              title: section.section_type,
              subtitle: 'Gift section',
              icon: Sparkles,
              available: true,
            }
            const Icon = meta.icon
            const isActive = activeSection === section.section_type
            const isAvailable = meta.available
            const isFirst = index === 0
            const isLast = index === sortedSections.length - 1

            return (
              <div
                key={section.id}
                className={cn(
                  'group flex items-center justify-between gap-1 p-2 rounded-2xl transition-all duration-200',
                  isActive
                    ? 'bg-rose-50 border border-rose-200 text-neutral-900 shadow-sm ring-1 ring-rose-200'
                    : isAvailable
                    ? 'hover:bg-warm-100 text-neutral-700'
                    : 'opacity-60 bg-warm-50/50'
                )}
              >
                {/* Select Section Click target */}
                <button
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => isAvailable && onSectionSelect(section.section_type)}
                  className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer disabled:cursor-not-allowed"
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
                      isActive
                        ? 'bg-rose-500 text-white shadow-sm'
                        : isAvailable
                        ? 'bg-warm-200 text-neutral-600'
                        : 'bg-warm-100 text-neutral-400'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'text-xs sm:text-sm font-semibold truncate',
                          isActive ? 'text-rose-700' : 'text-neutral-800'
                        )}
                      >
                        {meta.title}
                      </span>
                      {!isAvailable && (
                        <span className="flex items-center gap-1 text-[9px] font-medium text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded-full">
                          <Lock className="w-2.5 h-2.5" />
                          <span>{meta.badge}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate">{meta.subtitle}</p>
                  </div>
                </button>

                {/* Section Action Controls (Visibility + Reorder) */}
                {isAvailable && (
                  <div className="flex items-center gap-0.5 flex-shrink-0 pl-1">
                    {/* Visibility Toggle */}
                    {onToggleVisibility && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleVisibility(section.id)
                        }}
                        className={cn(
                          'p-1.5 rounded-lg transition-colors',
                          section.is_visible
                            ? 'text-neutral-400 hover:text-neutral-700 hover:bg-white/80'
                            : 'text-rose-400 hover:text-rose-600 bg-rose-100/50'
                        )}
                        title={section.is_visible ? 'Visible in gift' : 'Hidden from gift'}
                        aria-label={section.is_visible ? 'Hide section' : 'Show section'}
                      >
                        {section.is_visible ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                    {/* Move Up */}
                    {onReorder && (
                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={(e) => {
                          e.stopPropagation()
                          onReorder(section.id, 'up')
                        }}
                        className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-white/80 transition-colors disabled:opacity-20 disabled:hover:bg-transparent"
                        title="Move up"
                        aria-label="Move section up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Move Down */}
                    {onReorder && (
                      <button
                        type="button"
                        disabled={isLast}
                        onClick={(e) => {
                          e.stopPropagation()
                          onReorder(section.id, 'down')
                        }}
                        className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-white/80 transition-colors disabled:opacity-20 disabled:hover:bg-transparent"
                        title="Move down"
                        aria-label="Move section down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
