import React, { useState, useRef } from 'react'
import {
  Image as ImageIcon,
  Upload,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Trash2,
  AlertCircle,
  X,
} from 'lucide-react'
import type { GiftMediaItem } from '@/lib/database.types'
import { MAX_IMAGES_PER_GIFT } from '@/lib/storage'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface GalleryEditorProps {
  mediaItems: GiftMediaItem[]
  loading: boolean
  uploading: boolean
  uploadProgress: { current: number; total: number; filename: string } | null
  error: string | null
  onUpload: (files: FileList | File[]) => Promise<{ successfulCount: number; errors: string[] }>
  onReorder: (mediaId: string, direction: 'up' | 'down') => Promise<void>
  onDelete: (item: GiftMediaItem) => Promise<{ success: boolean; error?: string }>
}

export default function GalleryEditor({
  mediaItems,
  loading,
  uploading,
  uploadProgress,
  error,
  onUpload,
  onReorder,
  onDelete,
}: GalleryEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<GiftMediaItem | null>(null)
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
      onUpload(e.dataTransfer.files)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files)
      // Reset input so same file can be selected again if needed
      e.target.value = ''
    }
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    setDeleting(true)
    await onDelete(itemToDelete)
    setDeleting(false)
    setItemToDelete(null)
  }

  const canAddMore = mediaItems.length < MAX_IMAGES_PER_GIFT

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            <ImageIcon className="w-4 h-4 text-rose-500" />
            <span>Photo Memories Gallery</span>
          </div>
          <h2 className="font-serif text-2xl font-semibold text-neutral-800">
            Cherished Photos
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Upload favorite moments and memories. They will be displayed in an elegant photo story.
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
            <span>{mediaItems.length} / {MAX_IMAGES_PER_GIFT}</span>
            <span className="hidden sm:inline">Photos</span>
          </span>
        </div>
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

      {/* Upload Progress Banner */}
      {uploading && uploadProgress && (
        <div className="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-4 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-900">
            <span className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
              <span>
                Uploading photo {uploadProgress.current} of {uploadProgress.total}…
              </span>
            </span>
            <span className="truncate max-w-[150px] font-normal text-rose-700">
              {uploadProgress.filename}
            </span>
          </div>
          <div className="w-full h-1.5 bg-rose-200/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-full transition-all duration-300"
              style={{
                width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        id="galleryFileInput"
      />

      {/* Drag & Drop Dropzone */}
      {canAddMore ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={cn(
            'group relative border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-200 cursor-pointer',
            isDragging
              ? 'border-rose-500 bg-rose-50/70 scale-[0.99]'
              : 'border-warm-300 hover:border-rose-400 bg-cream-50/60 hover:bg-rose-50/30'
          )}
        >
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-warm-200 flex items-center justify-center mx-auto mb-3 text-rose-500 group-hover:scale-110 group-hover:text-rose-600 transition-all">
            <Upload className="w-5 h-5" />
          </div>

          <h3 className="font-serif text-base font-semibold text-neutral-800 mb-1">
            Choose photos or drag & drop
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
            Supports JPG, PNG, and WebP up to 10 MB each. You can select multiple images at once.
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={(e) => {
              e.stopPropagation()
              fileInputRef.current?.click()
            }}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Select Photos</span>
          </Button>
        </div>
      ) : (
        <div className="bg-warm-100/70 rounded-2xl p-4 text-center text-xs text-neutral-500">
          You have reached the maximum limit of {MAX_IMAGES_PER_GIFT} photos for this gift.
        </div>
      )}

      {/* Thumbnail Gallery Grid */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-neutral-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
          <span className="text-xs">Loading photos…</span>
        </div>
      ) : mediaItems.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 px-1">
            <span>Uploaded Photos ({mediaItems.length})</span>
            <span className="text-[11px] text-neutral-400">Reorder with arrows</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {mediaItems.map((item, index) => {
              const isFirst = index === 0
              const isLast = index === mediaItems.length - 1

              return (
                <div
                  key={item.id}
                  className="group relative aspect-square bg-warm-100 rounded-2xl overflow-hidden border border-warm-200 shadow-xs hover:shadow-card transition-all"
                >
                  {/* Photo Image */}
                  {item.signedUrl ? (
                    <img
                      src={item.signedUrl}
                      alt={item.file_name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  {/* Position Badge */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold">
                    #{index + 1}
                  </div>

                  {/* Hover Actions Bar */}
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {/* Reorder Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={() => onReorder(item.id, 'up')}
                        className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-neutral-800 flex items-center justify-center shadow-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move earlier"
                        aria-label="Move photo earlier"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        disabled={isLast}
                        onClick={() => onReorder(item.id, 'down')}
                        className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-neutral-800 flex items-center justify-center shadow-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move later"
                        aria-label="Move photo later"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => setItemToDelete(item)}
                      className="w-7 h-7 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white flex items-center justify-center shadow-xs transition-colors"
                      title="Delete photo"
                      aria-label="Delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="py-8 text-center border border-dashed border-warm-200 rounded-3xl p-6 text-neutral-400 text-xs">
          No photos added yet. Upload special pictures from your camera roll or computer!
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="deleteModalTitle"
          className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-warm-200 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 id="deleteModalTitle" className="font-serif text-lg font-semibold text-neutral-800">
                Delete this photo?
              </h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Are you sure you want to remove &quot;{itemToDelete.file_name}&quot; from your gift? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                fullWidth
                disabled={deleting}
                onClick={() => setItemToDelete(null)}
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
                    <span>Deleting…</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
