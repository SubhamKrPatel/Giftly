import { useState } from 'react'
import { AlertTriangle, X, Loader2, AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'

interface UnpublishModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<{ success: boolean; error?: string }>
}

export default function UnpublishModal({
  isOpen,
  onClose,
  onConfirm,
}: UnpublishModalProps) {
  const [unpublishing, setUnpublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setUnpublishing(true)
    setError(null)

    try {
      const res = await onConfirm()
      if (res.success) {
        onClose()
      } else {
        setError(res.error || 'Failed to unpublish gift.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unpublishing failed'
      setError(msg)
    } finally {
      setUnpublishing(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="unpublishModalTitle"
      className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fade-in"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-warm-200 space-y-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-warm-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="unpublishModalTitle" className="font-serif text-xl font-bold text-neutral-800">
                Unpublish Gift
              </h2>
              <p className="text-xs text-neutral-500">
                Revert gift status back to draft
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

        <div className="space-y-4 text-xs sm:text-sm text-neutral-600 leading-relaxed">
          <p>
            Anyone opening the current public link will see a &quot;Gift Not Available&quot; notice.
          </p>
          <p className="text-neutral-500 text-xs">
            You can continue editing in draft mode and republish at any time using the same link.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-warm-200">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={unpublishing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-all disabled:opacity-60"
          >
            {unpublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Unpublishing…</span>
              </>
            ) : (
              <span>Unpublish</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
