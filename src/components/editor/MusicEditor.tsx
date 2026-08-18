import React, { useState, useRef } from 'react'
import {
  Music,
  Upload,
  Loader2,
  Trash2,
  AlertCircle,
  X,
  RotateCcw,
  Volume2,
} from 'lucide-react'
import type { GiftMediaItem } from '@/lib/database.types'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface MusicEditorProps {
  audioItem: GiftMediaItem | null
  loading: boolean
  uploading: boolean
  error: string | null
  onUploadMusic: (file: File) => Promise<{ success: boolean; error?: string }>
  onDeleteMusic: () => Promise<{ success: boolean; error?: string }>
}

export default function MusicEditor({
  audioItem,
  loading,
  uploading,
  error,
  onUploadMusic,
  onDeleteMusic,
}: MusicEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showReplaceModal, setShowReplaceModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0])
      e.target.value = ''
    }
  }

  const handleFileSelected = async (file: File) => {
    await onUploadMusic(file)
    setShowReplaceModal(false)
  }

  const handleConfirmDelete = async () => {
    setDeleting(true)
    await onDeleteMusic()
    setDeleting(false)
    setShowDeleteModal(false)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
          <Music className="w-4 h-4 text-rose-500" />
          <span>Background Music Section</span>
        </div>
        <h2 className="font-serif text-2xl font-semibold text-neutral-800">
          Background Soundtrack
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Choose a song to make your surprise feel even more cinematic and emotional (MP3, M4A, AAC, WAV up to 15 MB).
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-sm animate-shake"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1">{error}</div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/m4a,audio/aac,audio/wav,audio/webm"
        onChange={handleFileInputChange}
        className="hidden"
        id="musicFileInput"
      />

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-neutral-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
          <span className="text-xs">Loading music track…</span>
        </div>
      ) : audioItem ? (
        /* Saved Music Track View */
        <div className="bg-white border border-warm-200 rounded-3xl p-6 sm:p-8 shadow-card space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                <Music className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-serif text-base font-semibold text-neutral-800 truncate" title={audioItem.file_name}>
                  {audioItem.file_name}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {audioItem.file_size
                    ? `${(audioItem.file_size / (1024 * 1024)).toFixed(2)} MB`
                    : 'Soundtrack track'}
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 flex-shrink-0">
              Active Track
            </span>
          </div>

          {/* HTML5 Audio Player */}
          <div className="bg-warm-50 p-4 rounded-2xl border border-warm-200">
            {audioItem.signedUrl ? (
              <audio src={audioItem.signedUrl} controls preload="metadata" className="w-full" />
            ) : (
              <div className="text-xs text-neutral-400 text-center py-2 flex items-center justify-center gap-2">
                <Volume2 className="w-4 h-4" />
                <span>Audio stream loading…</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-warm-200">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Music</span>
            </button>

            <button
              type="button"
              onClick={() => setShowReplaceModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:text-rose-600 p-2 rounded-lg hover:bg-warm-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replace Track</span>
            </button>
          </div>
        </div>
      ) : (
        /* Upload Music Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={cn(
            'group relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer',
            isDragging
              ? 'border-rose-500 bg-rose-50/70 scale-[0.99]'
              : 'border-warm-300 hover:border-rose-400 bg-cream-50/60 hover:bg-rose-50/30'
          )}
        >
          <div className="w-14 h-14 bg-white rounded-3xl shadow-sm border border-warm-200 flex items-center justify-center mx-auto mb-3 text-rose-500 group-hover:scale-110 group-hover:text-rose-600 transition-all">
            <Music className="w-6 h-6" />
          </div>

          <h3 className="font-serif text-lg font-semibold text-neutral-800 mb-1">
            Choose an audio track or drag & drop
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-5 leading-relaxed">
            Supports MP3, M4A, AAC, WAV, and WebM audio files up to 15 MB.
          </p>

          <Button
            type="button"
            variant="outline"
            size="md"
            disabled={uploading}
            onClick={(e) => {
              e.stopPropagation()
              fileInputRef.current?.click()
            }}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                <span>Uploading Music…</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload Music</span>
              </>
            )}
          </Button>
        </div>
      )}

      {/* Replace Confirmation Modal */}
      {showReplaceModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-warm-200 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowReplaceModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold text-neutral-800">
                Replace background music?
              </h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Uploading a new audio track will replace your current soundtrack.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => setShowReplaceModal(false)}
              >
                Cancel
              </Button>

              <button
                type="button"
                onClick={() => {
                  setShowReplaceModal(false)
                  fileInputRef.current?.click()
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm"
              >
                <span>Select New File</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-warm-200 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="font-serif text-lg font-semibold text-neutral-800">
                Remove background music?
              </h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Are you sure you want to remove the soundtrack from this gift?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                fullWidth
                disabled={deleting}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Removing…</span>
                  </>
                ) : (
                  <span>Remove</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
