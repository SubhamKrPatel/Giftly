import { useMemo, useRef, useEffect } from 'react'
import {
  Sparkles,
  MessageSquareHeart,
  Image as ImageIcon,
  Video,
  Mic,
  Music,
  Gift,
  BookOpen,
  FileText,
  Palette,
  EyeOff,
} from 'lucide-react'
import type { GiftSection, GiftMediaItem } from '@/lib/database.types'
import { cn } from '@/lib/utils'

interface MobilePageNavProps {
  sections: GiftSection[]
  activeSection: string
  onSectionSelect: (id: string) => void
  mediaItems?: GiftMediaItem[]
  videoItems?: GiftMediaItem[]
  voiceItem?: GiftMediaItem | null
  musicItem?: GiftMediaItem | null
}

interface NavItem {
  id: string
  title: string
  icon: typeof Sparkles
  badge?: string
  isRequired: boolean
  isVisible: boolean
  isSetting?: boolean
}

export default function MobilePageNav({
  sections,
  activeSection,
  onSectionSelect,
  mediaItems = [],
  videoItems = [],
  voiceItem = null,
  musicItem = null,
}: MobilePageNavProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Construct ordered list of navigable items: Settings tabs + Gift Pages
  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = [
      {
        id: 'details',
        title: 'Info',
        icon: FileText,
        isRequired: true,
        isVisible: true,
        isSetting: true,
      },
      {
        id: 'theme',
        title: 'Theme',
        icon: Palette,
        isRequired: true,
        isVisible: true,
        isSetting: true,
      },
    ]

    const musicSection = sections.find((s) => s.section_type === 'music')
    if (musicSection) {
      items.push({
        id: 'music',
        title: 'Music',
        icon: Music,
        badge: musicItem?.signedUrl ? '1 track' : undefined,
        isRequired: false,
        isVisible: musicSection.is_visible !== false,
        isSetting: true,
      })
    }

    const sortedSections = [...sections].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

    sortedSections.forEach((section) => {
      const isVisible = section.is_visible !== false

      switch (section.section_type) {
        case 'cover':
          items.push({
            id: 'cover',
            title: 'Opening',
            icon: Sparkles,
            isRequired: true,
            isVisible,
          })
          break
        case 'message':
          items.push({
            id: 'message',
            title: 'Message',
            icon: MessageSquareHeart,
            isRequired: true,
            isVisible,
          })
          break
        case 'story': {
          const content = (section.content as Record<string, unknown>) || {}
          const storyItems = (content.items as unknown[]) || []
          const hasContent = storyItems.length > 0 || Boolean(content.body)
          items.push({
            id: 'story',
            title: 'Story',
            icon: BookOpen,
            badge: hasContent ? `${storyItems.length || 1}` : undefined,
            isRequired: false,
            isVisible,
          })
          break
        }
        case 'gallery':
          items.push({
            id: 'gallery',
            title: 'Photos',
            icon: ImageIcon,
            badge: mediaItems.length > 0 ? `${mediaItems.length}` : undefined,
            isRequired: false,
            isVisible,
          })
          break
        case 'video':
          items.push({
            id: 'video',
            title: 'Video',
            icon: Video,
            badge: videoItems.length > 0 ? `${videoItems.length}` : undefined,
            isRequired: false,
            isVisible,
          })
          break
        case 'voice': {
          const hasV = Boolean(voiceItem && voiceItem.signedUrl)
          items.push({
            id: 'voice',
            title: 'Voice',
            icon: Mic,
            badge: hasV ? '1 note' : undefined,
            isRequired: false,
            isVisible,
          })
          break
        }
        case 'final_message':
          items.push({
            id: 'final_message',
            title: 'Final Wish',
            icon: Gift,
            isRequired: true,
            isVisible,
          })
          break
      }
    })

    return items
  }, [sections, mediaItems.length, videoItems.length, voiceItem, musicItem])

  // Auto-scroll active item into view when activeSection changes
  useEffect(() => {
    if (!containerRef.current) return
    const activeEl = containerRef.current.querySelector<HTMLElement>(`[data-nav-id="${activeSection}"]`)
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [activeSection])

  return (
    <nav
      className="w-full bg-white/90 backdrop-blur-md border-y border-warm-200/80 py-2.5 px-3 select-none"
      aria-label="Gift Section Navigation"
    >
      <div
        ref={containerRef}
        className="flex items-center gap-2 overflow-x-auto scrollbar-none scroll-smooth pb-0.5"
        role="tablist"
      >
        {navItems.map((item) => {
          const isActive = activeSection === item.id
          const Icon = item.icon

          return (
            <button
              key={item.id}
              data-nav-id={item.id}
              role="tab"
              aria-selected={isActive}
              aria-label={`${item.title} ${!item.isVisible ? '(Hidden)' : ''}`}
              type="button"
              onClick={() => onSectionSelect(item.id)}
              className={cn(
                'inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer min-h-[44px] flex-shrink-0 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500',
                isActive
                  ? 'bg-rose-500 text-white shadow-sm ring-2 ring-rose-300 ring-offset-1 scale-[1.02]'
                  : 'bg-warm-100/90 hover:bg-warm-200/80 text-neutral-700 border border-warm-200/60 active:scale-95',
                !item.isVisible && !isActive && 'opacity-60 border-dashed bg-warm-50 text-neutral-400'
              )}
            >
              <Icon
                className={cn(
                  'w-3.5 h-3.5 flex-shrink-0',
                  isActive ? 'text-white' : 'text-neutral-500'
                )}
              />
              <span>{item.title}</span>

              {/* Badge for count or hidden state */}
              {item.badge && (
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none',
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-rose-100 text-rose-700 font-semibold'
                  )}
                >
                  {item.badge}
                </span>
              )}

              {!item.isVisible && !isActive && (
                <span className="text-[10px] text-neutral-400 inline-flex items-center gap-0.5">
                  <EyeOff className="w-3 h-3" />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
