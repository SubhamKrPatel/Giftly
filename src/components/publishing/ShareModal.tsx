import { useState } from 'react'
import {
  Share2,
  X,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react'
import Button from '@/components/ui/Button'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  publicSlug: string
  recipientName: string
  onUnpublishClick?: () => void
}

export default function ShareModal({
  isOpen,
  onClose,
  publicSlug,
  recipientName,
  onUnpublishClick,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const publicUrl = `${window.location.origin}/g/${publicSlug}`

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(publicUrl)
      } else {
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
      console.warn('Copy to clipboard failed')
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shareModalTitle"
      className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fade-in"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-warm-200 space-y-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-warm-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="shareModalTitle" className="font-serif text-xl font-bold text-neutral-800">
                Share Your Gift ❤️
              </h2>
              <p className="text-xs text-neutral-500">
                Unique public link for {recipientName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-warm-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Link Box */}
        <div className="space-y-4">
          <p className="text-xs text-neutral-600 leading-relaxed">
            Send this special surprise link to {recipientName} via WhatsApp, message, or email:
          </p>

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

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-warm-200">
          {onUnpublishClick ? (
            <button
              type="button"
              onClick={() => {
                onClose()
                onUnpublishClick()
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-amber-700 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Unpublish</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Done
            </Button>

            <a
              href={`/g/${publicSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 transition-colors shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Gift</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
