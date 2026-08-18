import {
  FileText,
  Sparkles,
  MessageSquareHeart,
  Image as ImageIcon,
  Music,
  Gift,
  Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditorSectionListProps {
  activeSection: string
  onSectionSelect: (id: string) => void
}

const SECTIONS = [
  {
    id: 'details',
    title: 'Gift Details',
    subtitle: 'Title, recipient & sender names',
    icon: FileText,
    available: true,
  },
  {
    id: 'cover',
    title: 'Cover Page',
    subtitle: 'Opening animations & greeting',
    icon: Sparkles,
    available: false,
    badge: 'Coming in Part 4',
  },
  {
    id: 'message',
    title: 'Personal Message',
    subtitle: 'Heartfelt letter & notes',
    icon: MessageSquareHeart,
    available: false,
    badge: 'Coming in Part 4',
  },
  {
    id: 'memories',
    title: 'Photo Memories',
    subtitle: 'Moments, captions & gallery',
    icon: ImageIcon,
    available: false,
    badge: 'Coming in Part 4',
  },
  {
    id: 'music',
    title: 'Background Music',
    subtitle: 'Atmospheric audio tracks',
    icon: Music,
    available: false,
    badge: 'Coming in Part 4',
  },
  {
    id: 'final-reveal',
    title: 'Final Surprise',
    subtitle: 'Closing animation & gift link',
    icon: Gift,
    available: false,
    badge: 'Coming in Part 4',
  },
]

export default function EditorSectionList({
  activeSection,
  onSectionSelect,
}: EditorSectionListProps) {
  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-warm-200 shadow-sm space-y-2">
      <div className="px-3 py-2 mb-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Gift Sections
        </h2>
      </div>

      <nav className="space-y-1.5" aria-label="Gift Editor Sections">
        {SECTIONS.map((section) => {
          const Icon = section.icon
          const isActive = activeSection === section.id
          const isAvailable = section.available

          return (
            <button
              key={section.id}
              type="button"
              disabled={!isAvailable}
              onClick={() => isAvailable && onSectionSelect(section.id)}
              className={cn(
                'w-full flex items-start gap-3 p-3 rounded-2xl text-left transition-all duration-200',
                isActive
                  ? 'bg-rose-50 border border-rose-200 text-neutral-900 shadow-sm ring-1 ring-rose-200'
                  : isAvailable
                  ? 'hover:bg-warm-100 text-neutral-700'
                  : 'opacity-60 cursor-not-allowed bg-warm-50/50'
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
                  isActive
                    ? 'bg-rose-500 text-white shadow-sm'
                    : isAvailable
                    ? 'bg-warm-200 text-neutral-600'
                    : 'bg-warm-100 text-neutral-400'
                )}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={cn(
                      'text-sm font-semibold truncate',
                      isActive ? 'text-rose-700' : 'text-neutral-800'
                    )}
                  >
                    {section.title}
                  </span>
                  {!isAvailable && (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                      <Lock className="w-2.5 h-2.5" />
                      <span>{section.badge}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 truncate mt-0.5">{section.subtitle}</p>
              </div>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
