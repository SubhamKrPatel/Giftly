import { useState } from 'react'
import { Loader2, Trash2, X } from 'lucide-react'

interface DeleteGiftDialogProps {
  isOpen: boolean
  giftTitle: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

export default function DeleteGiftDialog({
  isOpen,
  giftTitle,
  onClose,
  onConfirm,
}: DeleteGiftDialogProps) {
  const [deleting, setDeleting] = useState(false)

  if (!isOpen) return null

  async function handleConfirm() {
    setDeleting(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-warm-200 shadow-card animate-scale-in relative">
        {/* Close X */}
        <button
          onClick={onClose}
          disabled={deleting}
          className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-600 p-1.5 rounded-lg hover:bg-warm-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon */}
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6" />
        </div>

        {/* Text */}
        <h3
          id="delete-dialog-title"
          className="font-serif text-xl font-semibold text-neutral-800 mb-2"
        >
          Delete this gift?
        </h3>
        <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
          Are you sure you want to permanently delete{' '}
          <strong className="text-neutral-800 font-semibold">{giftTitle || 'this gift'}</strong>?
          This action cannot be undone.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-5 py-2.5 rounded-full text-sm font-semibold text-neutral-600 hover:bg-warm-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-glow disabled:opacity-60"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting…</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Gift</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
