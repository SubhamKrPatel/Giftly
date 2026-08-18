import { type FormEvent, useState } from 'react'
import { ArrowLeft, Heart, Loader2, AlertCircle, User, PenTool, Type } from 'lucide-react'
import type { Occasion, Template } from '@/lib/database.types'
import Button from '@/components/ui/Button'

interface GiftDetailsFormProps {
  occasion: Occasion | null
  template: Template | null
  recipientName: string
  senderName: string
  title: string
  onRecipientNameChange: (val: string) => void
  onSenderNameChange: (val: string) => void
  onTitleChange: (val: string) => void
  onSubmit: (e: FormEvent) => void
  onBack: () => void
  submitting?: boolean
  error?: string | null
}

export default function GiftDetailsForm({
  occasion,
  template,
  recipientName,
  senderName,
  title,
  onRecipientNameChange,
  onSenderNameChange,
  onTitleChange,
  onSubmit,
  onBack,
  submitting = false,
  error = null,
}: GiftDetailsFormProps) {
  const [touched, setTouched] = useState(false)

  const isRecipientValid = recipientName.trim().length > 0
  const showError = touched && !isRecipientValid

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!isRecipientValid) return
    onSubmit(e)
  }

  const primaryColor = template?.theme_config.primaryColor || '#f43f5e'
  const secondaryColor = template?.theme_config.secondaryColor || '#fda4af'

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fade-in-up">
      {/* Header text */}
      <div className="text-center">
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-neutral-800 tracking-tight">
          Who is this gift for?
        </h2>
        <p className="text-sm text-neutral-500 mt-2">
          Add recipient and sender details. You can always edit these anytime in your gift settings.
        </p>
      </div>

      {/* Summary preview card */}
      <div className="bg-white rounded-2xl p-4 border border-warm-200 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-warm-100 flex items-center justify-center text-xl shadow-inner">
            <span>{occasion?.icon || '🎁'}</span>
          </div>
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Selected Style
            </div>
            <div className="text-sm font-semibold text-neutral-800 flex items-center gap-1.5">
              <span>{occasion?.name}</span>
              <span className="text-neutral-300">•</span>
              <span className="text-rose-600">{template?.name}</span>
            </div>
          </div>
        </div>

        {/* Swatch */}
        <div className="flex items-center gap-1.5 pr-2">
          <div
            className="w-4 h-4 rounded-full border border-white shadow-sm"
            style={{ backgroundColor: primaryColor }}
          />
          <div
            className="w-4 h-4 rounded-full border border-white shadow-sm"
            style={{ backgroundColor: secondaryColor }}
          />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-warm-200 shadow-card space-y-5" noValidate>
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Recipient Name (Required) */}
        <div>
          <label
            htmlFor="recipientName"
            className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5"
          >
            Recipient's Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              id="recipientName"
              type="text"
              value={recipientName}
              onChange={(e) => onRecipientNameChange(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="e.g. Sarah, Dad, Emily"
              className={`w-full pl-10 pr-4 py-3 text-sm border rounded-xl focus:outline-none transition-all duration-200 bg-cream-50 ${
                showError
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                  : 'border-warm-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
              }`}
              disabled={submitting}
              required
            />
          </div>
          {showError && (
            <p className="text-xs text-rose-600 mt-1.5">Please enter the recipient's name.</p>
          )}
        </div>

        {/* Sender Name (Optional) */}
        <div>
          <label
            htmlFor="senderName"
            className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5"
          >
            Your Name / Sender <span className="text-neutral-400 font-normal lowercase">(optional)</span>
          </label>
          <div className="relative">
            <PenTool className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              id="senderName"
              type="text"
              value={senderName}
              onChange={(e) => onSenderNameChange(e.target.value)}
              placeholder="e.g. Alex, With love from Sarah"
              className="w-full pl-10 pr-4 py-3 text-sm border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all duration-200 bg-cream-50"
              disabled={submitting}
            />
          </div>
        </div>

        {/* Gift Title (Optional) */}
        <div>
          <label
            htmlFor="giftTitle"
            className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5"
          >
            Gift Title <span className="text-neutral-400 font-normal lowercase">(optional)</span>
          </label>
          <div className="relative">
            <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              id="giftTitle"
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder={
                recipientName.trim()
                  ? `e.g. Happy Birthday ${recipientName.trim()}!`
                  : 'e.g. Happy Birthday!, For My Best Friend'
              }
              className="w-full pl-10 pr-4 py-3 text-sm border border-warm-300 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all duration-200 bg-cream-50"
              disabled={submitting}
            />
          </div>
          <p className="text-xs text-neutral-400 mt-1.5">
            If left blank, we'll give your gift a sweet default title.
          </p>
        </div>

        {/* Submit action */}
        <div className="pt-4 border-t border-warm-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onBack}
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Template</span>
          </Button>

          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="w-full sm:w-auto shadow-glow"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Gift…</span>
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 fill-white" />
                <span>Create Gift</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
