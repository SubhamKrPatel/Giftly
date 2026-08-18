import { Sparkles, Type, AlignLeft } from 'lucide-react'
import type { CoverSectionContent } from '@/lib/database.types'

interface CoverEditorProps {
  content: CoverSectionContent
  onChange: (updates: Partial<CoverSectionContent>) => void
  recipientName?: string
  occasionName?: string
  onOpenAI?: () => void
}

export default function CoverEditor({
  content,
  onChange,
  recipientName = 'Someone Special',
  occasionName = 'Occasion',
  onOpenAI,
}: CoverEditorProps) {
  const headline = content?.headline || ''
  const subheadline = content?.subheadline || ''

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
          <Sparkles className="w-4 h-4 text-rose-500" />
          <span>Cover Section</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-neutral-800">
              Cover & Greeting
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              The opening screen your recipient will see when opening their gift. Make it warm and captivating.
            </p>
          </div>

          {onOpenAI && (
            <button
              type="button"
              onClick={onOpenAI}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 shadow-xs hover:shadow-sm transition-all hover:scale-105 flex-shrink-0"
              title="Open AI Gift Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>AI Story</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-5">
        {/* Headline */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="coverHeadline"
              className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider"
            >
              Opening Headline
            </label>
            <span className="text-[11px] text-neutral-400">
              {headline.length} / 80
            </span>
          </div>
          <div className="relative">
            <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              id="coverHeadline"
              type="text"
              maxLength={80}
              value={headline}
              onChange={(e) => onChange({ headline: e.target.value })}
              placeholder={`e.g. Happy ${occasionName}, ${recipientName}! ❤️`}
              className="w-full pl-10 pr-4 py-3 text-sm border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all bg-cream-50"
            />
          </div>
          <p className="text-xs text-neutral-400 mt-1.5">
            Keep it bold and punchy. This is the main title greeting.
          </p>
        </div>

        {/* Subheadline */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="coverSubheadline"
              className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider"
            >
              Subtitle Message <span className="text-neutral-400 font-normal lowercase">(optional)</span>
            </label>
            <span className="text-[11px] text-neutral-400">
              {subheadline.length} / 200
            </span>
          </div>
          <div className="relative">
            <AlignLeft className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
            <textarea
              id="coverSubheadline"
              rows={3}
              maxLength={200}
              value={subheadline}
              onChange={(e) => onChange({ subheadline: e.target.value })}
              placeholder="e.g. Made with love for the person who brings so much sunshine into my life."
              className="w-full pl-10 pr-4 py-3 text-sm border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all bg-cream-50 resize-none"
            />
          </div>
          <p className="text-xs text-neutral-400 mt-1.5">
            A sweet introductory sentence appearing beneath the headline.
          </p>
        </div>
      </div>
    </div>
  )
}
