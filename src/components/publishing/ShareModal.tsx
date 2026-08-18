import { useState } from 'react'
import {
  Share2,
  X,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  QrCode,
  Link2,
  Send,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import QRCodeCard from './QRCodeCard'
import { cn } from '@/lib/utils'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  publicSlug: string
  recipientName: string
  giftTitle?: string
  onUnpublishClick?: () => void
}

export default function ShareModal({
  isOpen,
  onClose,
  publicSlug,
  recipientName,
  giftTitle,
  onUnpublishClick,
}: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<'link' | 'qr'>('link')
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

  // Web Share API for mobile devices
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const handleNativeShare = async () => {
    if (!canNativeShare) return

    try {
      await navigator.share({
        title: giftTitle || `A special surprise for ${recipientName} ❤️`,
        text: `Someone made a Giftly surprise for ${recipientName}! Scan or click to open:`,
        url: publicUrl,
      })
    } catch (err: unknown) {
      if ((err as { name?: string }).name !== 'AbortError') {
        console.warn('Native share failed:', err)
      }
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shareModalTitle"
      className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fade-in"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-warm-200 space-y-5 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-warm-200 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="shareModalTitle" className="font-serif text-xl font-bold text-neutral-800">
                Share Your Gift ❤️
              </h2>
              <p className="text-xs text-neutral-500">
                Unique public access for {recipientName}
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

        {/* Tab Switcher: Link vs QR Code */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-warm-100 rounded-2xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('link')}
            className={cn(
              'py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5',
              activeTab === 'link'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            )}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Share Link</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={cn(
              'py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5',
              activeTab === 'qr'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            )}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Code</span>
          </button>
        </div>

        {/* TAB 1: Link & Social Share */}
        {activeTab === 'link' && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-xs text-neutral-600 leading-relaxed">
              Send this special surprise link to {recipientName} via WhatsApp, SMS, or email:
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

            {/* Native Mobile Share Button */}
            {canNativeShare && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 shadow-sm transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Share via WhatsApp / Messaging App</span>
              </button>
            )}
          </div>
        )}

        {/* TAB 2: QR Code */}
        {activeTab === 'qr' && (
          <QRCodeCard
            publicSlug={publicSlug}
            recipientName={recipientName}
            giftTitle={giftTitle}
          />
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-warm-200">
          {onUnpublishClick ? (
            <button
              type="button"
              onClick={() => {
                onClose()
                onUnpublishClick()
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-amber-700 transition-colors"
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
