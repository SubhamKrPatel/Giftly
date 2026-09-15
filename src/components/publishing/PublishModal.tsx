import { useState } from 'react'
import {
  Sparkles,
  X,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  Globe,
  AlertCircle,
  QrCode,
  Link2,
  Send,
  Eye,
  CheckCircle2,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import QRCodeCard from './QRCodeCard'
import { cn } from '@/lib/utils'

interface PublishModalProps {
  isOpen: boolean
  onClose: () => void
  recipientName: string
  occasionName?: string
  templateName?: string
  giftTitle?: string
  giftId?: string
  momentsCount?: number
  onPublish: () => Promise<{ success: boolean; public_slug?: string; error?: string }>
}

export default function PublishModal({
  isOpen,
  onClose,
  recipientName,
  occasionName,
  templateName,
  giftTitle,
  giftId,
  momentsCount = 5,
  onPublish,
}: PublishModalProps) {
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const [successTab, setSuccessTab] = useState<'link' | 'qr'>('link')

  if (!isOpen) return null

  const handleConfirmPublish = async () => {
    setPublishing(true)
    setError(null)

    try {
      const res = await onPublish()
      if (res.success && res.public_slug) {
        setPublishedSlug(res.public_slug)
      } else {
        setError(res.error || "Couldn't publish your gift. Your work is safe. Please try again.")
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Couldn't publish your gift. Please try again."
      setError(msg)
    } finally {
      setPublishing(false)
    }
  }

  const publicUrl = publishedSlug
    ? `${window.location.origin}/g/${publishedSlug}`
    : ''

  const handleCopyLink = async () => {
    if (!publicUrl) return
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(publicUrl)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = publicUrl
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      setCopied(true)
      setCopyFeedback('Link copied ✓')
      setTimeout(() => {
        setCopied(false)
        setCopyFeedback(null)
      }, 2500)
    } catch {
      setCopyFeedback('Copy failed — tap and hold the link to copy it.')
      setTimeout(() => setCopyFeedback(null), 3500)
    }
  }

  // Web Share API
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const handleNativeShare = async () => {
    if (!canNativeShare || !publicUrl) return

    try {
      await navigator.share({
        title: `${recipientName}'s Gift ❤️`,
        text: 'A little something made just for you ❤️',
        url: publicUrl,
      })
    } catch (err: unknown) {
      if ((err as { name?: string }).name !== 'AbortError') {
        console.warn('[PublishModal] Native share failed:', err)
      }
    }
  }

  const handleClose = () => {
    setPublishedSlug(null)
    setError(null)
    setCopied(false)
    setCopyFeedback(null)
    setSuccessTab('link')
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="publishModalTitle"
      className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fade-in"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-warm-200 space-y-5 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-warm-200 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 id="publishModalTitle" className="font-serif text-xl font-bold text-neutral-800">
                {publishedSlug ? 'Your gift is ready! ❤️' : 'Your gift is ready ❤️'}
              </h2>
              <p className="text-xs text-neutral-500">
                {publishedSlug
                  ? `Ready to share with ${recipientName}`
                  : `Review and publish for ${recipientName}`}
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

        {/* Error Banner */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-xs animate-shake"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1 leading-relaxed">
              <span className="font-semibold block">{error}</span>
              <span className="text-rose-600/80 mt-0.5 block">Your work is safe. Please try publishing again.</span>
            </div>
          </div>
        )}

        {/* Content: Pre-Publish Checklist vs Published Success */}
        {!publishedSlug ? (
          <div className="space-y-4">
            {/* Checklist Card */}
            <div className="p-4 bg-warm-50/80 rounded-2xl border border-warm-200/80 space-y-2.5 text-xs">
              <div className="font-semibold text-neutral-800 flex items-center gap-1.5 pb-1 border-b border-warm-200/60">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>Gift Summary</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-neutral-600">
                <div>
                  <span className="text-[11px] text-neutral-400 block">Recipient</span>
                  <span className="font-semibold text-neutral-800">{recipientName}</span>
                </div>
                {occasionName && (
                  <div>
                    <span className="text-[11px] text-neutral-400 block">Occasion</span>
                    <span className="font-semibold text-neutral-800">{occasionName}</span>
                  </div>
                )}
                {templateName && (
                  <div>
                    <span className="text-[11px] text-neutral-400 block">Template</span>
                    <span className="font-semibold text-neutral-800">{templateName}</span>
                  </div>
                )}
                <div>
                  <span className="text-[11px] text-neutral-400 block">Content</span>
                  <span className="font-semibold text-neutral-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>{momentsCount} moments</span>
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed">
              Publishing creates a unique, private link for <strong>{recipientName}</strong>. Optional pages are included when added, and gracefully skipped if empty.
            </p>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-warm-200">
              {giftId ? (
                <a
                  href={`/gift-preview/${giftId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-warm-100 hover:bg-warm-200 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </a>
              ) : (
                <Button type="button" variant="outline" size="sm" onClick={handleClose}>
                  Cancel
                </Button>
              )}

              <div className="flex items-center gap-2">
                {giftId && (
                  <Button type="button" variant="outline" size="sm" onClick={handleClose}>
                    Cancel
                  </Button>
                )}

                <button
                  type="button"
                  onClick={handleConfirmPublish}
                  disabled={publishing}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 shadow-sm transition-all disabled:opacity-60 cursor-pointer"
                >
                  {publishing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing your gift…</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      <span>Publish Gift</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── Published Success Screen ── */
          <div className="space-y-4 animate-fade-in">
            {/* Tab Switcher: Link vs QR Code */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-warm-100 rounded-2xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSuccessTab('link')}
                className={cn(
                  'py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                  successTab === 'link'
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                )}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Share Link</span>
              </button>

              <button
                type="button"
                onClick={() => setSuccessTab('qr')}
                className={cn(
                  'py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                  successTab === 'qr'
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                )}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Code</span>
              </button>
            </div>

            {successTab === 'link' ? (
              <div className="space-y-4 animate-fade-in">
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Send this special link to <strong>{recipientName}</strong> via WhatsApp, SMS, or email:
                </p>

                {/* Public Link Box */}
                <div className="p-3 bg-warm-50 border border-warm-200 rounded-2xl flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-neutral-800 truncate select-all">
                    {publicUrl}
                  </span>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex-shrink-0 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Copy Feedback Announcement */}
                {copyFeedback && (
                  <div
                    aria-live="polite"
                    className="text-xs text-center font-medium text-emerald-600 bg-emerald-50 py-1.5 px-3 rounded-xl border border-emerald-200/60 animate-fade-in"
                  >
                    {copyFeedback}
                  </div>
                )}

                {/* Native Mobile Share Button */}
                {canNativeShare && (
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 shadow-sm transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Share Gift</span>
                  </button>
                )}
              </div>
            ) : (
              <QRCodeCard
                publicSlug={publishedSlug}
                recipientName={recipientName}
                giftTitle={giftTitle}
              />
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-warm-200">
              <Button type="button" variant="outline" size="sm" onClick={handleClose}>
                Done
              </Button>

              <a
                href={`/g/${publishedSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 transition-colors shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Gift</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

