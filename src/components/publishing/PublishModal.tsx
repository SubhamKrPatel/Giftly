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
} from 'lucide-react'
import Button from '@/components/ui/Button'
import QRCodeCard from './QRCodeCard'
import { cn } from '@/lib/utils'

interface PublishModalProps {
  isOpen: boolean
  onClose: () => void
  recipientName: string
  onPublish: () => Promise<{ success: boolean; public_slug?: string; error?: string }>
}

export default function PublishModal({
  isOpen,
  onClose,
  recipientName,
  onPublish,
}: PublishModalProps) {
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
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
        setError(res.error || 'Failed to publish gift.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Publishing failed'
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
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = publicUrl
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy link to clipboard automatically.')
    }
  }

  const handleClose = () => {
    setPublishedSlug(null)
    setError(null)
    setCopied(false)
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
                {publishedSlug ? 'Your Gift is Live! 🎉' : 'Publish Your Gift ❤️'}
              </h2>
              <p className="text-xs text-neutral-500">
                {publishedSlug
                  ? `Ready to share with ${recipientName}`
                  : `Make this surprise visible to ${recipientName}`}
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
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        {/* Content: Confirmation or Success */}
        {!publishedSlug ? (
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Publishing generates a private, unique link. Anyone with this link will be able to open and experience the digital surprise you crafted.
            </p>

            <div className="p-4 bg-warm-50 rounded-2xl border border-warm-200 space-y-1.5 text-xs text-neutral-600">
              <div className="font-semibold text-neutral-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>What happens next:</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-neutral-500 text-[11px]">
                <li>A unique random link (e.g. <code>/g/7kxm4p2q</code>) is generated.</li>
                <li>Your recipient can open it from any phone or browser.</li>
                <li>You can unpublish or edit your gift at any time.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-warm-200">
              <Button type="button" variant="outline" size="sm" onClick={handleClose}>
                Cancel
              </Button>

              <button
                type="button"
                onClick={handleConfirmPublish}
                disabled={publishing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 shadow-sm transition-all disabled:opacity-60"
              >
                {publishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing…</span>
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
        ) : (
          /* Success Screen */
          <div className="space-y-4 animate-fade-in">
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-warm-100 rounded-2xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSuccessTab('link')}
                className={cn(
                  'py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5',
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
                  'py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5',
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
                  Send this special link to <strong>{recipientName}</strong> via WhatsApp, SMS, email, or a letter:
                </p>

                {/* Public Link Box */}
                <div className="p-3 bg-warm-50 border border-warm-200 rounded-2xl flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-neutral-800 truncate select-all">
                    {publicUrl}
                  </span>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex-shrink-0"
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
              </div>
            ) : (
              <QRCodeCard
                publicSlug={publishedSlug}
                recipientName={recipientName}
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
