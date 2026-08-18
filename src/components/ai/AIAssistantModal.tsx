import { useState } from 'react'
import {
  Sparkles,
  X,
  Loader2,
  Wand2,
  Check,
  RotateCcw,
  AlertCircle,
  Heart,
  MessageSquare,
  Gift,
  Languages,
} from 'lucide-react'
import { useAIAssistant } from '@/lib/hooks/useAIAssistant'
import type { GeneratedMessageResult, GeneratedFullGiftResult } from '@/lib/services/aiService'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface AIAssistantModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'generate' | 'improve' | 'full_gift'
  giftId?: string
  occasionName?: string
  recipientName?: string
  senderName?: string
  currentHeading?: string
  currentBody?: string
  onApplyMessage?: (heading: string, body: string) => void
  onApplyFullGift?: (content: GeneratedFullGiftResult) => void
}

const RELATIONSHIPS = [
  'Partner / Lover',
  'Best Friend',
  'Spouse / Husband / Wife',
  'Sibling (Brother/Sister)',
  'Parent (Mom/Dad)',
  'Colleague / Mentor',
  'Crush',
]

const TONES = [
  'Heartfelt',
  'Romantic',
  'Funny',
  'Cute',
  'Emotional',
  'Elegant',
  'Playful',
]

const IMPROVE_TONES = [
  'Keep my tone (just polish)',
  'More romantic',
  'More emotional',
  'More playful',
  'More elegant',
  'More concise',
]

export default function AIAssistantModal({
  isOpen,
  onClose,
  initialMode = 'generate',
  giftId,
  occasionName = 'Special Occasion',
  recipientName = 'Someone Special',
  currentHeading = '',
  currentBody = '',
  onApplyMessage,
  onApplyFullGift,
}: AIAssistantModalProps) {
  const [mode, setMode] = useState<'generate' | 'improve' | 'full_gift'>(initialMode)
  const [relationship, setRelationship] = useState(RELATIONSHIPS[0])
  const [tone, setTone] = useState(TONES[0])
  const [improveTone, setImproveTone] = useState(IMPROVE_TONES[0])
  const [length, setLength] = useState<'Short' | 'Medium' | 'Long'>('Medium')
  const [language, setLanguage] = useState<'English' | 'Hinglish'>('English')
  const [context, setContext] = useState('')

  // Preview state (Human Approval)
  const [previewMessage, setPreviewMessage] = useState<GeneratedMessageResult | null>(null)
  const [previewFullGift, setPreviewFullGift] = useState<GeneratedFullGiftResult | null>(null)

  const {
    isGenerating,
    error,
    limitReached,
    generateNewMessage,
    improveCurrentMessage,
    generateFullGift,
    clearError,
  } = useAIAssistant()

  if (!isOpen) return null

  const handleGenerate = async () => {
    clearError()
    if (mode === 'generate') {
      const res = await generateNewMessage({
        gift_id: giftId,
        occasion: occasionName,
        recipientName,
        relationship,
        tone,
        length,
        language,
        context,
      })
      if (res) setPreviewMessage(res)
    } else if (mode === 'improve') {
      const res = await improveCurrentMessage({
        gift_id: giftId,
        currentDraft: {
          heading: currentHeading,
          body: currentBody || 'Wishing you a very special day filled with love and laughter.',
        },
        toneModifier: improveTone,
        language,
      })
      if (res) setPreviewMessage(res)
    } else if (mode === 'full_gift') {
      const res = await generateFullGift({
        gift_id: giftId,
        occasion: occasionName,
        recipientName,
        relationship,
        tone,
        language,
        context,
      })
      if (res) setPreviewFullGift(res)
    }
  }

  const handleApply = () => {
    if (previewMessage && onApplyMessage) {
      onApplyMessage(previewMessage.heading, previewMessage.body)
      handleClose()
    } else if (previewFullGift && onApplyFullGift) {
      onApplyFullGift(previewFullGift)
      handleClose()
    }
  }

  const handleClose = () => {
    setPreviewMessage(null)
    setPreviewFullGift(null)
    clearError()
    onClose()
  }

  const hasPreview = previewMessage || previewFullGift

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="aiModalTitle"
      className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-warm-200 space-y-6 my-8 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-warm-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 id="aiModalTitle" className="font-serif text-xl font-bold text-neutral-800 flex items-center gap-2">
                <span>AI Gift Assistant</span>
                <span className="text-[10px] font-sans uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                  Smart
                </span>
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Thoughtful, human-crafted words tailored for {recipientName}.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-warm-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error / Rate limit banner */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-xs animate-shake"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        {/* Mode Selector Tabs (only when not in preview) */}
        {!hasPreview && (
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-warm-100 rounded-2xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode('generate')}
              className={cn(
                'py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5',
                mode === 'generate'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('improve')}
              className={cn(
                'py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5',
                mode === 'improve'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Improve Draft</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('full_gift')}
              className={cn(
                'py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5',
                mode === 'full_gift'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Full Story</span>
            </button>
          </div>
        )}

        {/* MAIN BODY: 1. Input Form Mode */}
        {!hasPreview ? (
          <div className="space-y-4 text-xs">
            {/* Language & Occasion Info */}
            <div className="flex items-center justify-between gap-4 p-3 bg-cream-50 rounded-2xl border border-warm-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400">Occasion</span>
                <p className="font-semibold text-neutral-800">{occasionName}</p>
              </div>

              <div className="flex items-center gap-1">
                <Languages className="w-3.5 h-3.5 text-neutral-400 mr-1" />
                {(['English', 'Hinglish'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                      language === lang
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-white text-neutral-600 border border-warm-200 hover:bg-warm-100'
                    )}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode 1: Generate Message */}
            {mode === 'generate' && (
              <div className="space-y-3.5">
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Relationship
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full p-2.5 bg-cream-50 border border-warm-300 rounded-xl focus:border-rose-400 focus:outline-none"
                  >
                    {RELATIONSHIPS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Tone
                    </label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full p-2.5 bg-cream-50 border border-warm-300 rounded-xl focus:border-rose-400 focus:outline-none"
                    >
                      {TONES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Length
                    </label>
                    <select
                      value={length}
                      onChange={(e) => setLength(e.target.value as 'Short' | 'Medium' | 'Long')}
                      className="w-full p-2.5 bg-cream-50 border border-warm-300 rounded-xl focus:border-rose-400 focus:outline-none"
                    >
                      <option value="Short">Short & Sweet (~2 sentences)</option>
                      <option value="Medium">Medium Paragraph</option>
                      <option value="Long">Heartfelt Letter</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Special Context / Memories <span className="text-neutral-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    maxLength={1000}
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="e.g. Loves chai, we met in college, always supporting my dreams..."
                    className="w-full p-3 bg-cream-50 border border-warm-300 rounded-xl focus:border-rose-400 focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* Mode 2: Improve Draft */}
            {mode === 'improve' && (
              <div className="space-y-3.5">
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    How would you like to refine it?
                  </label>
                  <select
                    value={improveTone}
                    onChange={(e) => setImproveTone(e.target.value)}
                    className="w-full p-2.5 bg-cream-50 border border-warm-300 rounded-xl focus:border-rose-400 focus:outline-none"
                  >
                    {IMPROVE_TONES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-warm-50 rounded-2xl border border-warm-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Current Draft</span>
                  <p className="text-neutral-700 italic leading-relaxed line-clamp-3">
                    &quot;{currentBody || 'Wishing you the happiest day filled with love and laughter.'}&quot;
                  </p>
                </div>
              </div>
            )}

            {/* Mode 3: Full Story Gift */}
            {mode === 'full_gift' && (
              <div className="space-y-3.5">
                <p className="text-neutral-500 leading-relaxed">
                  Generates an interconnected storyline across your entire gift: **Cover Greeting**, **Main Letter**, and **Closing Farewell**.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Relationship
                    </label>
                    <select
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="w-full p-2.5 bg-cream-50 border border-warm-300 rounded-xl focus:border-rose-400 focus:outline-none"
                    >
                      {RELATIONSHIPS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Tone
                    </label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full p-2.5 bg-cream-50 border border-warm-300 rounded-xl focus:border-rose-400 focus:outline-none"
                    >
                      {TONES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Special Story Note <span className="text-neutral-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    maxLength={1000}
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="e.g. Celebrating 5 years together, road trips, grateful for endless support..."
                    className="w-full p-3 bg-cream-50 border border-warm-300 rounded-xl focus:border-rose-400 focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* Action Submit Button */}
            <div className="pt-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || limitReached}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-md hover:shadow-glow transition-all disabled:opacity-60"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Crafting something special…</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {mode === 'improve'
                        ? 'Polish Message'
                        : mode === 'full_gift'
                        ? 'Generate Complete Gift Story'
                        : 'Generate Message'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* MAIN BODY: 2. Human Approval / Preview Mode */
          <div className="space-y-5 animate-fade-in text-xs">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Generated Preview</span>
              </span>

              <span className="text-[11px] text-neutral-400">
                Review before applying
              </span>
            </div>

            {/* Preview Single Message */}
            {previewMessage && (
              <div className="bg-gradient-to-br from-rose-50/60 to-pink-50/40 rounded-2xl p-5 border border-rose-200/80 space-y-3 shadow-sm">
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-500">Letter Heading</span>
                  <h4 className="font-serif text-base font-bold text-neutral-800 mt-0.5">
                    {previewMessage.heading}
                  </h4>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-500">Message Body</span>
                  <p className="text-xs text-neutral-700 leading-relaxed whitespace-pre-line mt-1 font-normal">
                    {previewMessage.body}
                  </p>
                </div>
              </div>
            )}

            {/* Preview Full Gift Content */}
            {previewFullGift && (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {/* 1. Cover */}
                <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-rose-600 text-[11px] font-bold">
                    <Heart className="w-3.5 h-3.5" />
                    <span>Cover Greeting</span>
                  </div>
                  <p className="font-serif font-bold text-neutral-800">{previewFullGift.cover.headline}</p>
                  <p className="text-neutral-600 text-[11px]">{previewFullGift.cover.subheadline}</p>
                </div>

                {/* 2. Message */}
                <div className="bg-pink-50/70 p-4 rounded-2xl border border-pink-200/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-pink-600 text-[11px] font-bold">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Main Letter</span>
                  </div>
                  <p className="font-serif font-bold text-neutral-800">{previewFullGift.message.heading}</p>
                  <p className="text-neutral-700 whitespace-pre-line leading-relaxed text-[11px]">
                    {previewFullGift.message.body}
                  </p>
                </div>

                {/* 3. Final Message */}
                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-700 text-[11px] font-bold">
                    <Gift className="w-3.5 h-3.5" />
                    <span>Closing Farewell</span>
                  </div>
                  <p className="font-serif font-bold text-neutral-800">{previewFullGift.final_message.heading}</p>
                  <p className="text-neutral-600 text-[11px]">{previewFullGift.final_message.body}</p>
                </div>
              </div>
            )}

            {/* Approval Controls */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-warm-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setPreviewMessage(null)
                  setPreviewFullGift(null)
                }}
              >
                Back to Edit
              </Button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-neutral-700 hover:text-rose-600 bg-warm-100 hover:bg-warm-200 transition-colors"
                >
                  {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  <span>Regenerate</span>
                </button>

                <button
                  type="button"
                  onClick={handleApply}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all hover:scale-105"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Use This</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
