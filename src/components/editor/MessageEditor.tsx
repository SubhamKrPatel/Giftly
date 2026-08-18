import { MessageSquareHeart, Type, Sparkles } from 'lucide-react'
import type { MessageSectionContent } from '@/lib/database.types'

interface MessageEditorProps {
  content: MessageSectionContent
  onChange: (updates: Partial<MessageSectionContent>) => void
  recipientName?: string
}

export default function MessageEditor({
  content,
  onChange,
  recipientName = 'You',
}: MessageEditorProps) {
  const heading = content?.heading || ''
  const body = content?.body || ''

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
          <MessageSquareHeart className="w-4 h-4 text-rose-500" />
          <span>Personal Message Section</span>
        </div>
        <h2 className="font-serif text-2xl font-semibold text-neutral-800">
          Heartfelt Message
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Write a meaningful note or letter. Your recipient can read this at their own pace.
        </p>
      </div>

      <div className="space-y-5">
        {/* Section Heading */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="messageHeading"
              className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider"
            >
              Letter Heading
            </label>
            <span className="text-[11px] text-neutral-400">
              {heading.length} / 80
            </span>
          </div>
          <div className="relative">
            <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              id="messageHeading"
              type="text"
              maxLength={80}
              value={heading}
              onChange={(e) => onChange({ heading: e.target.value })}
              placeholder={`e.g. A note for ${recipientName}, From the bottom of my heart`}
              className="w-full pl-10 pr-4 py-3 text-sm border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all bg-cream-50"
            />
          </div>
        </div>

        {/* Message Body */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="messageBody"
              className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider"
            >
              Your Message <span className="text-rose-500">*</span>
            </label>
            <span
              className={`text-[11px] font-medium ${
                body.length > 900 ? 'text-amber-600' : 'text-neutral-400'
              }`}
            >
              {body.length} / 1000
            </span>
          </div>

          <div className="relative">
            <textarea
              id="messageBody"
              rows={7}
              maxLength={1000}
              value={body}
              onChange={(e) => onChange({ body: e.target.value })}
              placeholder={`Dear ${recipientName},\n\nEvery moment with you has become one of my favorite memories. Thank you for always being there...`}
              className="w-full p-4 text-sm border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all bg-cream-50 leading-relaxed resize-y min-h-[160px]"
            />
          </div>

          {/* AI Helper placeholder (Disabled - Part 5) */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-neutral-400">
              Share memories, gratitude, and warm wishes.
            </p>

            <button
              type="button"
              disabled
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 bg-warm-100 cursor-not-allowed"
              title="AI message generation will be available in Part 5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate with AI (Coming soon)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
