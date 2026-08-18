import { Gift, Type } from 'lucide-react'
import type { FinalMessageSectionContent } from '@/lib/database.types'

interface FinalMessageEditorProps {
  content: FinalMessageSectionContent
  onChange: (updates: Partial<FinalMessageSectionContent>) => void
  senderName?: string
}

export default function FinalMessageEditor({
  content,
  onChange,
  senderName = 'Me',
}: FinalMessageEditorProps) {
  const heading = content?.heading || ''
  const body = content?.body || ''

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
          <Gift className="w-4 h-4 text-rose-500" />
          <span>Final Message Section</span>
        </div>
        <h2 className="font-serif text-2xl font-semibold text-neutral-800">
          Closing Words
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          The final note or sign-off at the end of your digital gift presentation.
        </p>
      </div>

      <div className="space-y-5">
        {/* Heading */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="finalHeading"
              className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider"
            >
              Sign-Off Heading
            </label>
            <span className="text-[11px] text-neutral-400">
              {heading.length} / 80
            </span>
          </div>
          <div className="relative">
            <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              id="finalHeading"
              type="text"
              maxLength={80}
              value={heading}
              onChange={(e) => onChange({ heading: e.target.value })}
              placeholder="e.g. With All My Love, Forever & Always"
              className="w-full pl-10 pr-4 py-3 text-sm border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all bg-cream-50"
            />
          </div>
        </div>

        {/* Body */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="finalBody"
              className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider"
            >
              Closing Sentences <span className="text-neutral-400 font-normal lowercase">(optional)</span>
            </label>
            <span className="text-[11px] text-neutral-400">
              {body.length} / 600
            </span>
          </div>
          <div className="relative">
            <textarea
              id="finalBody"
              rows={4}
              maxLength={600}
              value={body}
              onChange={(e) => onChange({ body: e.target.value })}
              placeholder={`e.g. I hope this little surprise brought a smile to your face today. Love always,\n${senderName}`}
              className="w-full p-4 text-sm border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all bg-cream-50 resize-none leading-relaxed"
            />
          </div>
          <p className="text-xs text-neutral-400 mt-1.5">
            A gentle farewell or signature phrase to complete the surprise.
          </p>
        </div>
      </div>
    </div>
  )
}
