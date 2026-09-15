import { MessageSquareHeart, Type } from 'lucide-react'
import type {
  MessageSectionContent,
  SlideBackgroundConfig,
  GiftThemeConfig,
} from '@/lib/database.types'
import SlideBackgroundControl, { type PhotoOption } from './SlideBackgroundControl'

interface MessageEditorProps {
  content: MessageSectionContent
  onChange: (updates: Partial<MessageSectionContent>) => void
  recipientName?: string
  onOpenAI?: (mode: 'generate' | 'improve') => void
  availablePhotos?: PhotoOption[]
  occasionSlug?: string | null
  theme?: GiftThemeConfig
  onUploadBackgroundPhoto?: (file: File) => Promise<{ mediaId: string; url: string } | null>
}

export default function MessageEditor({
  content,
  onChange,
  recipientName = 'Chahat',
  availablePhotos = [],
  occasionSlug,
  theme,
  onUploadBackgroundPhoto,
}: MessageEditorProps) {
  const heading = content?.heading ?? ''
  const body = content?.body ?? ''

  const charCount = body.length
  const maxBodyLength = 1000
  const maxHeadingLength = 80

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
          <MessageSquareHeart className="w-4 h-4 text-rose-500" />
          <span>Personal Message</span>
        </div>
        <div>
          <h2 className="font-serif text-2xl font-semibold text-neutral-800">
            Personal Note
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Write something they&apos;ll remember.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* ── Headline / Letter Heading ── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="messageHeading"
              className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider"
            >
              Letter Heading
            </label>
            <span className="text-[11px] font-mono text-neutral-400">
              {heading.length} / {maxHeadingLength}
            </span>
          </div>
          <div className="relative">
            <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              id="messageHeading"
              type="text"
              maxLength={maxHeadingLength}
              value={heading}
              onChange={(e) => onChange({ heading: e.target.value })}
              placeholder={`e.g. A note for ${recipientName}, Happy Birthday!`}
              className="w-full pl-10 pr-4 py-3 text-sm sm:text-base border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all bg-cream-50 text-neutral-800 min-h-[44px]"
            />
          </div>
        </div>

        {/* ── Personal Message Textarea ── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="messageBody"
              className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider"
            >
              Personal Message <span className="text-rose-500">*</span>
            </label>
            <span
              className={`text-[11px] font-mono font-medium ${
                charCount > maxBodyLength * 0.9 ? 'text-amber-600' : 'text-neutral-400'
              }`}
            >
              {charCount} / {maxBodyLength} characters
            </span>
          </div>

          <div className="relative">
            <textarea
              id="messageBody"
              rows={8}
              maxLength={maxBodyLength}
              value={body}
              onChange={(e) => onChange({ body: e.target.value })}
              placeholder={`Write something heartfelt for ${recipientName}...\n\nEvery moment with you has become one of my favorite memories. Thank you for always being there.`}
              className="w-full p-4 text-sm sm:text-base border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all bg-cream-50 leading-relaxed resize-y min-h-[220px] text-neutral-800 placeholder:text-neutral-400/80 font-sans"
            />
          </div>

          <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
            Tip: Share meaningful memories, inside jokes, or words of gratitude.
          </p>
        </div>

        {/* ── Slide Background Customization ── */}
        <SlideBackgroundControl
          background={content?.background}
          onChange={(bg: SlideBackgroundConfig) => onChange({ background: bg })}
          availablePhotos={availablePhotos}
          occasionSlug={occasionSlug}
          theme={theme}
          onUploadPhoto={onUploadBackgroundPhoto}
          title="Message Slide Background"
          defaultCollapsed={true}
        />
      </div>
    </div>
  )
}
