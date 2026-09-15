import { Heart, Type, PenTool } from 'lucide-react'
import type {
  FinalMessageSectionContent,
  SlideBackgroundConfig,
  GiftThemeConfig,
} from '@/lib/database.types'
import SlideBackgroundControl, { type PhotoOption } from './SlideBackgroundControl'

interface FinalMessageEditorProps {
  content: FinalMessageSectionContent
  onChange: (updates: Partial<FinalMessageSectionContent>) => void
  senderName?: string
  onOpenAI?: () => void
  availablePhotos?: PhotoOption[]
  occasionSlug?: string | null
  theme?: GiftThemeConfig
  onUploadBackgroundPhoto?: (file: File) => Promise<{ mediaId: string; url: string } | null>
}

export default function FinalMessageEditor({
  content,
  onChange,
  senderName = 'Ayushi',
  availablePhotos = [],
  occasionSlug,
  theme,
  onUploadBackgroundPhoto,
}: FinalMessageEditorProps) {
  const heading = content?.heading ?? ''
  const body = content?.body ?? ''

  const charCount = body.length
  const maxBodyLength = 600
  const maxHeadingLength = 80

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-100" />
          <span>Final Wish</span>
        </div>
        <div>
          <h2 className="font-serif text-2xl font-semibold text-neutral-800">
            Closing Words
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            End with something they&apos;ll carry with them.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* ── Closing Heading ── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="finalHeading"
              className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider"
            >
              Closing Title
            </label>
            <span className="text-[11px] font-mono text-neutral-400">
              {heading.length} / {maxHeadingLength}
            </span>
          </div>
          <div className="relative">
            <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              id="finalHeading"
              type="text"
              maxLength={maxHeadingLength}
              value={heading}
              onChange={(e) => onChange({ heading: e.target.value })}
              placeholder="e.g. With all my love ❤️, Forever & Always"
              className="w-full pl-10 pr-4 py-3 text-sm sm:text-base border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all bg-cream-50 text-neutral-800 min-h-[44px]"
            />
          </div>
        </div>

        {/* ── Final Message Body ── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="finalBody"
              className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider"
            >
              Closing Sentences <span className="text-neutral-400 font-normal lowercase">(optional)</span>
            </label>
            <span className="text-[11px] font-mono text-neutral-400">
              {charCount} / {maxBodyLength} characters
            </span>
          </div>
          <div className="relative">
            <textarea
              id="finalBody"
              rows={4}
              maxLength={maxBodyLength}
              value={body}
              onChange={(e) => onChange({ body: e.target.value })}
              placeholder="e.g. May your days ahead be filled with endless joy, laughter, and wonderful blessings."
              className="w-full p-4 text-sm sm:text-base border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all bg-cream-50 resize-y leading-relaxed min-h-[140px] text-neutral-800 placeholder:text-neutral-400/80 font-sans"
            />
          </div>
        </div>

        {/* ── Sender Signature Preview ── */}
        {senderName && (
          <div className="p-3.5 rounded-2xl bg-warm-50 border border-warm-200/80 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-neutral-700 min-w-0">
              <PenTool className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
              <span className="truncate">
                Signature: <strong className="font-semibold text-neutral-900">{senderName}</strong>
              </span>
            </div>
            <span className="text-[11px] text-neutral-400 flex-shrink-0">
              (From Gift Details)
            </span>
          </div>
        )}

        {/* ── Slide Background Customization ── */}
        <SlideBackgroundControl
          background={content?.background}
          onChange={(bg: SlideBackgroundConfig) => onChange({ background: bg })}
          availablePhotos={availablePhotos}
          occasionSlug={occasionSlug}
          theme={theme}
          onUploadPhoto={onUploadBackgroundPhoto}
          title="Final Wish Slide Background"
          defaultCollapsed={true}
        />
      </div>
    </div>
  )
}
