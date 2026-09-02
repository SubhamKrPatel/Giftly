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
  Circle,
  Palette,
  Video,
  Mic,
  BookOpen,
} from 'lucide-react'
import type { GiftSection, GiftMediaItem } from '@/lib/database.types'
import { cn } from '@/lib/utils'

interface EditorSectionListProps {
  sections: GiftSection[]
  activeSection: string
  onSectionSelect: (id: string) => void
  onReorder?: (sectionId: string, direction: 'up' | 'down') => void
  onToggleVisibility?: (sectionId: string) => void
  mediaItems?: GiftMediaItem[]
  videoItems?: GiftMediaItem[]
  voiceItem?: GiftMediaItem | null
  musicItem?: GiftMediaItem | null
}

interface SectionMeta {
  title: string
  icon: typeof Sparkles
  required: boolean
}

const SECTION_METADATA: Record<string, SectionMeta> = {
  cover: {
    title: 'Opening',
    icon: Sparkles,
    required: true,
  },
  message: {
    title: 'Message',
    icon: MessageSquareHeart,
    required: true,
  },
  story: {
    title: 'Story',
    icon: BookOpen,
    required: false,
  },
  gallery: {
    title: 'Photos',
    icon: ImageIcon,
    required: false,
  },
  video: {
    title: 'Video / Voice',
    icon: Video,
    required: false,
  },
  voice: {
    title: 'Voice Note',
    icon: Mic,
    required: false,
  },
  music: {
    title: 'Background Music',
    icon: Music,
    required: false,
  },
  final_message: {
    title: 'Final Wish',
    icon: Gift,
    required: true,
  },
}

export default function EditorSectionList({
  sections,
  activeSection,
  onSectionSelect,
  onReorder,
  onToggleVisibility,
  mediaItems = [],
  videoItems = [],
  voiceItem = null,
  musicItem = null,
}: EditorSectionListProps) {
  // Sort sections by position
  const sortedSections = [...sections].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

  // Calculate real content summary for each section
  const getContentSummary = (section: GiftSection): { label: string; hasContent: boolean } => {
    switch (section.section_type) {
      case 'cover':
      case 'message':
      case 'final_message':
        return { label: 'Always included', hasContent: true }

      case 'gallery': {
        const count = mediaItems.length
        return {
          label: count > 0 ? `${count} ${count === 1 ? 'photo' : 'photos'}` : 'No photos',
          hasContent: count > 0,
        }
      }

      case 'video': {
        const vCount = videoItems.length
        const hasV = Boolean(voiceItem && voiceItem.signedUrl)
        if (vCount > 0 && hasV) {
          return { label: `${vCount} ${vCount === 1 ? 'video' : 'videos'} + voice`, hasContent: true }
        }
        if (vCount > 0) {
          return { label: `${vCount} ${vCount === 1 ? 'video' : 'videos'}`, hasContent: true }
        }
        if (hasV) {
          return { label: '1 voice note', hasContent: true }
        }
        return { label: 'No media', hasContent: false }
      }

      case 'voice': {
        const hasV = Boolean(voiceItem && voiceItem.signedUrl)
        return {
          label: hasV ? '1 voice note' : 'No voice note',
          hasContent: hasV,
        }
      }

      case 'music': {
        const hasM = Boolean(musicItem && musicItem.signedUrl)
        return {
          label: hasM ? '1 track' : 'No music',
          hasContent: hasM,
        }
      }

      case 'story': {
        const content = (section.content as Record<string, unknown>) || {}
        const items = (content.items as unknown[]) || []
        const body = typeof content.body === 'string' ? content.body.trim() : ''
        const count = items.length
        if (count > 0) {
          return { label: `${count} ${count === 1 ? 'chapter' : 'chapters'}`, hasContent: true }
        }
        if (body.length > 0) {
          return { label: 'Story written', hasContent: true }
        }
        return { label: 'No story added', hasContent: false }
      }

      default:
        return { label: 'Optional', hasContent: false }
    }
  }

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-warm-200 shadow-sm space-y-4">
      {/* ── 1. Gift Settings Tabs ── */}
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
              'w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-all duration-200 cursor-pointer',
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
              'w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-all duration-200 cursor-pointer',
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

      {/* ── 2. Dedicated Pages Panel ── */}
      <div>
        <div className="px-3 py-1 mb-2 flex items-center justify-between">
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-800">
              Pages
            </h2>
            <p className="text-[10px] text-neutral-400">Your gift journey</p>
          </div>
          {onReorder && (
            <span className="text-[10px] text-neutral-400">Reorder ↑ / ↓</span>
          )}
        </div>

        <nav className="space-y-1.5" aria-label="Gift Pages">
          {sortedSections.map((section, index) => {
            const meta = SECTION_METADATA[section.section_type] || {
              title: section.section_type,
              icon: Sparkles,
              required: false,
            }
            const Icon = meta.icon
            const isActive = activeSection === section.section_type
            const isFirst = index === 0
            const isLast = index === sortedSections.length - 1
            const isRequired = meta.required
            const isVisible = section.is_visible !== false

            const { label: contentLabel } = getContentSummary(section)
            const stepNumber = index + 1

            return (
              <div
                key={section.id}
                className={cn(
                  'group flex items-center justify-between gap-1 p-2 rounded-2xl transition-all duration-200',
                  isActive
                    ? 'bg-rose-50 border border-rose-200 text-neutral-900 shadow-sm ring-1 ring-rose-200'
                    : 'hover:bg-warm-100 text-neutral-700',
                  !isVisible && !isActive && 'opacity-70 bg-warm-50/50'
                )}
              >
                {/* Select Page Card Target */}
                <button
                  type="button"
                  onClick={() => onSectionSelect(section.section_type)}
                  className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                  aria-label={`Edit ${meta.title} page (${isVisible ? 'Visible' : 'Hidden'})`}
                >
                  {/* Number Badge */}
                  <div
                    className={cn(
                      'w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs font-bold flex-shrink-0 transition-colors',
                      isActive
                        ? 'bg-rose-500 text-white shadow-xs'
                        : isVisible
                        ? 'bg-warm-200 text-neutral-700'
                        : 'bg-warm-100 text-neutral-400'
                    )}
                  >
                    {stepNumber}
                  </div>

                  {/* Icon */}
                  <div
                    className={cn(
                      'w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
                      isActive
                        ? 'bg-rose-100 text-rose-600'
                        : 'bg-warm-100 text-neutral-500'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  {/* Title & Status Details */}
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
                    </div>

                    <p className="text-[11px] text-neutral-400 truncate flex items-center gap-1">
                      {isRequired ? (
                        <span className="text-neutral-400 font-medium">Always included</span>
                      ) : (
                        <span>
                          Optional · <strong className="font-normal text-neutral-500">{contentLabel}</strong>
                        </span>
                      )}
                    </p>
                  </div>
                </button>

                {/* Right Controls: Locked Indicator OR Show/Hide Switch + Reorder */}
                <div className="flex items-center gap-1 flex-shrink-0 pl-1">
                  {isRequired ? (
                    <div
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-warm-100 text-neutral-500 text-[11px] font-medium select-none min-h-[36px]"
                      title="Always included in gift"
                      aria-label="Always included"
                    >
                      <Lock className="w-3 h-3 text-neutral-400" />
                    </div>
                  ) : (
                    onToggleVisibility && (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isVisible}
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleVisibility(section.id)
                        }}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer min-h-[44px] min-w-[76px] justify-center focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none select-none',
                          isVisible
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 active:scale-95'
                            : 'bg-warm-100 text-neutral-500 border border-warm-200 hover:bg-warm-200 hover:text-neutral-700 active:scale-95'
                        )}
                        title={isVisible ? 'Click to hide this page' : 'Click to show this page'}
                        aria-label={`Toggle ${meta.title} visibility (currently ${isVisible ? 'Visible' : 'Hidden'})`}
                      >
                        {isVisible ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Visible</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>
                    )
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
                      className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-white/80 transition-colors disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                      title="Move page up"
                      aria-label="Move page up"
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
                      className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-white/80 transition-colors disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                      title="Move page down"
                      aria-label="Move page down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
